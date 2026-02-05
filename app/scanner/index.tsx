import { CameraView, useCameraPermissions } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import {
  AppState,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  Pressable,
  Alert,
  View,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { databaseService } from "@/src/config/databaseService";
import Overlay from "./Overlay";

// Obtener dimensiones de la pantalla
const { width, height } = Dimensions.get("window");

export default function ScannerScreen() {
  const router = useRouter();
  const qrLock = useRef(false);
  const [cameraType, setCameraType] = useState<"front" | "back">("back");
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [ticketStatus, setTicketStatus] = useState<"pending" | "valid" | "already_validated" | "not_found">("pending");
  const appState = useRef(AppState.currentState);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current?.match(/inactive|background/) && nextAppState === "active") {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const processQRCode = async (qrId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setTicketData(null);

    try {
      // Buscar el ticket en la base de datos
      const ticket = await databaseService.getTicketByQRId(qrId.trim());

      if (!ticket) {
        // Ticket no encontrado
        setTicketStatus("not_found");
        setErrorMessage(`❌ QR ID "${qrId}" no existe en el sistema`);
        setIsLoading(false);
        Alert.alert("No Encontrado", `El código QR "${qrId}" no existe en la base de datos.`, [
          { text: "OK", onPress: () => qrLock.current = false },
        ]);
        return;
      }

      // Formatear datos del ticket para mostrar
      const formattedData = databaseService.formatTicketData(ticket);
      setTicketData(formattedData);

      // Verificar si ya fue validado
      if (ticket.validated) {
        setTicketStatus("already_validated");
        setErrorMessage("⚠️ Este ticket ya ha sido escaneado");
        setIsLoading(false);
        Alert.alert(
          "Ticket Ya Validado",
          `Este ticket para ${ticket.first_name} ${ticket.last_name} ya fue escaneado en ${
            ticket.validated_at ? new Date(ticket.validated_at).toLocaleString("es-ES") : "fecha desconocida"
          }.\n\nDatos del ticket mostrados en pantalla.`,
          [{ text: "OK", onPress: () => qrLock.current = false }]
        );
        return;
      }

      // Validar el ticket
      await databaseService.validateTicket(qrId.trim());

      setTicketStatus("valid");
      setLastScanned(ticket.first_name && ticket.last_name ? `${ticket.first_name} ${ticket.last_name}` : "Ticket Validado");
      setIsLoading(false);

      Alert.alert(
        "✓ Ticket Validado",
        `El ticket para ${ticket.first_name} ${ticket.last_name} ha sido validado correctamente.\n\nDatos del ticket mostrados en pantalla.`,
        [{ text: "OK", onPress: () => qrLock.current = false }]
      );
    } catch (error) {
      console.error("Error al procesar QR:", error);
      setTicketStatus("not_found");
      setErrorMessage("Error al procesar el código QR");
      setIsLoading(false);
      Alert.alert("Error", "Ocurrió un error al procesar el código QR", [
        { text: "OK", onPress: () => qrLock.current = false },
      ]);
    }
  };

  const getStatusColor = () => {
    switch (ticketStatus) {
      case "valid":
        return "#4CAF50";
      case "already_validated":
        return "#FFC107";
      case "not_found":
        return "#F44336";
      default:
        return "#2196F3";
    }
  };

  const getStatusText = () => {
    switch (ticketStatus) {
      case "valid":
        return "✓ VALIDADO";
      case "already_validated":
        return "⚠ YA VALIDADO";
      case "not_found":
        return "✗ NO ENCONTRADO";
      default:
        return "";
    }
  };

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen options={{ title: "Scanner de Tickets", headerShown: false }} />
      <StatusBar hidden />

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={cameraType}
        onBarcodeScanned={({ data }) => {
          if (data && !qrLock.current && !isLoading) {
            qrLock.current = true;
            setErrorMessage(null);
            processQRCode(data.trim());
          }
        }}
      />

      {/* Overlay visual */}
      <View style={styles.fullScreenOverlay}>
        <Overlay />
      </View>

      {/* Información de estatus */}
      {ticketStatus !== "pending" && (
        <View style={[styles.statusContainer, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {lastScanned && <Text style={styles.lastScannedText}>{lastScanned}</Text>}
          {errorMessage && ticketStatus === "not_found" && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
        </View>
      )}

      {/* Mostrar datos del ticket */}
      {ticketData && (
        <View style={styles.ticketDataContainer}>
          <View style={styles.ticketDataScrollContainer}>
            <ScrollView nestedScrollEnabled={true} style={styles.ticketScroll}>
              <View style={styles.ticketDataContent}>
                <Text style={styles.ticketDataTitle}>📋 DATOS DEL TICKET</Text>
                {Object.entries(ticketData).map(([key, value]) => (
                  <View key={key} style={styles.ticketDataRow}>
                    <Text style={styles.ticketDataLabel}>{key}:</Text>
                    <Text style={styles.ticketDataValue}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Mostrar mensaje de error general */}
      {errorMessage && ticketStatus === "pending" && (
        <View style={styles.infoContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          {isLoading && <ActivityIndicator size="large" color="#FFD700" />}
        </View>
      )}

      {/* Botones de control */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => setCameraType(cameraType === "back" ? "front" : "back")}
          style={styles.switchButton}
        >
          <Text style={styles.switchText}>Cambiar Cámara</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  statusContainer: {
    position: "absolute",
    top: height * 0.1,
    left: width * 0.05,
    right: width * 0.05,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    zIndex: 10,
    elevation: 5,
  },
  statusText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  lastScannedText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  errorText: {
    color: "#FFB6C1",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  ticketDataContainer: {
    position: "absolute",
    bottom: height * 0.18,
    left: width * 0.02,
    right: width * 0.02,
    maxHeight: height * 0.35,
    backgroundColor: "rgba(30, 30, 30, 0.95)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFD700",
    zIndex: 10,
    elevation: 5,
  },
  ticketDataScrollContainer: {
    flex: 1,
    padding: 10,
  },
  ticketScroll: {
    flex: 1,
  },
  ticketDataContent: {
    paddingBottom: 10,
  },
  ticketDataTitle: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  ticketDataRow: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  ticketDataLabel: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "bold",
  },
  ticketDataValue: {
    color: "white",
    fontSize: 13,
    marginTop: 4,
  },
  infoContainer: {
    position: "absolute",
    bottom: height * 0.18,
    left: width * 0.05,
    right: width * 0.05,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    zIndex: 9,
  },
  buttonContainer: {
    position: "absolute",
    bottom: height * 0.02,
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    paddingHorizontal: width * 0.05,
    zIndex: 2,
  },
  switchButton: {
    backgroundColor: "#0E7AFE",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.08,
    borderRadius: 8,
    minWidth: width * 0.35,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    backgroundColor: "#B22222",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.08,
    borderRadius: 8,
    minWidth: width * 0.35,
    alignItems: "center",
    justifyContent: "center",
  },
  switchText: {
    color: "white",
    fontSize: height * 0.018,
    fontWeight: "bold",
    textAlign: "center",
  },
  backText: {
    color: "white",
    fontSize: height * 0.018,
    fontWeight: "bold",
    textAlign: "center",
  },
});
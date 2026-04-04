import { CameraView, useCameraPermissions } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import {
  AppState,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  Pressable,
  View,
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { databaseService } from "@/src/config/databaseService";
import { useEvent } from "@/src/context/EventContext";
import { supabase } from "@/src/config/supabase";
import Overlay from "./Overlay";
import { Audio } from "expo-av";

// Obtener dimensiones de la pantalla con responsividad
const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 375; // iPhone SE, pequeños Android
const isMediumScreen = width >= 375 && width < 414; // iPhone 12-15 normal
const isLargeScreen = width >= 414; // iPhone Plus, Android grandes

// Función para escalar tamaños según dispositivo
const scale = (size: number): number => {
  if (isSmallScreen) return size * 0.9;
  if (isLargeScreen) return size * 1.1;
  return size;
};

// Función para validar formato UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Función para limpiar y formatear UUID
const cleanUUID = (uuid: string): string => {
  let cleaned = uuid.trim();
  
  if (cleaned.length === 32 && !cleaned.includes('-')) {
    cleaned = [
      cleaned.substring(0, 8),
      cleaned.substring(8, 12),
      cleaned.substring(12, 16),
      cleaned.substring(16, 20),
      cleaned.substring(20, 32)
    ].join('-').toLowerCase();
  }
  
  return cleaned.toLowerCase();
};

export default function ScannerScreen() {
  const router = useRouter();
  const { eventKey } = useEvent();
  const qrLock = useRef(false);
  const [cameraType, setCameraType] = useState<"front" | "back">("back");
  const [isLoading, setIsLoading] = useState(false);
  const [scannedQRCode, setScannedQRCode] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    title: string;
    message?: string;
    ticketData?: any;
    isAlreadyValidated: boolean;
    validationTime?: string;
  } | null>(null);
  
  const appState = useRef(AppState.currentState);
  const [permission, requestPermission] = useCameraPermissions();

  // Referencias para sonidos precargados
  const successSound = useRef<Audio.Sound | null>(null);
  const warningSound = useRef<Audio.Sound | null>(null);
  const errorSound = useRef<Audio.Sound | null>(null);

  // 🔊 CONFIGURACIÓN DE AUDIO + PRECARGA
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          staysActiveInBackground: false,
        });

        // Crear instancias de sonido
        successSound.current = new Audio.Sound();
        warningSound.current = new Audio.Sound();
        errorSound.current = new Audio.Sound();

        // Cargar sonidos desde assets locales
        await successSound.current.loadAsync(
          require("@/assets/sounds/success.mp3")
        );
        await warningSound.current.loadAsync(
          require("@/assets/sounds/warning.mp3")
        );
        await errorSound.current.loadAsync(
          require("@/assets/sounds/error.mp3")
        );
      } catch (error) {
        console.log("Error configurando audio:", error);
        
        // Fallback a sonidos en línea si los locales no están disponibles
        try {
          successSound.current = new Audio.Sound();
          warningSound.current = new Audio.Sound();
          errorSound.current = new Audio.Sound();
          
          await successSound.current.loadAsync(
            { uri: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3' }
          );
          await warningSound.current.loadAsync(
            { uri: 'https://assets.mixkit.co/sfx/preview/mixkit-warning-alarm-buzzer-1551.mp3' }
          );
          await errorSound.current.loadAsync(
            { uri: 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3' }
          );
        } catch (fallbackError) {
          console.log("Error cargando sonidos de fallback:", fallbackError);
        }
      }
    };

    setupAudio();

    return () => {
      successSound.current?.unloadAsync();
      warningSound.current?.unloadAsync();
      errorSound.current?.unloadAsync();
    };
  }, []);

  // Función para reproducir sonidos diferenciados
  const playSound = async (type: 'success' | 'warning' | 'error') => {
    try {
      const soundMap = {
        success: successSound.current,
        warning: warningSound.current,
        error: errorSound.current,
      };

      const sound = soundMap[type];
      if (!sound) return;

      await sound.replayAsync();
    } catch (err) {
      console.log("Error reproduciendo sonido:", err);
      
      // Fallback: usar vibración si hay error con el sonido
      if (Platform.OS !== 'web') {
        try {
          const { Vibration } = await import('react-native');
          // Patrones de vibración diferenciados
          const patterns = {
            success: [0, 100],
            warning: [0, 200, 100, 100],
            error: [0, 300, 100, 200, 100, 100]
          };
          Vibration.vibrate(patterns[type]);
        } catch (vibrateError) {
          console.log("No se pudo usar vibración:", vibrateError);
        }
      }
    }
  };

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

  useEffect(() => {
    const checkTicketsConnection = async () => {
      console.log("Scanner iniciado");
      try {
        const { count, error } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error("Error conexión:", error);
          return;
        }

        console.log("Conexión a Supabase OK");
        console.log("Total tickets:", count);
      } catch (error) {
        console.error("Error conexión:", error);
      }
    };

    checkTicketsConnection();
  }, []);

  const showModal = (title: string, ticketData: any, isAlreadyValidated: boolean = false, validationTime?: string) => {
    const formattedValidationTime = validationTime ? new Date(validationTime).toLocaleString("es-ES") : undefined;
    
    setModalData({
      title,
      ticketData,
      isAlreadyValidated,
      validationTime: formattedValidationTime
    });
    setModalVisible(true);
  };

  const showErrorModal = (title: string, message: string) => {
    setModalData({
      title,
      message,
      isAlreadyValidated: false
    });
    setModalVisible(true);
  };

  const resetScanner = () => {
    setModalVisible(false);
    setModalData(null);
    qrLock.current = false;
    setIsLoading(false);
  };

  const processQRCode = async (qrId: string) => {
    if (qrLock.current || isLoading) return;
    
    qrLock.current = true;
    setIsLoading(true);
    setScannedQRCode(qrId);

    try {
      const cleanedUUID = cleanUUID(qrId);
      console.log("QR:", qrId);
      
      if (!isValidUUID(cleanedUUID)) {
        await playSound('error');
        showErrorModal(
          "Error de lectura QR", 
          "No se pudo leer el código QR"
        );
        return;
      }

      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('qr_id', cleanedUUID)
        .single();

      console.log("Ticket encontrado:", ticket ? "SI" : "NO");

      if (error) {
        if (error.code === 'PGRST116') {
          await playSound('error');
          showErrorModal(
            "Ticket no válido o no existe", 
            "Ticket no válido o no existe"
          );
          return;
        }

        const message = String(error.message || '');
        if (message.toLowerCase().includes('network')) {
          await playSound('error');
          showErrorModal(
            "Sin conexión a la base de datos", 
            "Sin conexión a la base de datos"
          );
          return;
        }

        console.error("Error buscando ticket:", error);
        await playSound('error');
        showErrorModal(
          "Error al validar ticket", 
          "Error al validar ticket"
        );
        return;
      }

      if (!ticket) {
        await playSound('error');
        showErrorModal(
          "Ticket no válido o no existe", 
          "Ticket no válido o no existe"
        );
        return;
      }

      // 🔥 FILTRO POR EVENTO: Validar que el ticket pertenece a este evento
      if (eventKey && !ticket.sku.startsWith(eventKey)) {
        let eventName = 'otro evento';
        try {
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('name')
            .eq('sku', ticket.sku.split('-').slice(0, 3).join('-'))
            .single();

          if (!eventError && eventData?.name) {
            eventName = eventData.name;
          }
        } catch (err) {
          console.error('Error fetching event name:', err);
        }

        await playSound('error');
        showErrorModal(
          "Evento incorrecto",
          eventName === 'otro evento'
            ? "Este ticket pertenece a otro evento"
            : `Este ticket pertenece a: ${eventName}`
        );
        return;
      }

      const formattedTicketData = {
        'QR ID': ticket.qr_id,
        'Nombre': `${ticket.first_name || ''} ${ticket.last_name || ''}`.trim() || 'N/A',
        'RUT': ticket.rut || 'N/A',
        'Email': ticket.email || 'N/A',
        'Teléfono': ticket.phone || 'N/A',
        'Número de orden': ticket.order_id || 'N/A',
        'Tipo de entrada': ticket.sku || 'N/A',
        'Cantidad comprada en la orden': ticket.quantity ?? 'N/A',
        'Fecha de compra': ticket.created_at ? new Date(ticket.created_at).toLocaleString('es-ES') : 'N/A',
      };

      if (ticket.validated) {
        await playSound('warning');
        showModal(
          "Ticket Ya Validado",
          formattedTicketData,
          true,
          ticket.validated_at
        );
        return;
      }

      await databaseService.validateTicket(cleanedUUID);
      await playSound('success');
      
      showModal(
        "✓ Ticket Validado",
        formattedTicketData,
        false
      );
      
    } catch (error) {
      console.error("Error al procesar QR:", error);
      await playSound('error');
      showErrorModal(
        "Error", 
        "Ocurrió un error al procesar el código QR"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Se necesita permiso para usar la cámara</Text>
        <Pressable onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Conceder Permiso</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen options={{ title: "Scanner de Tickets", headerShown: false }} />
      <StatusBar hidden />

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={cameraType}
        onBarcodeScanned={({ data }) => {
          if (data && !qrLock.current && !isLoading) {
            processQRCode(data);
          }
        }}
      />

      {/* Overlay visual */}
      <View style={styles.fullScreenOverlay}>
        <Overlay />
      </View>

      {/* Indicador de último QR escaneado */}
      {scannedQRCode && (
        <View style={styles.qrIndicator}>
          <Text style={styles.qrIndicatorText} numberOfLines={1}>
            Último QR: {scannedQRCode.substring(0, isSmallScreen ? 16 : 24)}...
          </Text>
        </View>
      )}

      {/* Indicador de carga */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Procesando código QR...</Text>
        </View>
      )}

      {/* Modal de resultados */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetScanner}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {modalData && (
              <>
                {/* Header del modal */}
                <View style={[
                  styles.modalHeader,
                  { 
                    backgroundColor: modalData.isAlreadyValidated ? "#FFA000" : "#4CAF50",
                    borderColor: modalData.isAlreadyValidated ? "#FF8C00" : "#388E3C"
                  }
                ]}>
                  <Text style={styles.modalTitle}>{modalData.title}</Text>
                  {modalData.message ? (
                    <Text style={styles.modalMessage}>{modalData.message}</Text>
                  ) : modalData.validationTime && modalData.isAlreadyValidated ? (
                    <Text style={styles.validationTime}>
                      Ya fue escaneado el: {modalData.validationTime}
                    </Text>
                  ) : null}
                </View>

                {/* Contenido del modal */}
                <ScrollView 
                  style={styles.modalContent}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.modalContentContainer}
                >
                  {modalData.ticketData ? (
                    <>
                      <Text style={styles.sectionTitle}>📋 DATOS DEL TICKET</Text>
                      {Object.entries(modalData.ticketData).map(([key, value]) => (
                        <View key={key} style={styles.dataRow}>
                          <Text style={styles.dataLabel}>{key}:</Text>
                          <Text style={styles.dataValue} numberOfLines={2}>
                            {String(value)}
                          </Text>
                        </View>
                      ))}
                    </>
                  ) : modalData.message ? (
                    <View style={styles.errorContent}>
                      <Text style={styles.errorIcon}>❌</Text>
                      <Text style={styles.errorMessage}>{modalData.message}</Text>
                    </View>
                  ) : null}
                </ScrollView>

                {/* Botón de cerrar */}
                <View style={styles.modalFooter}>
                  <Pressable
                    onPress={resetScanner}
                    style={styles.modalButton}
                  >
                    <Text style={styles.modalButtonText}>
                      {modalData.isAlreadyValidated ? 'CONTINUAR' : 'OK'}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: scale(20),
  },
  permissionText: {
    fontSize: scale(18),
    textAlign: 'center',
    marginBottom: scale(20),
    paddingHorizontal: scale(10),
    lineHeight: scale(24),
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: scale(20),
    paddingVertical: scale(12),
    borderRadius: scale(8),
    minWidth: scale(180),
  },
  permissionButtonText: {
    color: 'white',
    fontSize: scale(16),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  qrIndicator: {
    position: "absolute",
    top: height * 0.05,
    left: width * 0.05,
    right: width * 0.05,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: scale(10),
    borderRadius: scale(8),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2196F3",
    maxWidth: "90%",
    alignSelf: "center",
  },
  qrIndicatorText: {
    color: "#90EE90",
    fontSize: scale(12),
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingContainer: {
    position: "absolute",
    top: height * 0.15,
    left: width * 0.1,
    right: width * 0.1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: scale(20),
    borderRadius: scale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "white",
    fontSize: scale(16),
    marginTop: scale(10),
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: scale(15),
  },
  modalContainer: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: "white",
    borderRadius: scale(15),
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    minHeight: isSmallScreen ? height * 0.4 : height * 0.3,
  },
  modalHeader: {
    padding: scale(isSmallScreen ? 15 : 20),
    alignItems: "center",
    borderBottomWidth: 2,
  },
  modalTitle: {
    color: "white",
    fontSize: scale(isSmallScreen ? 18 : 22),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: scale(5),
    lineHeight: scale(isSmallScreen ? 24 : 28),
  },
  modalMessage: {
    color: "white",
    fontSize: scale(isSmallScreen ? 12 : 14),
    textAlign: "center",
    opacity: 0.9,
    lineHeight: scale(18),
    paddingHorizontal: scale(5),
  },
  validationTime: {
    color: "white",
    fontSize: scale(isSmallScreen ? 12 : 14),
    fontWeight: "bold",
    textAlign: "center",
    marginTop: scale(5),
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: scale(10),
    paddingVertical: scale(3),
    borderRadius: scale(5),
    lineHeight: scale(18),
  },
  modalContent: {
    maxHeight: height * (isSmallScreen ? 0.4 : 0.5),
  },
  modalContentContainer: {
    padding: scale(isSmallScreen ? 15 : 20),
  },
  sectionTitle: {
    fontSize: scale(isSmallScreen ? 14 : 16),
    fontWeight: "bold",
    color: "#333",
    marginBottom: scale(15),
    textAlign: "center",
    lineHeight: scale(20),
  },
  dataRow: {
    marginBottom: scale(12),
    paddingBottom: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    minHeight: scale(40),
  },
  dataLabel: {
    fontSize: scale(isSmallScreen ? 12 : 14),
    fontWeight: "bold",
    color: "#555",
    marginBottom: scale(4),
    lineHeight: scale(18),
  },
  dataValue: {
    fontSize: scale(isSmallScreen ? 13 : 15),
    color: "#333",
    lineHeight: scale(20),
    flexShrink: 1,
  },
  errorContent: {
    alignItems: "center",
    paddingVertical: scale(20),
    paddingHorizontal: scale(10),
  },
  errorIcon: {
    fontSize: scale(40),
    marginBottom: scale(15),
  },
  errorMessage: {
    fontSize: scale(isSmallScreen ? 14 : 16),
    color: "#333",
    textAlign: "center",
    lineHeight: scale(22),
  },
  modalFooter: {
    padding: scale(isSmallScreen ? 15 : 20),
    backgroundColor: "#F5F5F5",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  modalButton: {
    backgroundColor: "#2196F3",
    paddingVertical: scale(14),
    borderRadius: scale(8),
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: scale(16),
    fontWeight: "bold",
    lineHeight: scale(20),
  },
  buttonContainer: {
    position: "absolute",
    bottom: height * (isSmallScreen ? 0.02 : 0.03),
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: width * (isSmallScreen ? 0.05 : 0.1),
    gap: scale(10),
  },
  switchButton: {
    backgroundColor: "#0E7AFE",
    paddingVertical: scale(isSmallScreen ? 12 : 14),
    paddingHorizontal: scale(isSmallScreen ? 15 : 20),
    borderRadius: scale(8),
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minHeight: scale(50),
  },
  backButton: {
    backgroundColor: "#B22222",
    paddingVertical: scale(isSmallScreen ? 12 : 14),
    paddingHorizontal: scale(isSmallScreen ? 15 : 20),
    borderRadius: scale(8),
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minHeight: scale(50),
  },
  switchText: {
    color: "white",
    fontSize: scale(isSmallScreen ? 14 : 16),
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: scale(20),
  },
  backText: {
    color: "white",
    fontSize: scale(isSmallScreen ? 14 : 16),
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: scale(20),
  },
});
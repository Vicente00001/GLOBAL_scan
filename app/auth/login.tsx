import { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  Image, 
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "@/src/config/authService";
import { databaseService } from "@/src/config/databaseService";
import { useEvent } from "@/src/context/EventContext";

// Obtener dimensiones de la pantalla para responsividad
const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 414;
const isLargeScreen = width >= 414;

// Función para escalar tamaños según dispositivo
const scale = (size: number): number => {
  if (isSmallScreen) return size * 0.85;
  if (isLargeScreen) return size * 1.15;
  return size;
};

export default function LoginScreen() {
  const router = useRouter();
  const { setEventKey } = useEvent();
  const [eventKeyInput, setEventKeyInput] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEmail = async () => {
      const savedEmail = await AsyncStorage.getItem("lastEmail");
      if (savedEmail) {
        setEmail(savedEmail);
      }
    };
    loadEmail();
  }, []);

  const handleLogin = async () => {
    if (!eventKeyInput || !email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // 1. Validar que el eventKey existe en la tabla events
      const event = await databaseService.validateEventKey(eventKeyInput);
      if (!event) {
        setError("Evento no válido");
        setLoading(false);
        return;
      }

      // 2. Hacer login con Supabase Auth
      await authService.login(email, password);

      // 3. Guardar eventKey globalmente
      await setEventKey(eventKeyInput);

      // 4. Guardar token de sesión
      await AsyncStorage.setItem("userToken", "authenticated");
      await AsyncStorage.setItem("lastEmail", email);

      router.replace("/");

    } catch (err) {
      setError("Correo o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };;

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? scale(40) : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Image 
              source={require("@/assets/images/planetagm.png")} 
              style={styles.logo} 
            />
            
            <Text style={styles.appTitle}>
              Escáner de Tickets{"\n"}Global Music Producciones
            </Text>
            
            <Text style={styles.title}>Iniciar sesión</Text>
            
            {error ? <Text style={styles.error}>{error}</Text> : null}
            
            <TextInput
              style={styles.input}
              placeholder="Código del Evento (ej: CAL-20260327-N)"
              placeholderTextColor="#CCCCCC"
              value={eventKeyInput}
              onChangeText={setEventKeyInput}
              editable={!loading}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="next"
              blurOnSubmit={false}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#CCCCCC"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!loading}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              blurOnSubmit={false}
            />
            
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Contraseña"
                placeholderTextColor="#CCCCCC"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <Pressable 
                style={styles.eyeButton}
                onPress={toggleShowPassword}
                disabled={loading}
              >
                <Text style={styles.eyeIcon}>
                  {showPassword ? "🙈" : "👁️"}
                </Text>
              </Pressable>
            </View>
            
            <Pressable 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
              )}
            </Pressable>
            
            {Platform.OS === "android" && <View style={styles.spacer} />}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: scale(20),
    minHeight: height,
  },
  content: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: scale(20),
    paddingBottom: scale(50),
  },
  logo: {
    width: scale(isSmallScreen ? 120 : isLargeScreen ? 180 : 150),
    height: scale(isSmallScreen ? 120 : isLargeScreen ? 180 : 150),
    marginBottom: scale(20),
    resizeMode: "contain",
  },
  appTitle: {
    color: "white",
    fontSize: scale(isSmallScreen ? 22 : isLargeScreen ? 34 : 28),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: scale(20),
    lineHeight: scale(isSmallScreen ? 28 : isLargeScreen ? 42 : 36),
  },
  title: {
    color: "white",
    fontSize: scale(isSmallScreen ? 20 : isLargeScreen ? 28 : 24),
    fontWeight: "bold",
    marginBottom: scale(20),
    textAlign: "center",
  },
  error: {
    color: "#FF6B6B",
    marginBottom: scale(15),
    fontSize: scale(14),
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: scale(20),
    lineHeight: scale(20),
  },
  input: {
    width: isSmallScreen ? "90%" : isLargeScreen ? "70%" : "80%",
    padding: scale(isSmallScreen ? 12 : 15),
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#FFFFFF",
    marginBottom: scale(15),
    borderRadius: scale(8),
    fontSize: scale(isSmallScreen ? 14 : 16),
    minHeight: scale(50),
  },
  passwordContainer: {
    width: isSmallScreen ? "90%" : isLargeScreen ? "70%" : "80%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(15),
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    padding: scale(isSmallScreen ? 12 : 15),
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#FFFFFF",
    borderRadius: scale(8),
    fontSize: scale(isSmallScreen ? 14 : 16),
    minHeight: scale(50),
    paddingRight: scale(50),
  },
  eyeButton: {
    position: "absolute",
    right: scale(12),
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: scale(8),
  },
  eyeIcon: {
    fontSize: scale(20),
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingVertical: scale(12),
    paddingHorizontal: scale(30),
    borderRadius: scale(8),
    marginTop: scale(10),
    width: isSmallScreen ? "90%" : isLargeScreen ? "70%" : "80%",
    alignItems: "center",
    justifyContent: "center",
    minHeight: scale(50),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#000000",
    fontSize: scale(isSmallScreen ? 16 : 18),
    fontWeight: "bold",
    textAlign: "center",
  },
  spacer: {
    height: scale(100),
  },
});

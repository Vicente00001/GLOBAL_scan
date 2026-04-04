import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "@/src/config/authService";
import { EventProvider } from "@/src/context/EventContext";

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const logged = !!token;
        setIsLoggedIn(logged);
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Escuchar cambios de autenticación en tiempo real
    const unsubscribe = authService.onAuthStateChanged((user) => {
      console.log("Estado de autenticación cambió:", user ? "Logueado" : "No logueado");
      if (user) {
        setIsLoggedIn(true);
        AsyncStorage.setItem("userToken", "authenticated");
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading || isLoggedIn === null) return;

    const inAuthGroup = segments[0] === "auth";

    // Si no está logueado, redirigir a login
    if (!isLoggedIn) {
      if (!inAuthGroup) {
        router.replace("/auth/login");
      }
    } else {
      // Si está logueado y está en auth, redirigir a home
      if (inAuthGroup) {
        router.replace("/");
      }
    }

  }, [isLoggedIn, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ color: "#fff", marginTop: 16 }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <EventProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </EventProvider>
  );
}

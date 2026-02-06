import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
//import { authService } from "@/src/config/authService";
import { Text, View } from "react-native"; 

export default function Layout() {
  const router = useRouter();
  //const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SIMULA carga sin autenticación
    const timer = setTimeout(() => {
      setLoading(false);
      // router.replace("/auth/login"); // DESCOMENTA si quieres ir al login
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}


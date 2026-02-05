import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { authService } from "@/src/config/authService";

export default function Layout() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión al cargar
    const checkSession = async () => {
      try {
        const session = await authService.getSession();
        if (!session) {
          router.replace("/auth/login");
        } else {
          setUser(session.user);
        }
      } catch (error) {
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escuchar cambios de autenticación
    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/auth/login");
      } else {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return null; // O puedes mostrar una pantalla de carga
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

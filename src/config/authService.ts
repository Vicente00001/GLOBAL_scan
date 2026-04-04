import { supabase } from '@/src/config/supabase';

export const authService = {
  // Login con email y contraseña
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Signup / Registro
  async signup(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    // ⚠️ CRUCIAL: Borrar el token de AsyncStorage para que el guard rediriga a login
    try {
      await require("@react-native-async-storage/async-storage").default.removeItem("userToken");
      await require("@react-native-async-storage/async-storage").default.removeItem("eventKey");
    } catch (e) {
      console.error("Error borrando datos:", e);
    }
  },

  // Obtener el usuario actual
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return data.user;
  },

  // Obtener la sesión actual
  async getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return null;
    }

    return data.session;
  },

  // Escuchar cambios de autenticación
  onAuthStateChanged(callback: (user: any) => void) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  },
};

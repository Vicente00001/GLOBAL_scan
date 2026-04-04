import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EventContextType {
  eventKey: string | null;
  setEventKey: (key: string) => Promise<void>;
  clearEventKey: () => Promise<void>;
  isLoading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [eventKey, setEventKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar eventKey al iniciar
  useEffect(() => {
    const loadEventKey = async () => {
      try {
        const saved = await AsyncStorage.getItem('eventKey');
        setEventKeyState(saved);
      } catch (error) {
        console.error('Error cargando eventKey:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEventKey();
  }, []);

  const setEventKey = async (key: string) => {
    try {
      await AsyncStorage.setItem('eventKey', key);
      setEventKeyState(key);
    } catch (error) {
      console.error('Error guardando eventKey:', error);
      throw error;
    }
  };

  const clearEventKey = async () => {
    try {
      await AsyncStorage.removeItem('eventKey');
      setEventKeyState(null);
    } catch (error) {
      console.error('Error borrando eventKey:', error);
      throw error;
    }
  };

  return (
    <EventContext.Provider value={{ eventKey, setEventKey, clearEventKey, isLoading }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent debe usarse dentro de EventProvider');
  }
  return context;
}

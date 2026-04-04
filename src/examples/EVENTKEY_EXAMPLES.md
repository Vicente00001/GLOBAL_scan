/**
 * EJEMPLOS DE USO DE EVENTKEY CON useEvent()
 * 
 * Estos son ejemplos de cómo usar eventKey en diferentes componentes
 */

// ============================================
// EJEMPLO 1: Mostrar el evento actual
// ============================================

import { useEvent } from "@/src/context/EventContext";
import { View, Text } from "react-native";

export function CurrentEventDisplay() {
  const { eventKey, isLoading } = useEvent();

  if (isLoading) {
    return <Text>Cargando...</Text>;
  }

  return (
    <View>
      <Text>Evento actual: {eventKey || "No seleccionado"}</Text>
    </View>
  );
}

// ============================================
// EJEMPLO 2: Cambiar evento (ej: menú de cambio)
// ============================================

export async function HandlerChangeEvent(newEventKey: string) {
  const { setEventKey } = useEvent();
  
  try {
    await setEventKey(newEventKey);
    console.log("Evento actualizado a:", newEventKey);
  } catch (error) {
    console.error("Error al cambiar evento:", error);
  }
}

// ============================================
// EJEMPLO 3: Limpiar evento (logout)
// ============================================

export async function HandleLogoutEvent() {
  const { clearEventKey } = useEvent();
  
  try {
    await clearEventKey();
    console.log("Evento limpiado");
  } catch (error) {
    console.error("Error al limpiar evento:", error);
  }
}

// ============================================
// EJEMPLO 4: Validar ticket contra evento
// ============================================

import { databaseService } from "@/src/config/databaseService";

export async function ValidateTicketForEvent(qrId: string) {
  const { eventKey } = useEvent();
  
  try {
    const ticket = await databaseService.getTicketByQRId(qrId);
    
    if (!ticket) {
      return { valid: false, error: "Ticket no encontrado" };
    }

    // Validar que el ticket pertenece al evento
    if (eventKey && !ticket.sku.startsWith(eventKey)) {
      return { valid: false, error: "Ticket no pertenece a este evento" };
    }

    return { valid: true, ticket };
    
  } catch (error) {
    return { valid: false, error: String(error) };
  }
}

// ============================================
// EJEMPLO 5: Componente con useEvent completo
// ============================================

function EventInfoComponent() {
  const { eventKey, isLoading, setEventKey, clearEventKey } = useEvent();

  const handleUpdateEvent = async () => {
    try {
      await setEventKey("CAL-20260401-N");
      console.log("Evento actualizado");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (isLoading) return <Text>Cargando...</Text>;

  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        Evento: {eventKey || "Sin seleccionar"}
      </Text>
      <Pressable onPress={handleUpdateEvent}>
        <Text>Cambiar Evento</Text>
      </Pressable>
    </View>
  );
}

// ============================================
// FLUJO COMPLETO DE AUTHENTICACIÓN
// ============================================

/**
 * LOGIN (app/auth/login.tsx):
 * 1. Usuario ingresa eventKey (ej: CAL-20260327-N)
 * 2. Se valida en tabla "events"
 * 3. Se busca evento en BD ✓
 * 4. Se valida email/password en Supabase Auth ✓
 * 5. Se guarda eventKey en contexto + AsyncStorage
 * 6. Se redirije a / (home)
 * 
 * SCANNER (app/scanner/index.tsx):
 * 1. Se obtiene eventKey desde contexto
 * 2. Usuario escanea QR (qr_id)
 * 3. Se busca ticket por qr_id ✓
 * 4. Se valida que ticket.sku.startsWith(eventKey) ✓
 * 5. Si pasa: continue con validaciones actuales ✓
 * 6. Si falla: mostrar error "Este ticket no pertenece a este evento"
 * 
 * LOGOUT (app/index.tsx):
 * 1. Usuario hace click en "Cerrar Sesión"
 * 2. Se limpia eventKey
 * 3. Se borra userToken
 * 4. Se redirige a /auth/login
 */

export default {};

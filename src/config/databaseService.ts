import { supabase } from '@/src/config/supabase';

export const databaseService = {
  // Obtener ticket por QR ID
  async getTicketByQRId(qrId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('qr_id', qrId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Registro no encontrado
        return null;
      }
      console.error('Error al obtener ticket:', error);
      return null;
    }

    return data;
  },

  // Validar ticket (cambiar validated a TRUE)
  async validateTicket(qrId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .update({
        validated: true,
        validated_at: new Date().toISOString(),
      })
      .eq('qr_id', qrId)
      .select();

    if (error) {
      console.error('Error al validar ticket:', error);
      throw new Error(error.message);
    }

    return data;
  },

  // Obtener todos los tickets (para verificar conexión)
  async getAllTickets() {
  console.log("🟡 [databaseService] getAllTickets llamado");
  
  const { data, error, count } = await supabase
    .from('tickets')
    .select('*', { count: 'exact' });

  console.log("📊 [databaseService] Resultado:", { 
    data, 
    error, 
    count,
    hasData: !!data,
    dataLength: data?.length 
  });

  if (error) {
    console.error('❌ [databaseService] Error:', error);
    return [];
  }

  console.log(`✅ [databaseService] Tickets encontrados: ${data?.length || 0}`);
  
  // Si hay datos, muestra el primer ticket
  if (data && data.length > 0) {
    console.log("📋 Primer ticket:", {
      qr_id: data[0].qr_id,
      first_name: data[0].first_name,
      validated: data[0].validated
    });
  }
  
  return data || [];
},
  // Escuchar cambios en la tabla tickets
  subscribeToTickets(callback: (data: any) => void) {
    const subscription = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  // Formatear datos del ticket para mostrar
  formatTicketData(ticket: any) {
    return {
      'QR ID': ticket.qr_id,
      'Nombre': `${ticket.first_name || ''} ${ticket.last_name || ''}`.trim(),
      'RUT': ticket.rut || 'N/A',
      'Email': ticket.email || 'N/A',
      'Teléfono': ticket.phone || 'N/A',
      'Orden': ticket.order_id || 'N/A',
      'Producto': ticket.product_id || 'N/A',
      'Cantidad': ticket.quantity || 'N/A',
      'Validado': ticket.validated ? 'Sí' : 'No',
      'Hora Validación': ticket.validated_at ? new Date(ticket.validated_at).toLocaleString('es-ES') : 'N/A',
      'WhatsApp': ticket.has_whatsapp ? 'Sí' : 'No',
      'Creado': new Date(ticket.created_at).toLocaleString('es-ES'),
    };
  },
  async testConnection() {
  console.log("🟡 [databaseService] Test de conexión iniciado");
  
  try {
    // Test 1: Conteo simple
    const { count, error: countError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true });

    console.log("🔗 [databaseService] Test conteo:", { count, countError });

    if (countError) {
      throw new Error(`Error de conteo: ${countError.message}`);
    }

    // Test 2: Obtener esquema
    const { data: schemaData, error: schemaError } = await supabase
      .from('tickets')
      .select('*')
      .limit(1);

    console.log("🔗 [databaseService] Test esquema:", { 
      hasSchema: !!schemaData,
      schemaError,
      firstRow: schemaData?.[0] 
    });

    return {
      success: true,
      message: `Conexión exitosa. Tickets en BD: ${count || 0}`,
      count: count || 0,
      hasData: (schemaData && schemaData.length > 0)
    };
    
  } catch (error) {
    console.error("❌ [databaseService] Test error:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
},

  // Validar si un eventKey existe en la tabla events
  async validateEventKey(sku: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('sku', sku)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Registro no encontrado
        return null;
      }
      console.error('Error validando evento:', error);
      return null;
    }

    return data;
  },
};

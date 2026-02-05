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
    const { data, error } = await supabase
      .from('tickets')
      .select('*');

    if (error) {
      console.error('Error al obtener tickets:', error);
      return [];
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
};

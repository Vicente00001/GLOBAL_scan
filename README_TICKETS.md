# 🎫 Escáner de Validación de Tickets de Evento

## 📋 Descripción

Esta aplicación es un escáner de códigos QR para validación de tickets de un evento. Al escanear un QR, el sistema:

1. **Busca el ticket** por su `qr_id` en la tabla `tickets` de Supabase
2. **Valida el ticket** si existe y no ha sido validado
3. **Muestra todos los datos** del ticket para que el operario pueda identificar al asistente
4. **Maneja tres casos:**
   - ✅ **Ticket válido**: Se valida el QR y cambia `validated` a TRUE
   - ⚠️ **Ticket ya validado**: Muestra que ya fue escaneado
   - ❌ **Ticket no existe**: Muestra error

---

## 🗂️ Estructura de Datos

### Tabla: `tickets`

```sql
qr_id              uuid         (Primary Key)
created_at         timestamptz  (Timestamp de creación)
order_id           int8         (ID de la orden)
product_id         int8         (ID del producto)
quantity           int2         (Cantidad)
first_name         varchar      (Nombre del asistente)
last_name          varchar      (Apellido del asistente)
rut                varchar      (RUT del asistente)
email              varchar      (Email del asistente)
phone              varchar      (Teléfono del asistente)
validated          boolean      (¿Fue validado?)
validated_at       timestamptz  (Timestamp de validación)
has_whatsapp       boolean      (¿Tiene WhatsApp?)
```

---

## 🔐 Credenciales de Supabase

Las credenciales están configuradas en `src/config/supabase.ts`:
- **URL**: `https://jthkrexyketbecgmxstk.supabase.co`
- **ANON_KEY**: Configurada correctamente

✅ **Conexión verificada** y funcional

---

## 🚀 Funcionalidades

### Pantalla Principal (`app/index.tsx`)
- Muestra estado de conexión a Supabase
- Botón para escanear código QR
- Información del usuario logueado
- Botón de cerrar sesión

### Pantalla de Scanner (`app/scanner/index.tsx`)
- Visualización en tiempo real de la cámara
- Detección automática de códigos QR
- **Tres estados de validación:**
  1. **✓ VALIDADO** (Verde) - Ticket validado exitosamente
  2. **⚠ YA VALIDADO** (Amarillo) - Ticket ya fue escaneado antes
  3. **✗ NO ENCONTRADO** (Rojo) - QR no existe en el sistema

- **Mostrar todos los datos del ticket:**
  - QR ID
  - Nombre completo
  - RUT
  - Email
  - Teléfono
  - Orden y Producto
  - Estado de validación
  - Timestamp de validación
  - WhatsApp
  - Fecha de creación

- Cambiar entre cámara frontal y trasera
- Botón volver al menú

---

## 📱 Servicios Implementados

### `src/config/databaseService.ts`

```typescript
// Obtener ticket por QR ID
getTicketByQRId(qrId: string)

// Validar ticket (cambiar validated a TRUE)
validateTicket(qrId: string)

// Obtener todos los tickets
getAllTickets()

// Formatear datos del ticket para mostrar
formatTicketData(ticket: any)

// Escuchar cambios en la tabla
subscribeToTickets(callback)
```

---

## 🔄 Flujo de Validación

```
1. Usuario escanea QR → qr_id capturado
                    ↓
2. Buscar en tabla tickets donde qr_id = qr_id_escaneado
                    ↓
3. ¿Existe el ticket?
   ├─ NO → Mostrar error "❌ No encontrado"
   └─ SÍ → Ir al paso 4
                    ↓
4. ¿validated = TRUE?
   ├─ SÍ → Mostrar "⚠️ Ya fue validado"
   └─ NO → Ir al paso 5
                    ↓
5. Actualizar validated = TRUE y validated_at = ahora
   Mostrar "✓ Validado" + todos los datos del ticket
```

---

## 🎯 Casos de Uso

### Caso 1: Ticket Válido
```
QR Escaneado: abc123def456
Resultado: ✓ VALIDADO (Verde)
Datos mostrados: Todos los campos del ticket
validated: TRUE
validated_at: 2026-02-05 15:30:45
```

### Caso 2: Ticket Ya Validado
```
QR Escaneado: abc123def456
Resultado: ⚠ YA VALIDADO (Amarillo)
Mensaje: "Este ticket para Juan García ya fue escaneado 
          en 2026-02-05 15:25:10"
Datos mostrados: Todos los campos del ticket
```

### Caso 3: Ticket No Existe
```
QR Escaneado: invalid123456
Resultado: ✗ NO ENCONTRADO (Rojo)
Mensaje: "El código QR 'invalid123456' no existe en la base de datos"
Datos mostrados: Ninguno
```

---

## 🔧 Configuración Requerida

✅ **Ya completado:**
- ✓ Supabase proyecto creado
- ✓ Tabla `tickets` con todas las columnas
- ✓ Credenciales configuradas en `src/config/supabase.ts`
- ✓ Autenticación habilitada
- ✓ Código actualizado

---

## 📊 Interfaz de Usuario

### Colores
- **Verde (#4CAF50)**: Ticket validado exitosamente
- **Amarillo (#FFC107)**: Ticket ya fue validado
- **Rojo (#F44336)**: Ticket no encontrado
- **Azul (#0E7AFE)**: Botón cambiar cámara
- **Rojo oscuro (#B22222)**: Botón volver

### Pantalla de Datos
```
┌─────────────────────────────────────┐
│       📋 DATOS DEL TICKET           │
├─────────────────────────────────────┤
│ QR ID: abc-123-def-456              │
│ Nombre: Juan García García          │
│ RUT: 12.345.678-9                   │
│ Email: juan@example.com             │
│ Teléfono: +56 9 1234 5678          │
│ Orden: 1001                         │
│ Producto: 501                       │
│ Cantidad: 2                         │
│ Validado: Sí                        │
│ Hora Validación: 05/02/2026 15:30   │
│ WhatsApp: Sí                        │
│ Creado: 01/02/2026 10:15            │
└─────────────────────────────────────┘
```

---

## 🚨 Solución de Problemas

### Error: "Connection refused"
- Verifica que las credenciales en `src/config/supabase.ts` sean correctas
- Confirma que el proyecto Supabase está activo

### Error: "Table tickets does not exist"
- Verifica que la tabla `tickets` existe en Supabase
- Asegúrate de que tiene exactamente ese nombre

### QR No Se Detecta
- Verifica que la cámara tiene permisos en el dispositivo
- Intenta con un código QR de mejor calidad
- Prueba con la otra cámara

### Tickets No Se Actualizan
- Verifica que el RLS (Row Level Security) no bloquea las actualizaciones
- Asegúrate de que la ANON_KEY tiene permiso para actualizar

---

## 📝 Notas Importantes

- El `qr_id` es el identificador único del ticket
- Una vez validado, `validated` no se puede cambiar a FALSE
- `validated_at` se actualiza automáticamente al momento de validación
- Todos los datos del ticket se muestran para verificación manual del operario
- El sistema requiere conexión a internet para funcionar

---

## 🎮 Cómo Usar

1. **Iniciar sesión** con credenciales de Supabase Auth
2. **Ver pantalla principal** - verificar que la conexión está OK (luz verde)
3. **Presionar "ESCANEAR CÓDIGO QR"**
4. **Apuntar con la cámara** al código QR del ticket
5. **El sistema automáticamente:**
   - Detectará el QR
   - Buscará el ticket
   - Lo validará si es nuevo
   - Mostrará todos los datos
6. **Presionar "OK"** en el diálogo
7. **Volver al menú** y repetir

---

**Sistema listo para validación de tickets en eventos.** 🎫✅

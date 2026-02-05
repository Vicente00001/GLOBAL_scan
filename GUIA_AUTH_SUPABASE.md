# 🔐 Guía de Autenticación con Supabase - Sistema de Validación de Tickets

## ✅ Estado del Proyecto

Tu proyecto está ejecutándose correctamente en Expo. El Metro Bundler está activo y listo para usar.

```
✓ Expo iniciado correctamente
✓ Metro Bundler activo
✓ Supabase configurado
✓ Autenticación lista
```

---

## 🚀 Paso 1: Acceder a Supabase

1. Ve a **https://app.supabase.com/**
2. Inicia sesión con tu cuenta Supabase
3. Selecciona tu proyecto: **jthkrexyketbecgmxstk**

---

## 🔑 Paso 2: Habilitar Autenticación por Email

1. En el dashboard, ve a **Authentication** (en el menú izquierdo)
2. Haz clic en la pestaña **Providers**
3. Busca **Email / Password**
4. Asegúrate de que esté **ENABLED** (verde)

```
Configuración:
✓ Email - ENABLED
✓ Confirm email - Elige según prefieras (puede ser OFF para testing)
✓ Double confirm changes - Puede estar OFF para testing
```

---

## 👤 Paso 3: Crear un Usuario de Prueba

### Opción A: Desde el Dashboard de Supabase (Recomendado)

1. Ve a **Authentication** → **Users**
2. Haz clic en el botón **Add User** (arriba a la derecha)
3. Completa el formulario:

```
Email:    testuser@example.com
Password: Supabase2026!     (o cualquier contraseña segura)
Email confirmed: ✓ (marca el checkbox si está disponible)
```

4. Haz clic en **Create User**

---

### Opción B: Crear desde la App (Próxima vez que lo hagas)

Cuando la app esté funcionando, puedes crear usuarios directamente desde la pantalla de login usando la función de signup en `authService.ts`.

---

## 📱 Paso 4: Probar el Login en la App

Una vez que hayas creado el usuario:

1. **Abre la app en tu dispositivo/emulador**
2. **Verás la pantalla de login**
3. **Ingresa las credenciales:**

```
Email:    testuser@example.com
Password: Supabase2026!
```

4. **Presiona "Iniciar Sesión"**
5. **Si todo está correcto:**
   - ✓ Te llevará a la pantalla principal
   - ✓ Verás "Bienvenido testuser"
   - ✓ Podrás ver el estado de conexión a Supabase
   - ✓ Podrás escanear códigos QR

---

## 🔄 Flujo de Autenticación

```
PANTALLA DE LOGIN
       ↓
Usuario ingresa email y contraseña
       ↓
authService.login(email, password)
       ↓
Supabase verifica credenciales
       ↓
┌─────────────────────────────────┐
│ ¿Credenciales válidas?          │
└─────────────────────────────────┘
       │
       ├─ NO  → Mostrar error "Correo o contraseña incorrectos"
       │
       └─ SÍ  → Guardar sesión en AsyncStorage
              ↓
              Redirect a PANTALLA PRINCIPAL
              ↓
              Usuario autenticado ✓
```

---

## 🛠️ Archivos Clave de Autenticación

### `src/config/supabase.ts`
```typescript
// Inicializa el cliente Supabase
// Configurado con AsyncStorage para persistencia de sesión
```

### `src/config/authService.ts`
```typescript
// Funciones disponibles:
- login(email, password)        → Iniciar sesión
- signup(email, password)        → Crear cuenta
- logout()                       → Cerrar sesión
- getCurrentUser()              → Obtener usuario actual
- getSession()                  → Obtener sesión actual
- onAuthStateChanged(callback)  → Listener de cambios
```

### `app/auth/login.tsx`
```typescript
// Pantalla de login
// Usa authService.login() para autenticar
// Maneja errores y estados de carga
```

### `app/_layout.tsx`
```typescript
// Verifica si el usuario está autenticado
// Si no está logueado → Redirige a /auth/login
// Si está logueado → Muestra la pantalla principal
```

---

## ✨ Características de Autenticación

✅ **Login/Logout**: Completo con manejo de errores
✅ **Persistencia**: La sesión se guarda automáticamente
✅ **Validación**: Errores claros y mensajes útiles
✅ **Seguridad**: Usa el sistema de autenticación de Supabase
✅ **Estado**: Listener automático de cambios de sesión

---

## 📊 Tabla de Usuarios (Opcional)

Si quieres guardar información adicional de usuarios, puedes crear una tabla:

```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR UNIQUE NOT NULL,
  nombre VARCHAR,
  rol VARCHAR DEFAULT 'operario',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Nota:** Actualmente, el sistema funciona solo con la autenticación de Supabase sin necesidad de tabla adicional.

---

## 🔒 Seguridad en Desarrollo

Para testing/desarrollo:

✅ Puedes crear usuarios de prueba fácilmente
✅ Las contraseñas de test pueden ser simples (en producción usa contraseñas fuertes)
✅ Puedes usar emails fake como: `test@example.com`, `admin@test.com`, etc.

---

## 🚨 Troubleshooting: Errores Comunes

### Error: "Invalid login credentials"
- Verifica que el email es correcto
- Verifica que la contraseña es correcta
- Asegúrate de que el usuario fue creado en Authentication → Users

### Error: "Email not confirmed"
- Ve a Supabase → Authentication → Users
- Busca al usuario
- Haz clic en los 3 puntos y selecciona "Confirm user"

### Error: "Connection refused"
- Verifica que las credenciales en `src/config/supabase.ts` son correctas
- Verifica que tienes internet
- Reinicia la app

### Error: "User already registered"
- El email ya está registrado
- Usa otro email o elimina el usuario anterior

---

## 👥 Crear Múltiples Usuarios de Prueba

Para probar con diferentes usuarios:

| Email | Contraseña | Uso |
|-------|-----------|-----|
| admin@event.com | Supabase2026! | Administrador |
| operario1@event.com | Supabase2026! | Operario 1 |
| operario2@event.com | Supabase2026! | Operario 2 |

Crea todos desde el dashboard de Supabase → Authentication → Users

---

## 📋 Checklist de Configuración

- [ ] He accedido a https://app.supabase.com/
- [ ] He seleccionado mi proyecto (jthkrexyketbecgmxstk)
- [ ] He ido a Authentication → Providers
- [ ] Email/Password está ENABLED
- [ ] He creado al menos un usuario de prueba
- [ ] He anotado el email y contraseña del usuario
- [ ] Expo está ejecutándose (npm start)
- [ ] Voy a probar el login con las credenciales

---

## 🎯 Próximos Pasos

1. ✅ Proyecto levantado en Expo
2. ⏳ **Crear usuario en Supabase** (este documento)
3. ⏳ Probar login en la app
4. ⏳ Probar escaneo de QR
5. ⏳ Validar que todo funciona

---

## 💡 Información de Proyecto

```
Proyecto: jthkrexyketbecgmxstk
URL: https://jthkrexyketbecgmxstk.supabase.co
Región: Supabase
Base de datos: PostgreSQL
Tabla principal: tickets
```

---

## 📞 Comandos Útiles

```bash
# Iniciar la app
npm start

# Correr en web
npm run web

# Correr en Android
npm run android

# Correr en iOS
npm run ios
```

---

**¡Listo! Solo sigue los pasos para crear un usuario y prueba el login.** 🚀

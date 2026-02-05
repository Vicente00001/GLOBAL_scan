# 🔓 Cómo Crear una Cuenta para Iniciar Sesión - Pasos Visuales

## 📱 Opción 1: Crear Usuario desde Supabase Dashboard (Más Fácil)

### Paso 1: Acceder a Supabase
```
Abre: https://app.supabase.com/
```

### Paso 2: Navegar a Autenticación
```
Dashboard Supabase
    ↓
Menú Izquierdo → "Authentication"
    ↓
Selecciona la pestaña "Users"
```

### Paso 3: Crear Nuevo Usuario
```
Botón "Add User" (arriba a la derecha)
```

### Paso 4: Llenar el Formulario
```
┌──────────────────────────────────────────┐
│  CREATE A NEW USER                       │
├──────────────────────────────────────────┤
│ Email:          [testuser@example.com  ] │
│ Password:       [Supabase2026!        ] │
│ Confirm pwd:    [Supabase2026!        ] │
│                                          │
│ ☐ Auto-confirm user email               │
│                                          │
│            [Create User]                 │
└──────────────────────────────────────────┘
```

**Valores recomendados:**
- **Email**: `testuser@example.com` (o tu email)
- **Contraseña**: `Supabase2026!` (o cualquiera que quieras recordar)
- **Auto-confirm**: ✓ Marca el checkbox

### Paso 5: Confirmar Creación
```
Deberías ver el usuario en la lista:
┌──────────────────────────────────────────┐
│ testuser@example.com      2026-02-05    │
│ Confirmed user ✓                         │
└──────────────────────────────────────────┘
```

---

## 📱 Opción 2: Crear Usuario desde la App

Si preferías hacerlo desde la app (próxima vez):

```
PANTALLA DE LOGIN
    ↓
[Email        ] ← testuser@example.com
[Contraseña   ] ← Supabase2026!
[Iniciar Sesión]
    ↓
(Si quieres crear cuenta nueva)
```

---

## ✅ Una Vez Creado el Usuario

### Anotaciones
```
Email:          testuser@example.com
Contraseña:     Supabase2026!
Proyecto:       jthkrexyketbecgmxstk
```

### Usar en la App
```
1. Abre la app en tu dispositivo/emulador
2. Verás la pantalla de LOGIN
3. Ingresa los datos:
   - Email:    testuser@example.com
   - Password: Supabase2026!
4. Presiona "Iniciar Sesión"
5. ¡Listo! Acceso a la app
```

---

## 🎯 Flujo Completo de Autenticación

```
┌────────────────────────────────────┐
│  PANTALLA DE LOGIN                 │
│ ┌──────────────────────────────┐  │
│ │ Email:     [________]        │  │
│ │ Contraseña: [______]        │  │
│ │ [Iniciar Sesión]             │  │
│ └──────────────────────────────┘  │
└────────────────────────────────────┘
         ↓ (usuario ingresa datos)
┌────────────────────────────────────┐
│  VALIDANDO CREDENCIALES            │
│  ⏳ Verificando en Supabase...     │
└────────────────────────────────────┘
         ↓
    ¿Válido?
    /       \
  SÍ        NO
  ↓         ↓
✓ OK     ✗ ERROR
  ↓         ↓
HOME      LOGIN
  ↓      (mostrar error)
  │
  └──→ [Escáner] [Cerrar Sesión]
```

---

## 🔐 Credenciales de Ejemplo

```
┌─────────────────────────────────────┐
│  USUARIOS DE PRUEBA SUGERIDOS       │
├─────────────────────────────────────┤
│ Email: admin@event.com              │
│ Pass:  Supabase2026!                │
├─────────────────────────────────────┤
│ Email: operario@event.com           │
│ Pass:  Supabase2026!                │
├─────────────────────────────────────┤
│ Email: test@example.com             │
│ Pass:  Supabase2026!                │
└─────────────────────────────────────┘

Puedes crear múltiples usuarios con diferentes emails
```

---

## ⚙️ Configuración en Supabase (Ya Está Hecha)

```
✓ Email/Password Authentication: ENABLED
✓ AsyncStorage Persistence: ENABLED
✓ Auto Refresh Token: ENABLED
✓ Supabase URL: https://jthkrexyketbecgmxstk.supabase.co
✓ ANON_KEY: Configurada correctamente
```

---

## 🧪 Verificación Rápida

Una vez logueado en la app:

```
Pantalla Principal:
┌────────────────────────────────────┐
│ 🎫 Escáner de Tickets de Evento   │
│                                    │
│ ● Estado: Conectado (verde)       │
│                                    │
│ Bienvenido testuser               │
│ Miércoles, 5 de febrero de 2026    │
│ 15:30:45                           │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ ESCANEAR CÓDIGO QR          │  │
│ └──────────────────────────────┘  │
└────────────────────────────────────┘
```

Si ves esto → ✓ **Autenticación funcionando**

---

## 📝 Checklist

- [ ] Accedí a https://app.supabase.com/
- [ ] Seleccioné mi proyecto (jthkrexyketbecgmxstk)
- [ ] Fui a Authentication → Users
- [ ] Hice clic en "Add User"
- [ ] Ingresé email: testuser@example.com
- [ ] Ingresé contraseña: Supabase2026!
- [ ] Marqué "Auto-confirm user email"
- [ ] Hice clic en "Create User"
- [ ] Vi el usuario en la lista
- [ ] Tengo anotado el email y contraseña
- [ ] Voy a probar en la app

---

## 🚀 Próximo Paso

Una vez creado el usuario:

```
1. Abre/actualiza la app en tu dispositivo
2. Verás la pantalla de LOGIN
3. Ingresa: testuser@example.com / Supabase2026!
4. ¡Acceso total a la app!
```

---

## ❓ Preguntas Frecuentes

**P: ¿Cuántos usuarios puedo crear?**
R: Ilimitados. Crea todos los que necesites para testing.

**P: ¿Puedo cambiar la contraseña?**
R: Sí, desde Supabase Dashboard → Users → usuario → Edit

**P: ¿Qué pasa si olvido la contraseña?**
R: En Supabase Dashboard → Users → usuario → Edit password

**P: ¿La contraseña es segura?**
R: Para desarrollo está bien. En producción usa contraseñas más fuertes.

**P: ¿Puedo crear usuarios desde la app sin el dashboard?**
R: Sí, hay una función `signup()` en authService, pero de momento solo test login.

---

**¡Ya puedes crear usuarios y probar la autenticación!** 🔐✅

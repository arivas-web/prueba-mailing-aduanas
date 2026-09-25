# 🔧 Google Apps Script Setup Detallado

Guía paso a paso para configurar el Google Apps Script.

---

## Paso 1: Crear Proyecto en Google Cloud

### 1.1 Ir a Google Cloud Console
- URL: https://console.cloud.google.com/
- Login con tu cuenta Google

### 1.2 Crear Proyecto
1. Click en **Seleccionar un proyecto** (arriba)
2. Click en **NUEVO PROYECTO**
3. Nombre: `Email-Sensor-Visual-Trans`
4. Click **CREAR**
5. Espera a que se cree (puede tomar 1-2 minutos)

### 1.3 Habilitar Google Apps Script API
1. En la búsqueda (arriba), escribe: `Google Apps Script API`
2. Click en el resultado
3. Click en **HABILITAR**
4. Espera confirmación

### 1.4 Habilitar Gmail API (opcional pero recomendado)
1. En la búsqueda, escribe: `Gmail API`
2. Click en el resultado
3. Click en **HABILITAR**

---

## Paso 2: Crear Google Apps Script Project

### 2.1 Ir a Google Apps Script
- URL: https://script.google.com/
- Debería llevarte a mi lista de scripts

### 2.2 Crear Nuevo Script
1. Click en **Nuevo proyecto** (o ➕)
2. Nombre: `Email Sensor slopezvigo`
3. Click en el icono de proyecto (arriba) → Rename
4. Confirma

### 2.3 Copiar el Código
1. Ve a la pestaña **Editor**
2. Selecciona TODO el código por defecto y BORRA
3. Abre este archivo: `google-apps-script/EmailSensor.gs`
4. Copia TODO el contenido
5. Pega en el editor de Google Apps Script
6. Click en **Guardar** (Ctrl+S)

---

## Paso 3: Configurar Properties

### 3.1 Abrir Project Settings
1. En Google Apps Script, click en **Configuración del proyecto** (icono de engranaje)
2. En la pestaña **Configuración del proyecto**

### 3.2 Habilitar Apps Script API
En la sección **APIs de Google Cloud**:
- Asegúrate que **Google Apps Script API** está habilitada

### 3.3 Copiar Script ID (importante)
En la sección **Información del proyecto**:
- **ID de secuencia de comandos**: Copia esto (lo necesitarás después)
- Ejemplo: `1C_xabcdef123456789-ghijk_lmnop_qrst`

### 3.4 Configurar Properties (Propiedades)
En Google Apps Script, ve a: **Proyecto → Propiedades de secuencias de comandos**

Agrega estas propiedades (Tipo: SCRIPTS):

| Propiedad | Valor | Descripción |
|-----------|-------|-------------|
| `GITHUB_WEBHOOK_URL` | https://api.github.com/repos/arivas-web/prueba-mailing-aduanas/dispatches | URL del webhook de GitHub |
| `DRIVE_FOLDER_ID` | (opcional) | ID de carpeta Drive para adjuntos |
| `ADMIN_EMAIL` | arivas@visualms.com | Email para notificaciones |

**Cómo obtener DRIVE_FOLDER_ID:**
1. Ve a Google Drive
2. Crea una carpeta: `Email-Sensor-Attachments`
3. Abre la carpeta
4. En la URL: `https://drive.google.com/drive/folders/[ESTO_ES_EL_ID]`
5. Copia el ID

---

## Paso 4: Crear Disparador (Trigger)

### 4.1 Opción A: Automático (Recomendado)
En Google Apps Script, ejecuta una sola vez:

```javascript
// Selecciona la función: setupEmailSensor
// Click en ▶️ Ejecutar
```

Deberías ver en Logs:
```
✅ Email Sensor configurado. Revisando cada 5 minutos
```

### 4.2 Opción B: Manual
1. En Google Apps Script, click en **Disparadores** (reloj)
2. Click en **+ Crear un disparador**
3. Configura:
   - **Seleccionar función a ejecutar**: `checkNewEmails`
   - **Seleccionar tipo de evento de inicio**: `Basado en tiempo`
   - **Seleccionar tipo de disparador de tiempo**: `Cada minuto` o `Cada 5 minutos`
   - **Seleccionar notificación de error**: `Notificarme diariamente`
4. Click **Guardar**

---

## Paso 5: Autorizar Acceso a Gmail

### 5.1 Primer Intento
1. En Google Apps Script, presiona ▶️ **Ejecutar** en cualquier función
2. Aparecerá un popup pidiendo acceso
3. Click en **Revisar permisos**
4. Selecciona tu cuenta Google
5. Click en **Permitir** (en la advertencia de seguridad)

### 5.2 Verificar Autorización
En **Proyecto → Editor**, se debería ver:
- Estado de autorización: ✅

---

## Paso 6: Crear Label en Gmail

### 6.1 Abrir Gmail
- URL: https://mail.google.com/ (con la cuenta slopezvigo@gmail.com)

### 6.2 Crear Label
1. Click en **Etiquetas** (abajo a la izquierda)
2. Click en **Crear etiqueta nueva**
3. Nombre: `Procesado-HubSpot`
4. No seleccionar subcarpeta
5. Click **Crear**

### 6.2B Alternativa: Hacerlo desde Google Apps Script
```javascript
// Ejecuta esta función en Google Apps Script
function createLabelIfNotExists(labelName) {
  try {
    GmailApp.getUserLabelByName(labelName);
  } catch (e) {
    GmailApp.createLabel(labelName);
    Logger.log('📝 Label creada: ' + labelName);
  }
}

// Ejecuta: createLabelIfNotExists('Procesado-HubSpot')
```

---

## Paso 7: Obtener GitHub Webhook URL

### 7.1 Crear GitHub Token
1. Ve a https://github.com/settings/tokens
2. Click **Generar nuevo token (clásico)**
3. Nombre: `Email Sensor Webhook`
4. Selecciona scopes:
   - ✅ `repo` (acceso completo al repositorio)
   - ✅ `workflow` (para disparar workflows)
5. Click **Generar token**
6. **COPIA el token** (no lo podrás ver después)
7. Guárdalo en un lugar seguro

### 7.2 Construir Webhook URL
La URL será:
```
https://api.github.com/repos/arivas-web/prueba-mailing-aduanas/dispatches
```

Pero necesitamos pasarle el token. Hay 2 opciones:

**Opción A: En la URL (simple pero menos seguro)**
```
https://TU_TOKEN@api.github.com/repos/arivas-web/prueba-mailing-aduanas/dispatches
```
Ejemplo:
```
https://ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@api.github.com/repos/arivas-web/prueba-mailing-aduanas/dispatches
```

**Opción B: En Headers (más seguro)**
```javascript
// Modificar EmailSensor.gs función sendToGitHubWebhook()

const options = {
  method: 'post',
  headers: {
    'Authorization': 'token ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'X-GitHub-Api-Version': '2022-11-28',
  },
  payload: JSON.stringify(payload),
  muteHttpExceptions: true,
};
```

### 7.3 Actualizar Google Apps Script Properties
En **Proyecto → Propiedades de secuencias de comandos**:
- Clave: `GITHUB_WEBHOOK_URL`
- Valor: (la URL construida arriba)

---

## Paso 8: Testing

### 8.1 Test Manual en Google Apps Script

#### Test 1: Verificar Configuración
```javascript
// Ejecuta esta función
testEmailSensor();

// Deberías ver en Logs:
// ✅ Configuración validada
// ✅ Email Sensor configurado. Revisando cada 5 minutos
// ✅ Test completado
```

#### Test 2: Check Manual de Emails
```javascript
// Ejecuta esta función
checkNewEmails();

// Deberías ver en Logs:
// 📭 No hay emails nuevos
// O
// 📧 Encontrados N emails nuevos
```

#### Test 3: Enviar Email de Prueba
1. Abre otro navegador o ventana privada
2. Ve a https://mail.google.com/ (login si es necesario)
3. Envía email a: `slopezvigo@gmail.com`
   - Asunto: "Test Email Sensor"
   - Cuerpo: "Este es un email de prueba"
4. Espera 5 minutos (o ejecuta checkNewEmails() manualmente)
5. Verifica en Logs que se procesó
6. Verifica en HubSpot que se creó el contacto/deal

---

## Paso 9: Verificar en HubSpot

### 9.1 Login en HubSpot
- URL: https://app.hubspot.com/

### 9.2 Buscar Contacto
1. Ve a **CRM → Contactos**
2. Busca por: source = "email_sensor_slopezvigo"
3. Deberías ver tu email de prueba

### 9.3 Buscar Deal
1. Ve a **CRM → Deals**
2. Filtra por: Pipeline = "Visual Trans 2026"
3. Deberías ver el deal creado

---

## 🐛 Troubleshooting Google Apps Script

### ❌ Error: "Authorization required"
**Solución:**
1. Ejecuta cualquier función (click ▶️)
2. Click "Revisar permisos" cuando pida
3. Autoriza el acceso

### ❌ Error: "GITHUB_WEBHOOK_URL no configurada"
**Solución:**
1. Ve a **Proyecto → Propiedades de secuencias de comandos**
2. Agrega: `GITHUB_WEBHOOK_URL` = (tu URL)

### ❌ Label no se crea
**Solución:**
1. Crea manualmente en Gmail:
   - Settings → Labels → Create new label
   - Nombre: `Procesado-HubSpot`

### ❌ El email no se detecta
**Solución:**
1. Verifica que el email llegó a slopezvigo@gmail.com
2. Ejecuta: `checkNewEmails()` manualmente
3. Revisa Logs (Ctrl+Shift+J)
4. Verifica que NO tiene label "Procesado-HubSpot"

### ❌ Webhook no funciona
**Solución:**
1. Verifica GitHub Token es válido
2. Verifica URL de webhook en Properties
3. Intenta test con curl:
```bash
curl -X POST \
  "https://YOUR_TOKEN@api.github.com/repos/arivas-web/prueba-mailing-aduanas/dispatches" \
  -H "Content-Type: application/json" \
  -d '{"event_type":"email_received"}'
```

---

## 📝 Próximos Pasos

Después de completar esta configuración:

1. [ ] Configura GitHub Secrets (ver: docs/SETUP_GUIDE.md Paso 3)
2. [ ] Despliega el Workflow (ver: docs/SETUP_GUIDE.md Paso 4)
3. [ ] Haz test completo (ver: docs/SETUP_GUIDE.md Paso 5)

---

**Última actualización:** 2026-09-25
**Versión:** 1.0.0

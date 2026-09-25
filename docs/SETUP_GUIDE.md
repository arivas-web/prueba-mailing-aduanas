# 🚀 Guía de Configuración: Email Sensor → HubSpot

## 📋 Descripción General

> ⚠️ **Nota:** Esta guía describe el setup general de la infraestructura
> (Google Apps Script + GitHub Actions + HubSpot). El comportamiento actual
> es más simple de lo que describen algunas secciones de abajo: **solo se
> procesan emails cuyo asunto contiene "correo aeat"**, y el resultado final
> es **únicamente un borrador de email en HubSpot** (no se crean contactos,
> deals ni tickets). Ver `README.md` y `QUICK_DEPLOY.md` para el flujo exacto.

Este sistema detecta automáticamente emails enviados a **arivas@visualtrans.com** (con "correo aeat" en el asunto) y genera un borrador en HubSpot con la plantilla **"Visual Trans 2026"**.

**Arquitectura:**
```
Gmail (arivas@visualtrans.com)
         ↓
Google Apps Script (Sensor)
         ↓
GitHub Actions Webhook
         ↓
Node.js Script
         ↓
HubSpot API
```

---

## 🔧 Paso 1: Preparar Google Apps Script

### 1.1 Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto: `Email-Sensor-Visual-Trans`
3. En la búsqueda, encuentra **Google Apps Script API** y actívala
4. Crea credenciales OAuth 2.0 (Aplicación de escritorio)

### 1.2 Crear Script en Google Apps Script

1. Ve a [Google Apps Script](https://script.google.com/)
2. Crea un nuevo proyecto: `Email Sensor arivas-aeat`
3. Elimina el contenido por defecto
4. Copia el contenido de `google-apps-script/EmailSensor.gs`
5. Pega el código

### 1.3 Configurar Variables del Script

En **Proyecto > Configuración del proyecto > Propiedades de secuencias de comandos**:

```javascript
// En Google Apps Script: Project Settings

// Obtén tu URL de webhook (ver Paso 2)
GITHUB_WEBHOOK_URL = "https://api.github.com/repos/arivas-web/prueba-mailing-aduanas/dispatches"

// ID de carpeta Drive para guardar adjuntos (opcional)
DRIVE_FOLDER_ID = "YOUR_DRIVE_FOLDER_ID"

// Email para notificaciones de error (opcional)
ADMIN_EMAIL = "arivas@visualms.com"
```

**Para obtener DRIVE_FOLDER_ID:**
1. Crea una carpeta en Google Drive: `Email-Sensor-Attachments`
2. Abre la carpeta y copia el ID de la URL: `https://drive.google.com/drive/folders/[FOLDER_ID]`

### 1.4 Crear Disparador

En Google Apps Script:

```javascript
// Ejecuta esta función UNA SOLA VEZ
setupEmailSensor();
```

**O manualmente:**
- Ve a **Disparadores** (reloj)
- Añade trigger: `checkNewEmails` → Basado en tiempo → Cada 5 minutos

---

## 🔐 Paso 2: Configurar GitHub Actions Webhook

### 2.1 Crear GitHub Personal Access Token

1. Ve a [GitHub Settings → Developer settings → Tokens](https://github.com/settings/tokens)
2. Click en **Generate new token (classic)**
3. Nombre: `Email Sensor Webhook`
4. Scopes necesarios:
   - `repo` (acceso al repositorio)
   - `workflow` (para disparar workflows)
5. Copia el token (lo usarás en Google Apps Script)

### 2.2 Configurar Webhook URL en Google Apps Script

La URL será:
```
https://api.github.com/repos/arivas-web/prueba-mailing-aduanas/dispatches
```

Con headers:
```
Authorization: token YOUR_GITHUB_TOKEN
X-GitHub-Api-Version: 2022-11-28
```

---

## 🔑 Paso 3: Configurar Secrets en GitHub

### 3.1 Agregar Secrets

En el repositorio → **Settings → Secrets and variables → Actions**:

#### HUBSPOT_API_KEY
1. Ve a [HubSpot Integrations](https://app.hubspot.com/personal-access-key)
2. Crea una nueva clave privada
3. Scopes necesarios:
   - `content` (lectura/escritura de Marketing Email, para clonar la plantilla y crear el borrador)
4. Copia la clave
5. En GitHub, crea secret: `HUBSPOT_API_KEY` = [tu clave]

#### HUBSPOT_PORTAL_ID
1. En HubSpot, ve a **Settings → Account Defaults**
2. Copia el **Portal ID**
3. En GitHub, crea secret: `HUBSPOT_PORTAL_ID` = [tu portal ID]

---

## 📧 Paso 4: Verificar Configuración

### 4.1 Test en Google Apps Script

En el editor de Google Apps Script:

```javascript
// Ejecuta en la consola
testEmailSensor();
```

Deberías ver:
```
✅ Configuración validada
✅ Email Sensor configurado. Revisando cada 5 minutos
✅ Test completado
```

### 4.2 Test Manual en GitHub

1. Ve a **Actions → Email Sensor → HubSpot Sync**
2. Click **Run workflow**
3. Input `test_email_json`:
```json
{
  "timestamp": "2026-09-25T10:00:00Z",
  "from": "test@example.com",
  "subject": "Email de prueba",
  "to": "arivas@visualtrans.com",
  "cc": "",
  "plainText": "Este es un email de prueba",
  "htmlBody": "<p>Este es un email de prueba</p>",
  "attachments": [],
  "messageId": "test-123",
  "threadId": "test-thread"
}
```
4. Click **Run workflow**

Verifica en HubSpot que se creó el contacto, deal y ticket.

---

## 🔄 Flujo de Operación

### Cuando llega un email a arivas@visualtrans.com:

1. **Google Apps Script (cada 5 minutos)**
   - Busca emails sin procesar
   - Extrae: asunto, remitente, cuerpo, adjuntos
   - Envía a GitHub webhook

2. **GitHub Actions**
   - Recibe el webhook
   - Ejecuta `sync-email-to-hubspot.js`
   - Procesa el email:
     - ✅ Crea/actualiza Contacto
     - ✅ Crea Deal en "Visual Trans 2026"
     - ✅ Crea Ticket
     - ✅ Asocia todo

3. **HubSpot**
   - El contacto aparece con fuente: `email_sensor_arivas-aeat`
   - Deal en estado: `negotiation`
   - Ticket con el contenido completo del email

4. **Google Apps Script**
   - Marca el email con label: `Procesado-HubSpot-AEAT`
   - No lo procesa nuevamente

---

## 🛠️ Troubleshooting

### ❌ El sensor no detecta emails

**Solución:**
```javascript
// En Google Apps Script, verifica el log:
checkNewEmails(); // Ejecuta manualmente

// Revisa los errores en Logs
// Ctrl+Shift+J abre los logs
```

### ❌ Webhook no se envía

**Verificar en Google Apps Script:**
- Acceso a Gmail
- Permisos en Google Cloud Console activados
- GITHUB_WEBHOOK_URL configurada correctamente

### ❌ Error en HubSpot Sync

**Revisar en GitHub:**
1. Ve a **Actions → último workflow**
2. Revisa los logs
3. Verifica que HUBSPOT_API_KEY es válida
4. Verifica scopes en HubSpot

### ❌ Email duplicado en HubSpot

**Causa:** El script procesó el email 2 veces

**Solución:** Marcar manualmente con label `Procesado-HubSpot-AEAT` en Gmail

---

## 📊 Monitoreo

### Variables de Monitoreo

En Google Apps Script:

```javascript
// Ver emails pendientes
const query = 'to:arivas@visualtrans.com -label:Procesado-HubSpot-AEAT';
const count = GmailApp.search(query).length;
Logger.log('📊 Emails pendientes: ' + count);

// Ver historial de procesamiento
const processed = GmailApp.search('to:arivas@visualtrans.com label:Procesado-HubSpot-AEAT').length;
Logger.log('✅ Emails procesados: ' + processed);
```

### En GitHub Actions

- Ve a **Actions** para ver ejecuciones
- Cada email genera un run del workflow
- Revisa logs para debugging

### En HubSpot

- Ve a **Marketing → Email**
- Busca los borradores cuyo nombre empieza por `[AEAT]`

---

## 🔐 Seguridad

### Recomendaciones

1. **GitHub Token**
   - Usa fine-grained personal access tokens
   - Revoca regularmente
   - No compartas nunca

2. **HubSpot API Key**
   - Guardar en secrets de GitHub
   - Usar scopes mínimos necesarios
   - Rotarla cada 6 meses

3. **Google Apps Script**
   - No guardes tokens en el código
   - Usa Properties Service para secretos
   - Audita logs regularmente

4. **Emails**
   - No guardes emails personales en Drive sin encriptación
   - Limpia adjuntos no esenciales

---

## 📞 Soporte

Para issues o preguntas:
1. Revisa este documento
2. Verifica los logs (Google Apps Script y GitHub)
3. Crea un issue en el repositorio

---

**Última actualización**: 2026-09-25
**Versión**: 1.0.0
**Autor**: Visual Trans Automation Team

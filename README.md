# 📧 Email Sensor → HubSpot Visual Trans 2026

**Sistema automático de sincronización de emails** que detecta mensajes enviados a `slopezvigo@gmail.com` y los replica en HubSpot.

---

## ✨ Features

- ✅ **Sensor en tiempo real** - Detecta emails cada 5 minutos
- ✅ **Sin intervención manual** - Automatización completa
- ✅ **Sincronización HubSpot** - Crea contactos, deals y tickets
- ✅ **Gestión de adjuntos** - Guarda archivos en Google Drive
- ✅ **Logs y monitoreo** - GitHub Actions + Google Apps Script
- ✅ **Tolerancia a errores** - Reintentos automáticos

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│      Gmail: slopezvigo@gmail.com        │
└──────────────┬──────────────────────────┘
               │
               ↓ (cada 5 min)
┌─────────────────────────────────────────┐
│    Google Apps Script                   │
│    • Detecta emails nuevos              │
│    • Extrae contenido completo          │
│    • Envía webhook a GitHub             │
└──────────────┬──────────────────────────┘
               │
               ↓ (repository_dispatch)
┌─────────────────────────────────────────┐
│    GitHub Actions Workflow              │
│    • Email Sensor → HubSpot Sync        │
│    • Ejecuta Node.js script             │
└──────────────┬──────────────────────────┘
               │
               ↓ (API calls)
┌─────────────────────────────────────────┐
│    HubSpot                              │
│    • Visual Trans 2026 Pipeline         │
│    • Contactos, Deals, Tickets          │
└─────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Clonar Repositorio
```bash
git clone https://github.com/arivas-web/prueba-mailing-aduanas.git
cd prueba-mailing-aduanas
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Secretos
```bash
cp .env.example .env

# Edita .env con tus valores:
# - GITHUB_TOKEN
# - HUBSPOT_API_KEY
# - HUBSPOT_PORTAL_ID
```

### 4. Desplegar Google Apps Script
- Ve a [Google Apps Script](https://script.google.com/)
- Crea nuevo proyecto
- Copia contenido de `google-apps-script/EmailSensor.gs`
- Configura disparador (trigger)
- Ver detalles en [SETUP_GUIDE.md](docs/SETUP_GUIDE.md)

### 5. Configurar GitHub Actions Secrets
En repositorio → Settings → Secrets:
```
HUBSPOT_API_KEY = pat-na1-...
HUBSPOT_PORTAL_ID = 123456789
```

---

## 📁 Estructura del Proyecto

```
prueba-mailing-aduanas/
├── .github/
│   └── workflows/
│       └── email-to-hubspot.yml          # Workflow principal
├── google-apps-script/
│   └── EmailSensor.gs                    # Script de monitoreo
├── scripts/
│   └── sync-email-to-hubspot.js          # Sincronización HubSpot
├── docs/
│   └── SETUP_GUIDE.md                    # Guía de configuración
├── .env.example                          # Variables de ejemplo
├── package.json                          # Dependencias
└── README.md                             # Este archivo
```

---

## 🔧 Componentes

### 📧 Google Apps Script
**Archivo:** `google-apps-script/EmailSensor.gs`

Responsabilidades:
- Monitorear carpeta de entrada de slopezvigo@gmail.com
- Extraer: asunto, remitente, cuerpo, adjuntos
- Enviar webhook a GitHub Actions
- Marcar emails procesados

### 🚀 GitHub Actions
**Archivo:** `.github/workflows/email-to-hubspot.yml`

Responsabilidades:
- Recibir webhook del sensor
- Orquestar el flujo de sincronización
- Registrar logs y resultados
- Notificar errores

### 🔄 Sync Script
**Archivo:** `scripts/sync-email-to-hubspot.js`

Responsabilidades:
- Procesar datos del email
- Crear/actualizar contacto en HubSpot
- Crear deal en BORRADOR en "Visual Trans 2026"
- Crear ticket en BORRADOR asociado
- TÚ revisa, completas y envías en HubSpot

---

## 📊 Flujo de Datos

### 1️⃣ Email Llega a slopezvigo@gmail.com
```
De: cliente@empresa.com
Asunto: Consulta sobre servicios
Contenido: ...
```

### 2️⃣ Google Apps Script Detecta
```javascript
checkNewEmails()
// Encuentra email sin label "Procesado-HubSpot"
// Extrae datos completos
// Envía webhook
```

### 3️⃣ GitHub Actions Procesa
```bash
# Workflow: Email Sensor → HubSpot Sync
# Ejecuta: sync-email-to-hubspot.js
```

### 4️⃣ HubSpot Actualiza
```
✅ Contacto: cliente@empresa.com
✅ Deal: "Email: Consulta sobre servicios"
✅ Ticket: Email completo guardado
```

---

## 🧪 Testing

### Test en Google Apps Script
```javascript
// En el editor de Google Apps Script
testEmailSensor();
```

### Test en GitHub Actions
```bash
# Manual workflow dispatch
gh workflow run email-to-hubspot.yml \
  -f test_email_json='{"from":"test@example.com","subject":"Test","..."}'
```

### Test Local
```bash
# Requiere variables de entorno configuradas
TEST_MODE=true node scripts/sync-email-to-hubspot.js
```

---

## 📋 Configuración Requerida

### Google Cloud Platform
- [ ] Project creado
- [ ] Google Apps Script API habilitada
- [ ] OAuth 2.0 credentials configuradas

### GitHub
- [ ] Personal Access Token creado (scopes: repo, workflow)
- [ ] Secrets configurados: HUBSPOT_API_KEY, HUBSPOT_PORTAL_ID

### HubSpot
- [ ] Personal Access Key con scopes:
  - `crm.objects.contacts.read`
  - `crm.objects.contacts.write`
  - `crm.objects.deals.write`
  - `crm.objects.tickets.write`
- [ ] Pipeline "Visual Trans 2026" creado

### Google Apps Script
- [ ] Script desplegado
- [ ] Properties configuradas (GITHUB_WEBHOOK_URL)
- [ ] Trigger "checkNewEmails" cada 5 minutos
- [ ] Label "Procesado-HubSpot" creado

---

## 🔐 Seguridad

### Secretos
- ✅ Almacenados en GitHub Secrets (nunca en código)
- ✅ Almacenados en Properties Service (Google Apps Script)
- ✅ No se exponen en logs

### Autenticación
- ✅ OAuth 2.0 en Google
- ✅ Tokens en Headers
- ✅ API Keys en Bearer tokens

### Datos
- ✅ Emails completos encriptados en Drive
- ✅ Acceso solo a slopezvigo@gmail.com
- ✅ Labels para auditoría

---

## 📈 Monitoreo

### En Google Apps Script
```javascript
// Ver emails pendientes
GmailApp.search('to:slopezvigo@gmail.com -label:Procesado-HubSpot').length

// Ver emails procesados
GmailApp.search('to:slopezvigo@gmail.com label:Procesado-HubSpot').length

// Ver logs
Logs → Ctrl+Shift+J
```

### En GitHub Actions
```
Actions → Email Sensor → HubSpot Sync
→ Click en último run para ver logs
```

### En HubSpot
```
Contactos: source = "email_sensor_slopezvigo"
Deals: pipeline = "Visual Trans 2026"
Tickets: category = "incoming_email"
```

---

## 🛠️ Troubleshooting

### ❌ "GITHUB_WEBHOOK_URL no configurada"
**Solución:** Ve a Google Apps Script → Project Settings → Properties y configura GITHUB_WEBHOOK_URL

### ❌ "HUBSPOT_API_KEY not found"
**Solución:** Agrega secret en GitHub Settings → Secrets

### ❌ Workflow no se dispara
**Solución:** Verifica GitHub Token tiene scope `workflow`

### ❌ Email duplicado en HubSpot
**Solución:** Marca manualmente el email con label `Procesado-HubSpot` en Gmail

Ver más en [SETUP_GUIDE.md](docs/SETUP_GUIDE.md#-troubleshooting)

---

## 📞 Soporte

### Logs
- **Google Apps Script**: Ctrl+Shift+J
- **GitHub Actions**: Actions tab → Workflow logs
- **HubSpot**: Activity timeline en contacto/deal

### Contacto
- Email: arivas@visualms.com
- GitHub Issues: [Crear issue](https://github.com/arivas-web/prueba-mailing-aduanas/issues)

---

## 📄 License

MIT - Libre para usar, modificar y distribuir

---

## 👥 Contributors

- Visual Trans Automation Team
- Powered by Claude Code

---

**Última actualización:** 2026-09-25
**Versión:** 1.0.0
**Status:** ✅ Production Ready

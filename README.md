# 📧 Email AEAT → Borrador HubSpot

**Sistema automático** que detecta emails de la AEAT recibidos en `arivas@visualtrans.com` y genera un **borrador** en la plantilla de HubSpot **"Visual Trans 2026"** con el contenido pegado tal cual. **No se envía nada automáticamente** — el envío final lo hace la persona manualmente desde HubSpot.

---

## ✨ Cómo Funciona

1. Llega un email a `arivas@visualtrans.com`
2. **Solo se procesa si el asunto contiene "correo aeat"** (no distingue mayúsculas/minúsculas)
3. Se genera un **borrador** en HubSpot, clonando la plantilla "Visual Trans 2026"
4. El contenido del email se pega **tal cual** en el borrador
5. **No se crean contactos, deals ni tickets. No se envía nada.**
6. La persona revisa el borrador en HubSpot y lo envía cuando quiera

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│    Gmail: arivas@visualtrans.com        │
└──────────────┬──────────────────────────┘
               │  asunto contiene "correo aeat"
               ↓ (cada 5 min)
┌─────────────────────────────────────────┐
│    Google Apps Script                   │
│    • Filtra por remitente + asunto      │
│    • Extrae contenido completo          │
│    • Envía webhook a GitHub             │
└──────────────┬──────────────────────────┘
               │
               ↓ (repository_dispatch)
┌─────────────────────────────────────────┐
│    GitHub Actions Workflow              │
│    • Genera Borrador en HubSpot         │
└──────────────┬──────────────────────────┘
               │
               ↓ (API calls)
┌─────────────────────────────────────────┐
│    HubSpot                              │
│    • Clona plantilla "Visual Trans 2026"│
│    • Pega el email tal cual (BORRADOR)  │
│    • NO se envía                        │
└─────────────────────────────────────────┘
```

---

## 🚀 Quick Start

Ver **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** para el setup paso a paso.

Resumen:

```bash
npm install
npm run setup           # Pide credenciales (GitHub Token, HubSpot API Key/Portal ID)
npm run deploy-secrets  # Configura los secrets en GitHub
npm run validate        # Verifica que todo esté correcto
```

Después, despliega manualmente el Google Apps Script en la cuenta de Google
que gestiona `arivas@visualtrans.com` (ver `docs/GOOGLE_APPS_SCRIPT_SETUP.md`).

---

## 📁 Estructura del Proyecto

```
prueba-mailing-aduanas/
├── .github/workflows/
│   └── email-to-hubspot.yml          # Workflow: genera el borrador
├── google-apps-script/
│   └── EmailSensor.gs                # Filtra por asunto "correo aeat"
├── scripts/
│   └── sync-email-to-hubspot.js      # Clona plantilla y pega el email
├── docs/
│   └── SETUP_GUIDE.md
├── .env.example
├── package.json
└── README.md
```

---

## 🔧 Componentes

### 📧 Google Apps Script
**Archivo:** `google-apps-script/EmailSensor.gs`

- Corre en la cuenta de Google que gestiona `arivas@visualtrans.com`
- Busca cada 5 minutos: `to:arivas@visualtrans.com subject:"correo aeat"`
- Ignora cualquier otro email (aunque llegue a la misma cuenta)
- Envía el email completo como `repository_dispatch` a GitHub

### 🚀 GitHub Actions
**Archivo:** `.github/workflows/email-to-hubspot.yml`

- Recibe el webhook y ejecuta `sync-email-to-hubspot.js`
- Publica un resumen del resultado en el Job Summary

### 🔄 Sync Script
**Archivo:** `scripts/sync-email-to-hubspot.js`

- Busca la plantilla `"Visual Trans 2026"` en HubSpot (Marketing Email API)
- La **clona** (queda como borrador nuevo, no toca la plantilla original)
- Pega el contenido del email (HTML u texto plano) en el módulo de contenido
  configurado (`HUBSPOT_BODY_WIDGET_NAME`, por defecto `email_body`)
- **No crea contactos, deals ni tickets**
- **No envía el borrador** — eso lo hace la persona en HubSpot

> ⚠️ El nombre del módulo (`email_body`) depende de cómo esté montada la
> plantilla real en HubSpot. Si el borrador se crea pero el contenido no
> aparece pegado, ajusta la variable `HUBSPOT_BODY_WIDGET_NAME` al nombre
> real del módulo de esa plantilla.

---

## 📋 Configuración Requerida

### GitHub Secrets
- `HUBSPOT_API_KEY` — Private App Token con scope de escritura sobre `marketing-email`
- `HUBSPOT_PORTAL_ID` — Portal ID de HubSpot (opcional, solo para el link del resumen)

### GitHub Variables (opcional)
- `HUBSPOT_BODY_WIDGET_NAME` — nombre del módulo de contenido en la plantilla, si es distinto de `email_body`

### Google Apps Script (Properties)
- `GITHUB_WEBHOOK_URL` = `https://api.github.com/repos/arivas-web/prueba-mailing-aduanas/dispatches`
- `GITHUB_TOKEN` = tu Personal Access Token de GitHub (scopes `repo` + `workflow`)
- `ADMIN_EMAIL` = `arivas@visualtrans.com`
- `DRIVE_FOLDER_ID` (opcional, solo si quieres guardar adjuntos)

---

## 🧪 Testing

```bash
# Test local con un email de ejemplo
TEST_MODE=true TEST_EMAIL_JSON='{
  "subject": "Correo AEAT - Notificación",
  "from": "notificaciones@aeat.es",
  "to": "arivas@visualtrans.com",
  "timestamp": "2026-09-25T10:00:00Z",
  "plainText": "Contenido de prueba",
  "htmlBody": "<p>Contenido de prueba</p>"
}' HUBSPOT_API_KEY=xxx node scripts/sync-email-to-hubspot.js
```

En Google Apps Script:
```javascript
testEmailSensor();
```

---

## 📞 Soporte

- Logs de Google Apps Script: Ctrl+Shift+J en el editor
- Logs de GitHub Actions: pestaña **Actions** del repositorio
- Documentación: `docs/SETUP_GUIDE.md`, `docs/GOOGLE_APPS_SCRIPT_SETUP.md`

---

**Última actualización:** 2026-09-25
**Versión:** 2.0.0 — Solo genera borrador de email (sin CRM)

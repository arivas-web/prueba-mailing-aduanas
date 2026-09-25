# ⚡ Quick Deploy - Email AEAT → Borrador HubSpot

**Setup en 4 pasos.**

---

## 🚀 Paso 1: Ejecutar Setup Automático

```bash
cd /home/user/prueba-mailing-aduanas
npm install
npm run setup
```

**Qué pasa:**
- Te pide GitHub Token
- Te pide HubSpot API Key
- Te pide HubSpot Portal ID
- Crea archivo `.env` con tu configuración

**Dónde obtener credenciales:**

| Credencial | Obtén en |
|-----------|----------|
| **GitHub Token** | https://github.com/settings/tokens → Generar nuevo (classic) → Scopes: repo, workflow |
| **HubSpot API Key** | https://app.hubspot.com/personal-access-key (scope: `content` / marketing email write) |
| **HubSpot Portal ID** | HubSpot → Settings → Account Defaults |

---

## 🔐 Paso 2: Configurar GitHub Secrets

```bash
npm run deploy-secrets
```

**Si no tiene gh CLI:**
1. Ve a: https://github.com/arivas-web/prueba-mailing-aduanas/settings/secrets/actions
2. Añade `HUBSPOT_API_KEY` y `HUBSPOT_PORTAL_ID`

Opcional (solo si el módulo de contenido de la plantilla no se llama `email_body`):
3. Ve a **Settings → Secrets and variables → Actions → Variables**
4. Añade `HUBSPOT_BODY_WIDGET_NAME` con el nombre real del módulo

---

## ✅ Paso 3: Validar Setup

```bash
npm run validate
```

---

## 🚀 Paso 4: Desplegar Google Apps Script (manual, en TU cuenta)

Este script debe vivir en la cuenta de **Google que gestiona `arivas@visualtrans.com`**
(no en una cuenta separada del "agente"), porque `GmailApp` solo puede leer el
correo del usuario autenticado dentro de Google Apps Script.

1. **Abre Google Apps Script:** https://script.google.com/ (con `arivas@visualtrans.com`)
2. **Crea proyecto:** Nuevo proyecto → Nombre: "Email Sensor AEAT"
3. **Copia código:**
   - Archivo: `google-apps-script/EmailSensor.gs`
   - Copia TODO el contenido y pégalo en el editor
   - Ctrl+S guardar
4. **Configura Properties** (edita los valores en `setupProperties()` si hace falta y ejecuta):
   ```javascript
   setupProperties();
   ```
5. **Autoriza Gmail:**
   - Click ▶️ Ejecutar en cualquier función
   - Click "Revisar permisos" → selecciona tu cuenta → "Permitir"
6. **Inicia el sensor** (crea el trigger + la label):
   ```javascript
   setupEmailSensor();
   ```
   Debería mostrar: `✅ Email Sensor configurado`

No hay que elegir ningún "tipo de implementación" (app web, API, complemento,
biblioteca) — el script funciona solo con el trigger por tiempo, sin desplegar nada.

---

## 🧪 Test End-to-End

```bash
# 1. Envía un email a arivas@visualtrans.com
#    con el asunto: "Correo AEAT - lo que sea"
#    (cualquier email SIN ese texto en el asunto se ignora)

# 2. Espera 5 minutos (o ejecuta checkNewEmails() manualmente en Apps Script)

# 3. Ve a HubSpot → Marketing → Email
#    Debería aparecer un nuevo borrador: "[AEAT] Correo AEAT - lo que sea - ..."

# 4. Abre el borrador y revisa que el contenido del email esté pegado

# 5. TÚ decides cuándo enviarlo — el sistema NUNCA lo envía solo
```

---

## 📊 Verificar Status

### Google Apps Script
```javascript
testEmailSensor();
```

### GitHub Actions
```
GitHub.com → Actions → Email AEAT → Borrador HubSpot → último run
```

### HubSpot
```
Marketing → Email → busca por nombre que empiece con "[AEAT]"
```

---

## 🐛 Si Algo Falla

### El email no llega a GitHub
1. En Apps Script ejecuta `checkNewEmails()`
2. Revisa que el asunto contenga literalmente "correo aeat" (mayúsc/minúsc no importa)
3. Revisa Logs (Ctrl+Shift+J) en busca de errores de `sendToGitHubWebhook`

### El borrador se crea pero está vacío
- El nombre del módulo de contenido de la plantilla no coincide con `HUBSPOT_BODY_WIDGET_NAME`
- Revisa el log del workflow en GitHub Actions: dice qué nombre de módulo buscó
- Ajusta la variable `HUBSPOT_BODY_WIDGET_NAME` al nombre real del módulo en HubSpot

### Error: "No se encontró ninguna plantilla llamada Visual Trans 2026"
- Verifica que exista un email de marketing con ese nombre EXACTO en HubSpot
- El HUBSPOT_API_KEY debe tener permisos sobre Marketing Email

---

## 📞 Soporte

- Logs de Google Apps Script: Ctrl+Shift+J en el editor
- Logs de GitHub Actions: https://github.com/arivas-web/prueba-mailing-aduanas/actions
- Documentación: `docs/SETUP_GUIDE.md`, `docs/GOOGLE_APPS_SCRIPT_SETUP.md`

---

## ✨ Así Funciona

```
Email a arivas@visualtrans.com
  ↓ (asunto contiene "correo aeat"?)
  no → se ignora
  sí ↓
Google Apps Script detecta (cada 5 min)
  ↓ (envía webhook)
GitHub Actions procesa
  ↓ (clona plantilla "Visual Trans 2026")
HubSpot crea BORRADOR con el email pegado tal cual
  ↓
TÚ revisas y envías manualmente
```

---

**Estado:** Listo para Deploy
**Complejidad:** Baja — no crea contactos, deals ni tickets

```bash
npm run setup
```

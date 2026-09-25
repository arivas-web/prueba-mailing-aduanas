# ⚡ Quick Deploy - Email Sensor

**Setup en 3 pasos. 5 minutos. Todo automatizado.**

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
| **HubSpot API Key** | https://app.hubspot.com/personal-access-key |
| **HubSpot Portal ID** | HubSpot → Settings → Account Defaults |

---

## 🔐 Paso 2: Configurar GitHub Secrets

```bash
npm run deploy-secrets
```

**Automáticamente:**
- Lee tu .env
- Configura HUBSPOT_API_KEY en GitHub
- Configura HUBSPOT_PORTAL_ID en GitHub

**Si no tiene gh CLI:**
1. Ve a: https://github.com/arivas-web/prueba-mailing-aduanas/settings/secrets/actions
2. Click "New repository secret"
3. Copia los valores del archivo .env

---

## ✅ Paso 3: Validar Setup

```bash
npm run validate
```

Deberías ver: `✅ Sistema completamente configurado`

---

## 🚀 Paso 4: Desplegar Google Apps Script

**Automáticamente (requiere API):**
```bash
# Coming soon - deployment via Google Apps Script API
# Por ahora, sigue manual setup abajo
```

**Manual (5 minutos):**

1. **Abre Google Apps Script:** https://script.google.com/
2. **Crea proyecto:** Nuevo proyecto → Nombre: "Email Sensor slopezvigo"
3. **Copia código:**
   - Archivo: `google-apps-script/EmailSensor.gs`
   - Copia TODO el contenido
   - Pega en el editor de Google Apps Script
   - Ctrl+S guardar
4. **Configura Properties:**
   - Ejecuta esta función en la consola:
   ```javascript
   setupProperties();
   ```
   Debería mostrar en logs: ✅ Properties configuradas
5. **Autoriza Gmail:**
   - Click ▶️ Ejecutar en cualquier función
   - Click "Revisar permisos"
   - Selecciona tu cuenta
   - Click "Permitir"
6. **Crea Label:**
   - Ejecuta en consola:
   ```javascript
   createLabelIfNotExists('Procesado-HubSpot');
   ```
7. **Inicia el sensor:**
   - Ejecuta en consola:
   ```javascript
   setupEmailSensor();
   ```
   Debería mostrar: ✅ Email Sensor configurado

---

## 🧪 Test End-to-End

```bash
# 1. Envía email a slopezvigo@gmail.com
#    (desde otra cuenta o cliente de email)

# 2. Espera 5 minutos (o ejecuta manualmente)

# 3. Ve a HubSpot → Contactos
#    Deberías ver el contacto creado automáticamente

# 4. Abre el contacto y verifica:
#    ✅ Deal en BORRADOR en "Visual Trans 2026"
#    ✅ Ticket en BORRADOR con contenido del email

# 5. Revisa los borradores en HubSpot:
#    - Edita si necesario
#    - Completa la información
#    - TÚ ENVÍAS/PUBLICAS cuando esté listo
```

---

## 📊 Verificar Status

### Google Apps Script
```javascript
// En el editor de Google Apps Script, ejecuta:
testEmailSensor();
```

### GitHub Actions
```
GitHub.com → Actions → Email Sensor → último run
```

### HubSpot
```
Filtrar Contactos por: source = "email_sensor_slopezvigo"
```

---

## 🐛 Si Algo Falla

### Error: "setup no es un comando"
```bash
npm install
npm run setup
```

### Error: "gh command not found"
```bash
# Instala GitHub CLI
# macOS: brew install gh
# Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md
# Windows: https://cli.github.com/

gh auth login
npm run deploy-secrets
```

### Error: "Google Apps Script no autoriza"
```javascript
// Ejecuta cualquier función y autoriza permisos
Logger.log('test');
// Click ▶️ Ejecutar
// Autoriza cuando pida
```

### Email no aparece en HubSpot
1. Ve a Google Apps Script
2. Ejecuta: `checkNewEmails()`
3. Revisa Logs (Ctrl+Shift+J)
4. Busca errores
5. Envía otro email y espera 5 minutos

---

## 📞 Soporte

**Logs:**
- Google Apps Script: Ctrl+Shift+J en el editor
- GitHub Actions: https://github.com/arivas-web/prueba-mailing-aduanas/actions
- HubSpot: Contacto → Activity

**Documentación completa:**
- `docs/SETUP_GUIDE.md` - Setup completo
- `docs/QUICK_REFERENCE.md` - Operaciones comunes
- `README.md` - Overview del proyecto

---

## ✨ Así Funciona

```
Email → Gmail
  ↓ (cada 5 min)
Google Apps Script detecta
  ↓ (envía webhook)
GitHub Actions procesa
  ↓ (ejecuta script)
HubSpot API actualiza
  ↓
✅ Contacto + Deal + Ticket
```

---

**Estado:** Listo para Deploy  
**Tiempo:** 5-10 minutos  
**Complejidad:** Baja  

¡Empecemos! 🚀

```bash
npm run setup
```

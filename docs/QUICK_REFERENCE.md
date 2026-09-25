# ⚡ Quick Reference - Email Sensor

Una guía rápida para operaciones comunes.

---

## 🚨 Emergencias

### Email no aparece en HubSpot
```javascript
// Google Apps Script Console
// 1. Verificar emails pendientes
GmailApp.search('to:slopezvigo@gmail.com -label:Procesado-HubSpot').length

// 2. Ejecutar check manual
checkNewEmails();

// 3. Ver últimos logs
// Logs → Ctrl+Shift+J
```

### Resetear todo
```javascript
// Google Apps Script
// ⚠️ SOLO SI ES NECESARIO

// 1. Eliminar triggers
ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

// 2. Eliminar label
const label = GmailApp.getUserLabelByName('Procesado-HubSpot');
GmailApp.getInboxThreads().forEach(t => label.removeFromThread(t));

// 3. Re-setup
setupEmailSensor();
```

---

## 📧 Operaciones en Gmail

### Ver emails pendientes
```javascript
const threads = GmailApp.search('to:slopezvigo@gmail.com -label:Procesado-HubSpot');
Logger.log('Pendientes: ' + threads.length);

threads.forEach(t => {
  const msg = t.getMessages()[0];
  Logger.log(`- ${msg.getFrom()}: ${msg.getSubject()}`);
});
```

### Ver emails procesados
```javascript
const threads = GmailApp.search('to:slopezvigo@gmail.com label:Procesado-HubSpot');
Logger.log('Procesados: ' + threads.length);
```

### Marcar email como procesado
```javascript
const threads = GmailApp.search('from:cliente@example.com subject:algo');
const label = GmailApp.getUserLabelByName('Procesado-HubSpot');

threads.forEach(t => {
  label.addToThread(t);
  Logger.log('✅ Marcado');
});
```

### Marcar email como pendiente
```javascript
const threads = GmailApp.search('from:cliente@example.com');
const label = GmailApp.getUserLabelByName('Procesado-HubSpot');

threads.forEach(t => {
  label.removeFromThread(t);
  Logger.log('❌ Remarcado como pendiente');
});
```

---

## 🚀 Operaciones en GitHub

### Disparar workflow manualmente
```bash
# Opción 1: CLI
gh workflow run email-to-hubspot.yml

# Opción 2: Web
# GitHub.com → Actions → Email Sensor → HubSpot Sync → Run workflow
```

### Testing con email de ejemplo
```bash
gh workflow run email-to-hubspot.yml \
  -f test_email_json='{
    "timestamp": "2026-09-25T10:00:00Z",
    "from": "test@example.com",
    "subject": "Test Email",
    "to": "slopezvigo@gmail.com",
    "cc": "",
    "plainText": "Este es un test",
    "htmlBody": "<p>Este es un test</p>",
    "attachments": [],
    "messageId": "test-123",
    "threadId": "test-thread"
  }'
```

### Ver últimos runs
```bash
gh run list --workflow email-to-hubspot.yml --limit 5
```

### Ver logs de un run
```bash
# Obtén el RUN_ID del comando anterior
gh run view RUN_ID --log

# O interactivamente
gh run view --web
```

---

## 🔑 Operaciones en HubSpot

### Ver contactos creados por sensor
```
Contactos → Filtros
Agregar: Source is exactly "email_sensor_slopezvigo"
```

### Ver deals en Visual Trans 2026
```
Deals → Filtros
Agregar: Pipeline is exactly "Visual Trans 2026"
```

### Ver tickets de emails
```
Tickets → Filtros
Agregar: Category is exactly "incoming_email"
```

### Asociar Deal a Contacto manualmente
1. Abre el Deal
2. Click en "Contactos asociados"
3. Click "Asociar contacto existente"
4. Selecciona contacto

---

## 🔍 Debugging

### Habilitar modo debug en Google Apps Script
```javascript
// Al inicio del script, agrega:
const DEBUG = true;

// Luego usa:
if (DEBUG) Logger.log('Debug info: ' + data);
```

### Ver estructura del email recibido
```javascript
function debugEmail() {
  const threads = GmailApp.search('to:slopezvigo@gmail.com -label:Procesado-HubSpot', 0, 1);
  
  if (threads.length === 0) {
    Logger.log('No hay emails');
    return;
  }
  
  const message = threads[0].getMessages()[0];
  const emailData = extractEmailData(message);
  
  Logger.log(JSON.stringify(emailData, null, 2));
}

// Ejecuta y revisa Logs
debugEmail();
```

### Probar webhook manualmente
```bash
# Test webhook con curl
curl -X POST https://api.github.com/repos/arivas-web/prueba-mailing-aduanas/dispatches \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{
    "event_type": "email_received",
    "client_payload": {
      "email": {
        "from": "test@example.com",
        "subject": "Test",
        "timestamp": "2026-09-25T10:00:00Z",
        "plainText": "Test body",
        "to": "slopezvigo@gmail.com"
      }
    }
  }'
```

---

## 📊 Métricas Útiles

### Emails procesados hoy
```javascript
const today = new Date();
const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

const threads = GmailApp.search(`to:slopezvigo@gmail.com label:Procesado-HubSpot after:${Math.floor(startOfDay.getTime()/1000)}`);

Logger.log('📊 Emails hoy: ' + threads.length);
```

### Tasa de procesamiento
```javascript
const all = GmailApp.search('to:slopezvigo@gmail.com').length;
const processed = GmailApp.search('to:slopezvigo@gmail.com label:Procesado-HubSpot').length;
const pending = all - processed;

Logger.log(`
📈 Estadísticas:
- Total: ${all}
- Procesados: ${processed} (${Math.round(processed/all*100)}%)
- Pendientes: ${pending}
`);
```

---

## 🔐 Actualizar Secretos

### Cambiar GitHub Token
```bash
# 1. Generar nuevo token en GitHub
# Settings → Developer settings → Tokens

# 2. Actualizar en Google Apps Script
# Project Settings → Properties
# GITHUB_WEBHOOK_URL = ... (con nuevo token en la URL)

# 3. O si usas headers, actualizar en EmailSensor.gs
const options = {
  method: 'post',
  headers: {
    'Authorization': 'token NEW_TOKEN',
  },
  // ...
};
```

### Cambiar HubSpot API Key
```bash
# 1. Generar nueva key en HubSpot
# https://app.hubspot.com/personal-access-key

# 2. Actualizar en GitHub
# Settings → Secrets and variables → Actions
# HUBSPOT_API_KEY = pat-na1-...

# 3. Re-ejecutar workflow
gh workflow run email-to-hubspot.yml
```

---

## 🎯 Checklist de Setup Inicial

- [ ] Google Cloud Project creado
- [ ] Google Apps Script API habilitada
- [ ] Google Apps Script project creado
- [ ] EmailSensor.gs copiado
- [ ] Properties configuradas
- [ ] Gmail label creado
- [ ] Trigger configurado cada 5 min
- [ ] GitHub Token generado
- [ ] GitHub Secrets configurados
- [ ] HubSpot API Key generada
- [ ] HubSpot Portal ID obtenido
- [ ] Pipeline "Visual Trans 2026" existe
- [ ] Workflow desplegado
- [ ] Test completado ✅

---

## 📞 Contacts

**HubSpot Support**: https://help.hubspot.com
**GitHub Docs**: https://docs.github.com
**Google Apps Script**: https://developers.google.com/apps-script
**GitHub Issues**: https://github.com/arivas-web/prueba-mailing-aduanas/issues

---

**Última actualización:** 2026-09-25

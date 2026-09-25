// Email Sensor para arivas@visualtrans.com
// Detecta SOLO emails cuyo asunto contiene "correo aeat"
// y los envía a GitHub Actions para generar un borrador en HubSpot

const CONFIG = {
  TARGET_EMAIL: 'arivas@visualtrans.com',
  SUBJECT_FILTER: 'correo aeat', // Gmail search no distingue mayúsculas/minúsculas
  GITHUB_WEBHOOK_URL: PropertiesService.getScriptProperties().getProperty('GITHUB_WEBHOOK_URL'),
  GITHUB_TOKEN: PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN'),
  LABEL_NAME: 'Procesado-HubSpot-AEAT',
  CHECK_INTERVAL_MINUTES: 5,
};

function setupEmailSensor() {
  createLabelIfNotExists(CONFIG.LABEL_NAME);

  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (trigger.getHandlerFunction() === 'checkNewEmails') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger('checkNewEmails')
    .timeBased()
    .everyMinutes(CONFIG.CHECK_INTERVAL_MINUTES)
    .create();

  Logger.log('✅ Email Sensor configurado.');
  Logger.log('   Cuenta: ' + CONFIG.TARGET_EMAIL);
  Logger.log('   Filtro de asunto: "' + CONFIG.SUBJECT_FILTER + '"');
  Logger.log('   Revisando cada ' + CONFIG.CHECK_INTERVAL_MINUTES + ' minutos');
}

function checkNewEmails() {
  try {
    // Solo busca emails cuyo asunto contenga el filtro configurado
    const query = 'to:' + CONFIG.TARGET_EMAIL +
      ' subject:"' + CONFIG.SUBJECT_FILTER + '"' +
      ' -label:' + CONFIG.LABEL_NAME;

    const threads = GmailApp.search(query, 0, 50);

    if (threads.length === 0) {
      Logger.log('📭 No hay emails nuevos con asunto "' + CONFIG.SUBJECT_FILTER + '"');
      return;
    }

    Logger.log('📧 Encontrados ' + threads.length + ' emails que coinciden con el filtro');

    threads.forEach(thread => {
      const messages = thread.getMessages();

      messages.forEach(message => {
        // Doble verificación: el asunto debe contener el filtro (case-insensitive)
        const subject = message.getSubject() || '';
        if (subject.toLowerCase().indexOf(CONFIG.SUBJECT_FILTER.toLowerCase()) === -1) {
          return;
        }

        const emailData = extractEmailData(message);
        sendToGitHubWebhook(emailData);

        const label = GmailApp.getUserLabelByName(CONFIG.LABEL_NAME);
        label.addToThread(thread);

        Logger.log('✅ Email enviado a GitHub: ' + emailData.subject);
      });
    });

  } catch (error) {
    Logger.log('❌ Error en checkNewEmails: ' + error.toString());
    sendErrorNotification(error);
  }
}

function extractEmailData(message) {
  return {
    timestamp: new Date(message.getDate()).toISOString(),
    from: message.getFrom(),
    subject: message.getSubject(),
    to: message.getTo(),
    cc: message.getCc() || '',
    bcc: message.getBcc() || '',
    plainText: message.getPlainBody(),
    htmlBody: message.getBody(),
    attachments: extractAttachments(message),
    messageId: message.getId(),
    threadId: message.getThread().getId(),
  };
}

function extractAttachments(message) {
  const attachments = [];
  const msgAttachments = message.getAttachments();
  const driveFolderId = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID');

  if (!driveFolderId) {
    // Sin carpeta configurada, se omiten adjuntos (no es obligatorio para este flujo)
    return attachments;
  }

  msgAttachments.forEach(attachment => {
    attachments.push({
      filename: attachment.getFileName(),
      mimeType: attachment.getContentType(),
      driveUrl: saveAttachmentToDrive(attachment, driveFolderId),
    });
  });

  return attachments;
}

function saveAttachmentToDrive(attachment, driveFolderId) {
  try {
    const folder = DriveApp.getFolderById(driveFolderId);
    const file = folder.createFile(attachment.getFileName(), attachment.getDataAsBlob());
    return file.getUrl();
  } catch (e) {
    Logger.log('⚠️ Error guardando adjunto: ' + e.toString());
    return null;
  }
}

function sendToGitHubWebhook(emailData) {
  if (!CONFIG.GITHUB_WEBHOOK_URL) {
    throw new Error('GITHUB_WEBHOOK_URL no está configurada en Propiedades de secuencias de comandos');
  }
  if (!CONFIG.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN no está configurado en Propiedades de secuencias de comandos');
  }

  const payload = {
    event_type: 'email_received',
    client_payload: {
      email: emailData,
      timestamp: new Date().toISOString(),
      source: 'google-apps-script-sensor',
    },
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'token ' + CONFIG.GITHUB_TOKEN,
      Accept: 'application/vnd.github.v3+json',
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(CONFIG.GITHUB_WEBHOOK_URL, options);
    const responseCode = response.getResponseCode();

    if (responseCode !== 200 && responseCode !== 201 && responseCode !== 204) {
      Logger.log('⚠️ GitHub webhook respondió con: ' + responseCode);
      Logger.log('Respuesta: ' + response.getContentText());
    } else {
      Logger.log('✅ Webhook enviado exitosamente');
    }
  } catch (error) {
    Logger.log('❌ Error al enviar webhook: ' + error.toString());
    throw error;
  }
}

function createLabelIfNotExists(labelName) {
  try {
    GmailApp.getUserLabelByName(labelName);
  } catch (e) {
    GmailApp.createLabel(labelName);
    Logger.log('📝 Label creada: ' + labelName);
  }
}

function sendErrorNotification(error) {
  const adminEmail = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');

  if (adminEmail) {
    GmailApp.sendEmail(
      adminEmail,
      '❌ Error en Email Sensor (AEAT)',
      'Ocurrió un error en el sensor de emails:\n\n' + error.toString(),
      { from: 'noreply@script.google.com' }
    );
  }
}

// Configura las Properties del script (ejecutar una sola vez y editar los valores)
function setupProperties() {
  const properties = PropertiesService.getScriptProperties();

  properties.setProperty('GITHUB_WEBHOOK_URL', 'https://api.github.com/repos/arivas-web/prueba-mailing-aduanas/dispatches');
  properties.setProperty('GITHUB_TOKEN', 'PEGA_AQUI_TU_GITHUB_TOKEN'); // ⚠️ editar antes de ejecutar
  // properties.setProperty('DRIVE_FOLDER_ID', 'TU_FOLDER_ID'); // opcional
  properties.setProperty('ADMIN_EMAIL', 'arivas@visualtrans.com');

  Logger.log('✅ Properties configuradas');
}

// Función para testing manual
function testEmailSensor() {
  Logger.log('🧪 Iniciando test del sensor...');

  Logger.log('Configuración:');
  Logger.log('- Email objetivo: ' + CONFIG.TARGET_EMAIL);
  Logger.log('- Filtro de asunto: "' + CONFIG.SUBJECT_FILTER + '"');
  Logger.log('- Webhook URL: ' + (CONFIG.GITHUB_WEBHOOK_URL ? '✅ Configurado' : '❌ No configurado'));
  Logger.log('- GitHub Token: ' + (CONFIG.GITHUB_TOKEN ? '✅ Configurado' : '❌ No configurado'));
  Logger.log('- Check interval: ' + CONFIG.CHECK_INTERVAL_MINUTES + ' minutos');

  checkNewEmails();
  Logger.log('✅ Test completado');
}

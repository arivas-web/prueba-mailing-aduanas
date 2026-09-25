// Email Sensor para slopezvigo@gmail.com
// Detecta emails nuevos y los envía a GitHub Actions webhook

const CONFIG = {
  TARGET_EMAIL: 'slopezvigo@gmail.com',
  GITHUB_WEBHOOK_URL: PropertiesService.getScriptProperties().getProperty('GITHUB_WEBHOOK_URL'),
  LABEL_NAME: 'Procesado-HubSpot',
  CHECK_INTERVAL_MINUTES: 5,
};

function setupEmailSensor() {
  // Crear label si no existe
  createLabelIfNotExists(CONFIG.LABEL_NAME);

  // Programar trigger cada 5 minutos
  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (trigger.getHandlerFunction() === 'checkNewEmails') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger('checkNewEmails')
    .timeBased()
    .everyMinutes(CONFIG.CHECK_INTERVAL_MINUTES)
    .create();

  Logger.log('✅ Email Sensor configurado. Revisando cada ' + CONFIG.CHECK_INTERVAL_MINUTES + ' minutos');
}

function checkNewEmails() {
  try {
    // Buscar emails sin procesar (sin el label)
    const query = 'to:' + CONFIG.TARGET_EMAIL + ' -label:' + CONFIG.LABEL_NAME;
    const threads = GmailApp.search(query, 0, 50);

    if (threads.length === 0) {
      Logger.log('📭 No hay emails nuevos');
      return;
    }

    Logger.log('📧 Encontrados ' + threads.length + ' emails nuevos');

    threads.forEach(thread => {
      const messages = thread.getMessages();

      messages.forEach(message => {
        const emailData = extractEmailData(message);
        sendToGitHubWebhook(emailData);

        // Marcar como procesado
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

  msgAttachments.forEach(attachment => {
    attachments.push({
      filename: attachment.getFileName(),
      mimeType: attachment.getContentType(),
      size: attachment.getDataAsString().length,
      // Para archivos, guardamos en Drive y enviamos link
      driveUrl: saveAttachmentToDrive(attachment),
    });
  });

  return attachments;
}

function saveAttachmentToDrive(attachment) {
  try {
    const folder = DriveApp.getFolderById(
      PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID')
    );

    const file = folder.createFile(
      attachment.getFileName(),
      attachment.getDataAsBlob()
    );

    return file.getUrl();
  } catch (e) {
    Logger.log('⚠️ Error guardando adjunto: ' + e.toString());
    return null;
  }
}

function sendToGitHubWebhook(emailData) {
  if (!CONFIG.GITHUB_WEBHOOK_URL) {
    throw new Error('GITHUB_WEBHOOK_URL no configurada');
  }

  const payload = {
    action: 'email_received',
    email: emailData,
    timestamp: new Date().toISOString(),
    source: 'google-apps-script-sensor',
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(CONFIG.GITHUB_WEBHOOK_URL, options);
    const responseCode = response.getResponseCode();

    if (responseCode !== 200 && responseCode !== 202) {
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
  const properties = PropertiesService.getScriptProperties();
  const adminEmail = properties.getProperty('ADMIN_EMAIL');

  if (adminEmail) {
    GmailApp.sendEmail(
      adminEmail,
      '❌ Error en Email Sensor',
      'Ocurrió un error en el sensor de emails:\n\n' + error.toString(),
      { from: 'noreply@script.google.com' }
    );
  }
}

// Función para testing
function testEmailSensor() {
  Logger.log('🧪 Iniciando test del sensor...');

  // Verificar configuración
  const properties = PropertiesService.getScriptProperties();
  const webhookUrl = properties.getProperty('GITHUB_WEBHOOK_URL');

  Logger.log('Configuración:');
  Logger.log('- Email objetivo: ' + CONFIG.TARGET_EMAIL);
  Logger.log('- Webhook URL: ' + (webhookUrl ? '✅ Configurado' : '❌ No configurado'));
  Logger.log('- Check interval: ' + CONFIG.CHECK_INTERVAL_MINUTES + ' minutos');

  // Intentar un check manual
  checkNewEmails();
  Logger.log('✅ Test completado');
}

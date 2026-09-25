#!/usr/bin/env node

/**
 * Script de sincronización: Email AEAT → Borrador HubSpot
 *
 * Cuando llega un email a arivas@visualtrans.com con "correo aeat" en el asunto,
 * este script clona la plantilla de HubSpot "Visual Trans 2026" y pega el
 * contenido del email TAL CUAL en el borrador resultante.
 *
 * NO crea contactos, deals ni tickets. Solo genera el borrador del email.
 * El envío final lo hace la persona manualmente desde HubSpot.
 */

const axios = require('axios');

// ==================== CONFIGURACIÓN ====================
const config = {
  hubspotApiKey: process.env.HUBSPOT_API_KEY,
  hubspotPortalId: process.env.HUBSPOT_PORTAL_ID,
  templateName: process.env.HUBSPOT_TEMPLATE_NAME || 'Visual Trans 2026',
  // Nombre del módulo de contenido (rich text / HTML) dentro de la plantilla
  // donde se pega el cuerpo del email. Ajustar según cómo esté montada
  // la plantilla real en HubSpot.
  bodyWidgetName: process.env.HUBSPOT_BODY_WIDGET_NAME || 'email_body',
  testMode: process.env.TEST_MODE === 'true',
  testEmailJson: process.env.TEST_EMAIL_JSON,
};

const HUBSPOT_API_URL = 'https://api.hubapi.com';

const hubspotHeaders = () => ({
  Authorization: `Bearer ${config.hubspotApiKey}`,
  'Content-Type': 'application/json',
});

// ==================== LOGGING ====================
const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  success: (msg) => console.log(`OK: ${msg}`),
  error: (msg) => console.error(`ERROR: ${msg}`),
  warn: (msg) => console.warn(`WARN: ${msg}`),
};

// ==================== VALIDACIÓN ====================
function validateConfig() {
  if (!config.hubspotApiKey) {
    throw new Error('HUBSPOT_API_KEY no está configurada');
  }
  log.info('Configuración validada');
}

// ==================== OBTENER EMAIL ====================
function getEmailData() {
  let emailData;

  if (config.testMode && config.testEmailJson) {
    log.info('Modo TEST - usando email de ejemplo');
    emailData = JSON.parse(config.testEmailJson);
  } else {
    const emailJson = process.env.EMAIL_DATA;
    if (!emailJson) {
      throw new Error('EMAIL_DATA no está disponible');
    }
    emailData = JSON.parse(emailJson);
  }

  if (!emailData.subject || !emailData.from) {
    throw new Error('Email inválido: falta subject o from');
  }

  // Filtro de seguridad: solo se procesan emails de AEAT
  const subjectLower = (emailData.subject || '').toLowerCase();
  if (subjectLower.indexOf('correo aeat') === -1) {
    throw new Error(`El asunto no contiene "correo aeat": "${emailData.subject}"`);
  }

  return emailData;
}

// ==================== BUSCAR PLANTILLA EN HUBSPOT ====================
async function findTemplateEmail() {
  log.info(`Buscando plantilla "${config.templateName}" en HubSpot`);

  const response = await axios.get(`${HUBSPOT_API_URL}/marketing/v3/emails`, {
    headers: hubspotHeaders(),
    params: { limit: 100 },
  });

  const match = (response.data.results || []).find(
    (e) => e.name === config.templateName
  );

  if (!match) {
    throw new Error(
      `No se encontró ninguna plantilla/email llamado "${config.templateName}" en HubSpot`
    );
  }

  log.success(`Plantilla encontrada: ${match.id}`);
  return match;
}

// ==================== CLONAR PLANTILLA (BORRADOR) ====================
async function cloneTemplateEmail(templateEmail, email) {
  const cloneName = `[AEAT] ${email.subject} - ${email.timestamp}`;
  log.info(`Clonando plantilla como borrador: "${cloneName}"`);

  const response = await axios.post(
    `${HUBSPOT_API_URL}/marketing/v3/emails/${templateEmail.id}/clone`,
    { name: cloneName },
    { headers: hubspotHeaders() }
  );

  log.success(`Borrador creado: ${response.data.id}`);
  return response.data;
}

// ==================== PEGAR EL EMAIL TAL CUAL EN EL BORRADOR ====================
async function fillDraftWithEmailContent(clonedEmail, email) {
  log.info(`Rellenando borrador ${clonedEmail.id} con el contenido del email`);

  const fullEmail = await axios.get(
    `${HUBSPOT_API_URL}/marketing/v3/emails/${clonedEmail.id}`,
    { headers: hubspotHeaders() }
  );

  const content = fullEmail.data.content || {};
  const widgets = content.widgets || {};

  if (widgets[config.bodyWidgetName]) {
    widgets[config.bodyWidgetName].body = widgets[config.bodyWidgetName].body || {};
    widgets[config.bodyWidgetName].body.html = buildEmailHtml(email);
  } else {
    log.warn(
      `No se encontró el módulo "${config.bodyWidgetName}" en la plantilla. ` +
      `El borrador se creó pero hay que pegar el contenido manualmente. ` +
      `Ajusta HUBSPOT_BODY_WIDGET_NAME al nombre real del módulo de la plantilla.`
    );
  }

  const updatePayload = {
    subject: email.subject,
    content: { ...content, widgets },
  };

  await axios.patch(
    `${HUBSPOT_API_URL}/marketing/v3/emails/${clonedEmail.id}`,
    updatePayload,
    { headers: hubspotHeaders() }
  );

  log.success('Contenido del email pegado en el borrador');
}

function buildEmailHtml(email) {
  // Se pega el email tal cual: si hay HTML original, se usa directamente.
  if (email.htmlBody) {
    return email.htmlBody;
  }
  return `<pre>${escapeHtml(email.plainText || '')}</pre>`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ==================== FUNCIÓN PRINCIPAL ====================
async function main() {
  try {
    log.info('Iniciando: Email AEAT -> Borrador HubSpot');
    log.info(`Modo: ${config.testMode ? 'TEST' : 'PRODUCCIÓN'}`);

    validateConfig();
    const emailData = getEmailData();

    log.info(`Procesando email:`);
    log.info(`  Asunto: ${emailData.subject}`);
    log.info(`  De: ${emailData.from}`);

    const templateEmail = await findTemplateEmail();
    const clonedEmail = await cloneTemplateEmail(templateEmail, emailData);
    await fillDraftWithEmailContent(clonedEmail, emailData);

    log.success('Borrador generado en HubSpot. NO se ha enviado.');
    log.info(`Email (borrador) ID: ${clonedEmail.id}`);
    if (config.hubspotPortalId) {
      log.info(
        `Editar en: https://app.hubspot.com/email/${config.hubspotPortalId}/edit/${clonedEmail.id}`
      );
    }
    log.info('ACCION REQUERIDA: revisa el borrador en HubSpot y envíalo tú manualmente.');

    console.log(`::set-output name=email_subject::${emailData.subject}`);
    console.log(`::set-output name=hubspot_email_id::${clonedEmail.id}`);

    process.exit(0);

  } catch (error) {
    log.error(error.message);
    if (error.response?.data) {
      log.error('Respuesta HubSpot: ' + JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { findTemplateEmail, cloneTemplateEmail, fillDraftWithEmailContent };

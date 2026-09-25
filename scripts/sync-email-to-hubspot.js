#!/usr/bin/env node

/**
 * Script de sincronización: Email → HubSpot
 * Procesa emails recibidos en slopezvigo@gmail.com y los crea/actualiza en HubSpot
 */

const axios = require('axios');

// ==================== CONFIGURACIÓN ====================
const config = {
  hubspotApiKey: process.env.HUBSPOT_API_KEY,
  hubspotPortalId: process.env.HUBSPOT_PORTAL_ID,
  templateName: process.env.HUBSPOT_TEMPLATE_NAME || 'Visual Trans 2026',
  testMode: process.env.TEST_MODE === 'true',
  testEmailJson: process.env.TEST_EMAIL_JSON,
};

const HUBSPOT_API_URL = 'https://api.hubapi.com';

// ==================== LOGGING ====================
const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  warn: (msg) => console.warn(`⚠️ ${msg}`),
  debug: (msg) => process.env.DEBUG && console.log(`[DEBUG] ${msg}`),
};

// ==================== VALIDACIÓN ====================
function validateConfig() {
  if (!config.hubspotApiKey) {
    throw new Error('HUBSPOT_API_KEY no está configurada');
  }

  if (!config.hubspotPortalId) {
    throw new Error('HUBSPOT_PORTAL_ID no está configurada');
  }

  log.info('✅ Configuración validada');
}

// ==================== OBTENER EMAIL ====================
function getEmailData() {
  let emailData;

  if (config.testMode && config.testEmailJson) {
    log.info('🧪 Modo TEST - usando email de ejemplo');
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

  return emailData;
}

// ==================== CREAR/ACTUALIZAR CONTACT EN HUBSPOT ====================
async function upsertContact(email) {
  log.info(`📧 Creando/actualizando contacto: ${email.from}`);

  // Extraer nombre y email del campo "from"
  const fromMatch = email.from.match(/(.+?)\s*<(.+?)>/);
  const contactName = fromMatch ? fromMatch[1].trim() : email.from;
  const contactEmail = fromMatch ? fromMatch[2].trim() : email.from;

  const contactPayload = {
    properties: [
      {
        name: 'email',
        value: contactEmail,
      },
      {
        name: 'firstname',
        value: contactName.split(' ')[0],
      },
      {
        name: 'lastname',
        value: contactName.split(' ').slice(1).join(' ') || '',
      },
      {
        name: 'source',
        value: 'email_sensor_slopezvigo',
      },
      {
        name: 'hs_lead_status',
        value: 'new',
      },
    ],
  };

  try {
    const response = await axios.post(
      `${HUBSPOT_API_URL}/crm/v3/objects/contacts`,
      contactPayload,
      {
        headers: {
          Authorization: `Bearer ${config.hubspotApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const contactId = response.data.id;
    log.success(`Contacto creado/actualizado: ${contactId}`);
    return contactId;

  } catch (error) {
    if (error.response?.status === 409) {
      log.warn('Contacto ya existe, buscando por email...');
      return await getContactByEmail(contactEmail);
    }
    throw error;
  }
}

// ==================== BUSCAR CONTACTO POR EMAIL ====================
async function getContactByEmail(email) {
  log.info(`🔍 Buscando contacto por email: ${email}`);

  try {
    const response = await axios.get(
      `${HUBSPOT_API_URL}/crm/v3/objects/contacts`,
      {
        params: {
          limit: 1,
          'filter.filterGroups[0].filters[0].propertyName': 'email',
          'filter.filterGroups[0].filters[0].operator': 'EQ',
          'filter.filterGroups[0].filters[0].value': email,
        },
        headers: {
          Authorization: `Bearer ${config.hubspotApiKey}`,
        },
      }
    );

    if (response.data.results.length > 0) {
      const contactId = response.data.results[0].id;
      log.success(`Contacto encontrado: ${contactId}`);
      return contactId;
    }

    log.warn('Contacto no encontrado, creando nuevo...');
    return await createNewContact(email);

  } catch (error) {
    log.error('Error buscando contacto: ' + error.message);
    throw error;
  }
}

// ==================== CREAR NUEVO CONTACTO ====================
async function createNewContact(email) {
  const payload = {
    properties: [
      {
        name: 'email',
        value: email,
      },
      {
        name: 'source',
        value: 'email_sensor_slopezvigo',
      },
    ],
  };

  const response = await axios.post(
    `${HUBSPOT_API_URL}/crm/v3/objects/contacts`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${config.hubspotApiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.id;
}

// ==================== CREAR DEAL (OPORTUNIDAD) ====================
async function createDeal(contactId, email) {
  log.info(`💼 Creando Deal para contacto: ${contactId}`);

  const dealPayload = {
    properties: [
      {
        name: 'dealname',
        value: `Email: ${email.subject.substring(0, 50)}`,
      },
      {
        name: 'dealstage',
        value: 'negotiation',
      },
      {
        name: 'pipeline',
        value: config.templateName,
      },
      {
        name: 'description',
        value: `
Email recibido de: ${email.from}
Asunto: ${email.subject}
Fecha: ${email.timestamp}

---

${email.plainText || email.htmlBody}
        `.trim(),
      },
      {
        name: 'num_associated_contacts',
        value: '1',
      },
    ],
  };

  try {
    const dealResponse = await axios.post(
      `${HUBSPOT_API_URL}/crm/v3/objects/deals`,
      dealPayload,
      {
        headers: {
          Authorization: `Bearer ${config.hubspotApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const dealId = dealResponse.data.id;
    log.success(`Deal creado: ${dealId}`);

    // Asociar Deal al Contacto
    await associateDealToContact(dealId, contactId);

    return dealId;

  } catch (error) {
    log.error('Error creando Deal: ' + error.message);
    throw error;
  }
}

// ==================== ASOCIAR DEAL A CONTACTO ====================
async function associateDealToContact(dealId, contactId) {
  log.info(`🔗 Asociando Deal ${dealId} a Contacto ${contactId}`);

  const payload = {
    inputs: [
      {
        id: dealId,
        types: ['deals_to_contact'],
        to: {
          id: contactId,
        },
      },
    ],
  };

  try {
    await axios.post(
      `${HUBSPOT_API_URL}/crm/v4/objects/deals/batch/associate`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${config.hubspotApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    log.success('Deal asociado a Contacto');
  } catch (error) {
    log.warn('Error asociando Deal: ' + error.message);
    // No fallamos por esto, continuamos
  }
}

// ==================== CREAR TICKET (NOTA) ====================
async function createTicket(contactId, email) {
  log.info(`🎫 Creando Ticket para email: ${email.subject}`);

  const ticketPayload = {
    properties: [
      {
        name: 'subject',
        value: email.subject,
      },
      {
        name: 'content',
        value: `
**De:** ${email.from}
**Para:** ${email.to}
**CC:** ${email.cc || 'N/A'}
**Fecha:** ${email.timestamp}

---

${email.plainText || email.htmlBody}
        `.trim(),
      },
      {
        name: 'hs_ticket_priority',
        value: 'medium',
      },
      {
        name: 'hs_ticket_category',
        value: 'incoming_email',
      },
    ],
  };

  try {
    const ticketResponse = await axios.post(
      `${HUBSPOT_API_URL}/crm/v3/objects/tickets`,
      ticketPayload,
      {
        headers: {
          Authorization: `Bearer ${config.hubspotApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const ticketId = ticketResponse.data.id;
    log.success(`Ticket creado: ${ticketId}`);

    // Asociar Ticket al Contacto
    await associateTicketToContact(ticketId, contactId);

    return ticketId;

  } catch (error) {
    log.warn('Error creando Ticket: ' + error.message);
    // No fallamos por esto
  }
}

// ==================== ASOCIAR TICKET A CONTACTO ====================
async function associateTicketToContact(ticketId, contactId) {
  const payload = {
    inputs: [
      {
        id: ticketId,
        types: ['tickets_to_contact'],
        to: {
          id: contactId,
        },
      },
    ],
  };

  try {
    await axios.post(
      `${HUBSPOT_API_URL}/crm/v4/objects/tickets/batch/associate`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${config.hubspotApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    log.success('Ticket asociado a Contacto');
  } catch (error) {
    log.warn('Error asociando Ticket: ' + error.message);
  }
}

// ==================== FUNCIÓN PRINCIPAL ====================
async function main() {
  try {
    log.info('🚀 Iniciando sincronización Email → HubSpot');
    log.info(`Modo: ${config.testMode ? 'TEST' : 'PRODUCCIÓN'}`);

    validateConfig();
    const emailData = getEmailData();

    log.info(`📨 Procesando email:`);
    log.info(`  Asunto: ${emailData.subject}`);
    log.info(`  De: ${emailData.from}`);

    // 1. Crear/actualizar contacto
    const contactId = await upsertContact(emailData);

    // 2. Crear Deal
    const dealId = await createDeal(contactId, emailData);

    // 3. Crear Ticket
    const ticketId = await createTicket(contactId, emailData);

    // 4. Log final
    log.success('✨ Sincronización completada exitosamente');
    log.info(`Resultados:`);
    log.info(`  - Contact ID: ${contactId}`);
    log.info(`  - Deal ID: ${dealId}`);
    log.info(`  - Ticket ID: ${ticketId}`);

    // Salida para GitHub Actions
    console.log(`::set-output name=email_subject::${emailData.subject}`);
    console.log(`::set-output name=contact_id::${contactId}`);
    console.log(`::set-output name=deal_id::${dealId}`);

    process.exit(0);

  } catch (error) {
    log.error(error.message);
    if (error.response?.data) {
      log.error('Respuesta HubSpot: ' + JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// ==================== EJECUTAR ====================
if (require.main === module) {
  main();
}

module.exports = { upsertContact, createDeal, getContactByEmail };

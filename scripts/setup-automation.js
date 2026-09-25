#!/usr/bin/env node

/**
 * Setup Automation Script
 * Automatiza la configuración completa del Email Sensor
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}\n`),
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.bright}${question}${colors.reset} `, resolve);
  });
}

async function main() {
  log.title('🚀 Email Sensor - Setup Automation');

  log.info('Este script te guiará por el setup automático del sistema');
  log.warn('Necesitarás tener a mano:');
  log.warn('  • GitHub Personal Access Token');
  log.warn('  • HubSpot API Key');
  log.warn('  • HubSpot Portal ID');

  const proceed = await prompt('\n¿Continuar? (s/n)');
  if (proceed.toLowerCase() !== 's') {
    log.info('Setup cancelado');
    rl.close();
    return;
  }

  // Paso 1: Configuración Local
  log.title('Paso 1️⃣: Configuración Local');

  const envConfig = await getEnvironmentConfig();

  // Paso 2: Crear .env
  log.title('Paso 2️⃣: Crear archivo .env');
  createEnvFile(envConfig);

  // Paso 3: Validar Configuración
  log.title('Paso 3️⃣: Validar Configuración');
  await validateConfig(envConfig);

  // Paso 4: Generar Google Apps Script Helper
  log.title('Paso 4️⃣: Generar Setup Script para Google Apps Script');
  generateGasHelper(envConfig);

  // Paso 5: Instrucciones para GitHub
  log.title('Paso 5️⃣: Configurar GitHub Secrets');
  generateGithubInstructions(envConfig);

  // Paso 6: Instrucciones para Google Apps Script
  log.title('Paso 6️⃣: Desplegar Google Apps Script');
  generateGasInstructions(envConfig);

  // Resumen
  log.title('📋 Setup Completado');
  log.success('Archivo .env creado con configuración');
  log.success('Scripts de setup generados');
  log.success('Instrucciones detalladas listas');

  console.log(`
${colors.bright}Próximos pasos:${colors.reset}
1. Abre ./setup-google-apps-script.md para instrucciones detalladas
2. Ejecuta los comandos de GitHub en tu terminal
3. Accede a Google Apps Script y sigue las instrucciones
4. Ejecuta npm test para validar

${colors.bright}Documentación:${colors.reset}
- docs/SETUP_GUIDE.md
- docs/GOOGLE_APPS_SCRIPT_SETUP.md
- docs/QUICK_REFERENCE.md
  `);

  rl.close();
}

async function getEnvironmentConfig() {
  log.info('Recopilando configuración...');

  const config = {};

  config.GITHUB_TOKEN = await prompt('GitHub Personal Access Token:');
  if (!config.GITHUB_TOKEN.startsWith('ghp_')) {
    log.warn('Token no parece válido (debería empezar con ghp_)');
  }

  config.GITHUB_WEBHOOK_URL = 'https://' + config.GITHUB_TOKEN + '@api.github.com/repos/arivas-web/prueba-mailing-aduanas/dispatches';
  log.success('URL de webhook generada');

  config.HUBSPOT_API_KEY = await prompt('\nHubSpot API Key (pat-na1-...):');
  if (!config.HUBSPOT_API_KEY.startsWith('pat-')) {
    log.warn('API Key no parece válida (debería empezar con pat-)');
  }

  config.HUBSPOT_PORTAL_ID = await prompt('HubSpot Portal ID (números):');
  if (!/^\d+$/.test(config.HUBSPOT_PORTAL_ID)) {
    log.warn('Portal ID debería ser números');
  }

  config.DRIVE_FOLDER_ID = await prompt('Google Drive Folder ID (opcional, Enter para omitir):');
  if (!config.DRIVE_FOLDER_ID) {
    log.info('Se omitirá la funcionalidad de adjuntos');
  }

  config.ADMIN_EMAIL = await prompt('Email para notificaciones (ejemplo: arivas@visualms.com):');

  return config;
}

function createEnvFile(config) {
  const envContent = `# Email Sensor Configuration
# Generado automáticamente

# GitHub
GITHUB_TOKEN=${config.GITHUB_TOKEN}
GITHUB_WEBHOOK_URL=${config.GITHUB_WEBHOOK_URL}

# HubSpot
HUBSPOT_API_KEY=${config.HUBSPOT_API_KEY}
HUBSPOT_PORTAL_ID=${config.HUBSPOT_PORTAL_ID}
HUBSPOT_TEMPLATE_NAME=Visual Trans 2026

# Google Drive
DRIVE_FOLDER_ID=${config.DRIVE_FOLDER_ID || ''}

# Notificaciones
ADMIN_EMAIL=${config.ADMIN_EMAIL}

# Debug
DEBUG=false
TEST_MODE=false
`;

  const envPath = path.join(__dirname, '..', '.env');
  fs.writeFileSync(envPath, envContent);
  log.success(`.env creado en ${envPath}`);

  // Crear .env.local también (no se commitea)
  fs.writeFileSync(envPath + '.local', envContent);
  log.success(`.env.local creado (local only)`);
}

async function validateConfig(config) {
  log.info('Validando configuración...');

  let valid = true;

  if (!config.GITHUB_TOKEN || !config.GITHUB_TOKEN.startsWith('ghp_')) {
    log.error('GitHub Token inválido');
    valid = false;
  } else {
    log.success('GitHub Token válido');
  }

  if (!config.HUBSPOT_API_KEY || !config.HUBSPOT_API_KEY.startsWith('pat-')) {
    log.error('HubSpot API Key inválida');
    valid = false;
  } else {
    log.success('HubSpot API Key válida');
  }

  if (!config.HUBSPOT_PORTAL_ID || !/^\d+$/.test(config.HUBSPOT_PORTAL_ID)) {
    log.error('HubSpot Portal ID inválido');
    valid = false;
  } else {
    log.success('HubSpot Portal ID válido');
  }

  if (!valid) {
    log.error('Validación falló. Revisa los valores ingresados.');
    process.exit(1);
  }

  log.success('✅ Toda la configuración es válida');
}

function generateGasHelper(config) {
  const gasHelper = `// Copiar y pegar esto en Google Apps Script
// Para configurar las propiedades automáticamente

function setupProperties() {
  const properties = PropertiesService.getScriptProperties();

  properties.setProperty('GITHUB_WEBHOOK_URL', '${config.GITHUB_WEBHOOK_URL}');
  properties.setProperty('DRIVE_FOLDER_ID', '${config.DRIVE_FOLDER_ID || ''}');
  properties.setProperty('ADMIN_EMAIL', '${config.ADMIN_EMAIL}');

  Logger.log('✅ Properties configuradas:');
  Logger.log('- GITHUB_WEBHOOK_URL: ' + properties.getProperty('GITHUB_WEBHOOK_URL').substring(0, 30) + '...');
  Logger.log('- DRIVE_FOLDER_ID: ' + (properties.getProperty('DRIVE_FOLDER_ID') || 'NO CONFIGURADO'));
  Logger.log('- ADMIN_EMAIL: ' + properties.getProperty('ADMIN_EMAIL'));
}

// Ejecuta esta función en Google Apps Script para configurar todo
`;

  const gasPath = path.join(__dirname, '..', 'setup-google-apps-script-properties.txt');
  fs.writeFileSync(gasPath, gasHelper);
  log.success(`Setup script guardado en setup-google-apps-script-properties.txt`);
}

function generateGithubInstructions(config) {
  const instructions = `# Configurar GitHub Secrets

Ejecuta estos comandos en tu terminal (requiere gh CLI):

## Opción 1: Usando GitHub CLI (recomendado)

\`\`\`bash
cd /home/user/prueba-mailing-aduanas

# Configurar secrets
gh secret set HUBSPOT_API_KEY --body "${config.HUBSPOT_API_KEY}"
gh secret set HUBSPOT_PORTAL_ID --body "${config.HUBSPOT_PORTAL_ID}"

# Verificar
gh secret list
\`\`\`

## Opción 2: Manual via GitHub Web

1. Ve a: https://github.com/arivas-web/prueba-mailing-aduanas/settings/secrets/actions
2. Click "New repository secret"
3. Añade:
   - Name: HUBSPOT_API_KEY
   - Value: ${config.HUBSPOT_API_KEY}
4. Click "New repository secret"
5. Añade:
   - Name: HUBSPOT_PORTAL_ID
   - Value: ${config.HUBSPOT_PORTAL_ID}

## Verificar

\`\`\`bash
gh secret list
\`\`\`

Deberías ver:
- HUBSPOT_API_KEY
- HUBSPOT_PORTAL_ID
`;

  const githubPath = path.join(__dirname, '..', 'SETUP_GITHUB.md');
  fs.writeFileSync(githubPath, instructions);
  log.success(`Instrucciones GitHub guardadas en SETUP_GITHUB.md`);
}

function generateGasInstructions(config) {
  const instructions = `# Desplegar Google Apps Script

## Paso 1: Crear Proyecto

1. Ve a: https://script.google.com/
2. Click "Nuevo proyecto"
3. Nombre: "Email Sensor slopezvigo"
4. OK

## Paso 2: Copiar Código

1. En Google Apps Script, abre el editor
2. Borra el código por defecto
3. Copia el contenido de: google-apps-script/EmailSensor.gs
4. Pega todo el código
5. Ctrl+S para guardar

## Paso 3: Configurar Properties

En Google Apps Script, ejecuta ESTA función una sola vez:

\`\`\`javascript
// Copiar esto en la consola del editor
setupProperties();
\`\`\`

Deberías ver en los logs:
✅ Properties configuradas:
- GITHUB_WEBHOOK_URL: https://...
- DRIVE_FOLDER_ID: ...
- ADMIN_EMAIL: ${config.ADMIN_EMAIL}

## Paso 4: Autorizar Acceso a Gmail

1. Presiona ▶️ Ejecutar
2. Click en "Revisar permisos" cuando pida
3. Selecciona tu cuenta
4. Click "Permitir"

## Paso 5: Crear Label en Gmail

Opción A - Automático (desde Google Apps Script):
\`\`\`javascript
createLabelIfNotExists('Procesado-HubSpot');
\`\`\`

Opción B - Manual en Gmail:
1. Ve a https://mail.google.com/ (con slopezvigo@gmail.com)
2. Configuración → Etiquetas
3. Crear etiqueta: "Procesado-HubSpot"

## Paso 6: Crear Trigger

En Google Apps Script, ejecuta:
\`\`\`javascript
setupEmailSensor();
\`\`\`

O manualmente:
1. Click en "Disparadores" (reloj)
2. Click "+ Crear disparador"
3. Función: checkNewEmails
4. Tipo: Basado en tiempo
5. Intervalo: Cada 5 minutos
6. Guardar

## Paso 7: Test

\`\`\`javascript
testEmailSensor();
\`\`\`

Deberías ver:
✅ Configuración validada
✅ Email Sensor configurado
✅ Test completado

## Éxito! 🎉

El sensor está listo. Espera 5 minutos y envía un email de prueba a slopezvigo@gmail.com
`;

  const gasPath = path.join(__dirname, '..', 'SETUP_GOOGLE_APPS_SCRIPT.md');
  fs.writeFileSync(gasPath, instructions);
  log.success(`Instrucciones Google Apps Script guardadas en SETUP_GOOGLE_APPS_SCRIPT.md`);
}

// Ejecutar
main().catch(console.error);

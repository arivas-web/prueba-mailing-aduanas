#!/usr/bin/env node

/**
 * Validate Setup Script
 * Verifica que todo el sistema está correctamente configurado
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bright: '\x1b[1m',
};

const checks = [];

function check(name, passed, message = '') {
  checks.push({ name, passed, message });
  const symbol = passed ? `${colors.green}✅${colors.reset}` : `${colors.red}❌${colors.reset}`;
  console.log(`${symbol} ${name}`);
  if (message) {
    console.log(`   ${message}`);
  }
}

async function validateEnvironment() {
  console.log(`\n${colors.bright}${colors.blue}1️⃣ Environment Variables${colors.reset}`);

  const requiredVars = [
    'GITHUB_TOKEN',
    'GITHUB_WEBHOOK_URL',
    'HUBSPOT_API_KEY',
    'HUBSPOT_PORTAL_ID',
  ];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    check(
      `${varName}`,
      !!value,
      value ? `✓ Configurado` : '⚠️ No encontrado'
    );
  }
}

async function validateGithubToken() {
  console.log(`\n${colors.bright}${colors.blue}2️⃣ GitHub Configuration${colors.reset}`);

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    check('GitHub Token', false, 'No configurado');
    return;
  }

  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
      },
    });
    check('GitHub Token válido', true, `Usuario: ${response.data.login}`);
  } catch (error) {
    check('GitHub Token válido', false, 'Token inválido o expirado');
  }

  // Verificar repositorio
  const webhookUrl = process.env.GITHUB_WEBHOOK_URL;
  if (webhookUrl && webhookUrl.includes('arivas-web/prueba-mailing-aduanas')) {
    check('Webhook URL', true, 'Apunta al repositorio correcto');
  } else {
    check('Webhook URL', false, 'No apunta a arivas-web/prueba-mailing-aduanas');
  }
}

async function validateHubspotKeys() {
  console.log(`\n${colors.bright}${colors.blue}3️⃣ HubSpot Configuration${colors.reset}`);

  const apiKey = process.env.HUBSPOT_API_KEY;
  const portalId = process.env.HUBSPOT_PORTAL_ID;

  if (!apiKey) {
    check('HubSpot API Key', false, 'No configurado');
    return;
  }

  if (!portalId) {
    check('HubSpot Portal ID', false, 'No configurado');
    return;
  }

  try {
    const response = await axios.get('https://api.hubapi.com/crm/v3/objects/contacts', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      params: {
        limit: 1,
      },
    });
    check('HubSpot API Key válido', true, 'Conexión exitosa');
  } catch (error) {
    if (error.response?.status === 401) {
      check('HubSpot API Key válido', false, 'API Key inválida o expirada');
    } else {
      check('HubSpot API Key válido', false, error.message);
    }
  }

  if (/^\d+$/.test(portalId)) {
    check('HubSpot Portal ID válido', true, `Portal: ${portalId}`);
  } else {
    check('HubSpot Portal ID válido', false, 'Debe ser solo números');
  }
}

function validateFiles() {
  console.log(`\n${colors.bright}${colors.blue}4️⃣ Project Files${colors.reset}`);

  const requiredFiles = [
    'google-apps-script/EmailSensor.gs',
    '.github/workflows/email-to-hubspot.yml',
    'scripts/sync-email-to-hubspot.js',
    'docs/SETUP_GUIDE.md',
    'README.md',
    'package.json',
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    const exists = fs.existsSync(filePath);
    check(file, exists);
  }
}

function validateGoogleAppsScript() {
  console.log(`\n${colors.bright}${colors.blue}5️⃣ Google Apps Script${colors.reset}`);

  const gasPath = path.join(__dirname, '..', 'google-apps-script/EmailSensor.gs');
  const gasContent = fs.readFileSync(gasPath, 'utf8');

  const hasEmailCheck = gasContent.includes('checkNewEmails');
  const hasSetup = gasContent.includes('setupEmailSensor');
  const hasLabel = gasContent.includes('LABEL_NAME');
  const hasGithubWebhook = gasContent.includes('sendToGitHubWebhook');

  check('checkNewEmails function', hasEmailCheck);
  check('setupEmailSensor function', hasSetup);
  check('LABEL_NAME configured', hasLabel);
  check('sendToGitHubWebhook function', hasGithubWebhook);
}

function validateWorkflow() {
  console.log(`\n${colors.bright}${colors.blue}6️⃣ GitHub Actions Workflow${colors.reset}`);

  const workflowPath = path.join(__dirname, '..', '.github/workflows/email-to-hubspot.yml');
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');

  const hasRepository = workflowContent.includes('repository_dispatch');
  const hasSync = workflowContent.includes('sync-email-to-hubspot.js');
  const hasSecrets = workflowContent.includes('HUBSPOT_API_KEY');

  check('repository_dispatch trigger', hasRepository);
  check('Sync script execution', hasSync);
  check('HubSpot secrets usage', hasSecrets);
}

function validateSyncScript() {
  console.log(`\n${colors.bright}${colors.blue}7️⃣ Sync Script${colors.reset}`);

  const syncPath = path.join(__dirname, '..', 'scripts/sync-email-to-hubspot.js');
  const syncContent = fs.readFileSync(syncPath, 'utf8');

  const hasFindTemplate = syncContent.includes('findTemplateEmail');
  const hasCloneTemplate = syncContent.includes('cloneTemplateEmail');
  const hasFillDraft = syncContent.includes('fillDraftWithEmailContent');
  const hasHubspotUrl = syncContent.includes('HUBSPOT_API_URL');

  check('findTemplateEmail function', hasFindTemplate);
  check('cloneTemplateEmail function', hasCloneTemplate);
  check('fillDraftWithEmailContent function', hasFillDraft);
  check('HubSpot API URL configured', hasHubspotUrl);
}

function validateEnvFile() {
  console.log(`\n${colors.bright}${colors.blue}8️⃣ Configuration Files${colors.reset}`);

  const hasEnv = fs.existsSync(path.join(__dirname, '..', '.env')) ||
                 fs.existsSync(path.join(__dirname, '..', '.env.local'));
  check('.env file exists', hasEnv);

  const hasEnvExample = fs.existsSync(path.join(__dirname, '..', '.env.example'));
  check('.env.example exists', hasEnvExample);

  const hasGitignore = fs.existsSync(path.join(__dirname, '..', '.gitignore'));
  check('.gitignore exists', hasGitignore, hasGitignore ? '✓' : '.env no commiteo verificado');
}

function printSummary() {
  console.log(`\n${colors.bright}${colors.blue}📊 Summary${colors.reset}\n`);

  const passed = checks.filter(c => c.passed).length;
  const total = checks.length;
  const percentage = Math.round((passed / total) * 100);

  console.log(`Checks pasados: ${passed}/${total} (${percentage}%)`);
  console.log('');

  if (percentage === 100) {
    console.log(`${colors.green}✅ Sistema completamente configurado${colors.reset}`);
    console.log('');
    console.log('Próximos pasos:');
    console.log('1. Abre Google Apps Script y copia el código');
    console.log('2. Ejecuta setupEmailSensor()');
    console.log('3. Envía email de prueba a arivas@visualtrans.com');
    console.log('4. Verifica en HubSpot después de 5 minutos');
  } else if (percentage >= 80) {
    console.log(`${colors.yellow}⚠️ Sistema casi configurado, faltan algunos detalles${colors.reset}`);
    console.log('Revisa los items con ❌ arriba');
  } else {
    console.log(`${colors.red}❌ Sistema incompleto, necesita más configuración${colors.reset}`);
    console.log('Ejecuta: npm run setup');
  }

  console.log('');
}

async function main() {
  console.log(`${colors.bright}${colors.blue}🔍 Email Sensor - Validation Report${colors.reset}`);
  console.log('═'.repeat(50));

  try {
    await validateEnvironment();
    await validateGithubToken();
    await validateHubspotKeys();
    validateFiles();
    validateGoogleAppsScript();
    validateWorkflow();
    validateSyncScript();
    validateEnvFile();

    printSummary();

    const allPassed = checks.every(c => c.passed);
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error(`\n${colors.red}Error durante validación:${colors.reset}`, error.message);
    process.exit(1);
  }
}

main();

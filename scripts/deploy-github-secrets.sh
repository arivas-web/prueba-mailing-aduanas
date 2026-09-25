#!/bin/bash

# Deploy GitHub Secrets Script
# Automatiza la configuración de secrets en GitHub

set -e

echo "🚀 Email Sensor - GitHub Secrets Setup"
echo "======================================"
echo ""

# Verificar si gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) no está instalado"
    echo "Instálalo desde: https://cli.github.com/"
    echo ""
    echo "O configura los secrets manualmente en:"
    echo "https://github.com/arivas-web/prueba-mailing-aduanas/settings/secrets/actions"
    exit 1
fi

# Verificar si estamos en el repositorio correcto
if [ ! -f ".github/workflows/email-to-hubspot.yml" ]; then
    echo "❌ No estamos en el repositorio correcto"
    echo "Ejecuta este script desde la raíz del repositorio:"
    echo "cd /home/user/prueba-mailing-aduanas && bash scripts/deploy-github-secrets.sh"
    exit 1
fi

# Leer variables de .env si existen
if [ -f ".env.local" ]; then
    source .env.local
    echo "✅ Configuración cargada desde .env.local"
elif [ -f ".env" ]; then
    source .env
    echo "✅ Configuración cargada desde .env"
else
    echo "❌ No se encontró archivo .env o .env.local"
    echo "Ejecuta primero: npm run setup"
    exit 1
fi

# Verificar que las variables existen
if [ -z "$HUBSPOT_API_KEY" ] || [ -z "$HUBSPOT_PORTAL_ID" ]; then
    echo "❌ Faltan variables en .env (HUBSPOT_API_KEY o HUBSPOT_PORTAL_ID)"
    exit 1
fi

echo ""
echo "📋 Configurando secrets en GitHub..."
echo ""

# Configurar secrets
echo "⏳ Configurando HUBSPOT_API_KEY..."
gh secret set HUBSPOT_API_KEY --body "$HUBSPOT_API_KEY" || {
    echo "⚠️ Revisar si gh está autenticado: gh auth login"
}

echo "✅ HUBSPOT_API_KEY configurado"
echo ""

echo "⏳ Configurando HUBSPOT_PORTAL_ID..."
gh secret set HUBSPOT_PORTAL_ID --body "$HUBSPOT_PORTAL_ID" || {
    echo "⚠️ Revisar si gh está autenticado"
}

echo "✅ HUBSPOT_PORTAL_ID configurado"
echo ""

# Verificar
echo "📊 Verificando secrets configurados..."
echo ""

gh secret list | grep -E "HUBSPOT_API_KEY|HUBSPOT_PORTAL_ID" && echo "" || echo "⚠️ Hubo un problema. Verifica manualmente en:"
echo "https://github.com/arivas-web/prueba-mailing-aduanas/settings/secrets/actions"

echo ""
echo "✅ GitHub Secrets Setup Completado"
echo ""
echo "Próximos pasos:"
echo "1. Configura Google Apps Script (ver SETUP_GOOGLE_APPS_SCRIPT.md)"
echo "2. Envía un email de prueba a slopezvigo@gmail.com"
echo "3. Revisa que aparezca en HubSpot después de 5 minutos"

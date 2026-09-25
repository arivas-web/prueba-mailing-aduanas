# 📝 Modo Borrador — Solo Email AEAT

## Qué Hace el Sistema (y qué NO hace)

El sistema **detecta** emails en `arivas@visualtrans.com` cuyo asunto contiene
**"correo aeat"**, y genera un **borrador de email de marketing en HubSpot**
(clonado de la plantilla "Visual Trans 2026") con el contenido del email
**pegado tal cual**.

### ✅ Hace
- Detecta el email (solo si el asunto coincide)
- Clona la plantilla "Visual Trans 2026"
- Pega el asunto y el cuerpo del email en el borrador
- Deja el borrador sin enviar

### ❌ NO hace
- No crea contactos
- No crea deals
- No crea tickets
- No envía el email — **eso lo haces tú manualmente en HubSpot**

---

## Flujo

```
Email a arivas@visualtrans.com
  ↓ ¿asunto contiene "correo aeat"?
  no → se ignora completamente
  sí ↓
Google Apps Script detecta (cada 5 min)
  ↓
Webhook → GitHub Actions
  ↓
Node.js clona la plantilla "Visual Trans 2026"
  ↓
Se pega el email tal cual en el borrador
  ↓
TÚ revisas el borrador en HubSpot y lo envías cuando quieras
```

---

## Dónde Verlo en HubSpot

```
HubSpot → Marketing → Email
  → Busca un email cuyo nombre empiece por "[AEAT] ..."
  → Ábrelo: el asunto y el cuerpo son el email original
  → Revísalo y envíalo tú mismo cuando esté listo
```

---

## Por Qué en Borrador

- ✅ Control total: nada se envía sin tu aprobación
- ✅ Puedes editar el contenido antes de enviarlo
- ✅ Evita envíos accidentales de información fiscal sensible

---

**Última actualización**: 2026-09-25
**Versión**: 2.0.0

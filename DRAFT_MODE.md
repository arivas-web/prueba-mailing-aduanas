# 📝 MODO BORRADOR - Email Sensor

## Cambio Importante

El sistema **NO envía automáticamente**. Todo se crea en **BORRADOR** para que TÚ lo revises y envíes.

---

## Cómo Funciona Ahora

### Flujo de Operación

```
Email → Gmail
  ↓ (cada 5 min)
Google Apps Script detecta
  ↓
Webhook → GitHub Actions
  ↓
Node.js procesa
  ↓
HubSpot API crea en BORRADOR:
  - [BORRADOR] Deal
  - [BORRADOR] Ticket
  ↓
TÚ REVISA, EDITAS Y ENVÍAS EN HUBSPOT
```

---

## En HubSpot Verás

### Para Cada Email:

1. **Contacto** (Creado automáticamente)
   - Nombre: Del email
   - Email: Del remitente
   - Source: "email_sensor_slopezvigo"

2. **Deal [BORRADOR]**
   - Título: "[BORRADOR] Email: {Asunto}"
   - Estado: "qualifiedtobuy" (inicial, no avanzado)
   - Pipeline: "Visual Trans 2026"
   - Descripción: Contenido completo del email
   - **ACCION**: Edita, completa y avanza el estado

3. **Ticket [BORRADOR]**
   - Asunto: "[BORRADOR] {Asunto del email}"
   - Contenido: Email completo
   - Prioridad: Medium
   - Categoría: "incoming_email"
   - **ACCION**: Revisa y envía cuando esté listo

---

## ¿Por Qué en Borrador?

✅ **Control Total** - Tú decidas qué se envía  
✅ **Revisión Manual** - Valida antes de enviar  
✅ **Flexibilidad** - Edita lo que necesites  
✅ **Evita Errores** - Nada se envía por accidente  

---

## Pasos Para Completar

### 1. Revisar Email en HubSpot

```
Contactos → Tu Contacto
  ↓
Ver Deals Asociados
  ↓
Abre [BORRADOR] Deal
  ↓
Revisa la descripción (contiene el email)
```

### 2. Editar si Necesario

```
En el Deal:
- Edita título si quieres
- Completa campos adicionales
- Ajusta prioridad/categoría
- Añade notas
```

### 3. Enviar/Publicar

```
Deal:
- Cambia estado de "qualifiedtobuy" a siguiente paso
- Eso "publica" el deal

Ticket:
- Click en enviar/publicar
- O cambia estado a "in progress"
```

---

## Flujo Recomendado en HubSpot

```
Paso 1: Email llega
  ↓
Paso 2: Sensor crea (automático)
  - Contacto ✅
  - Deal [BORRADOR] ✅
  - Ticket [BORRADOR] ✅
  ↓
Paso 3: TÚ revisa (manual)
  - Abre el contacto
  - Lee el email en descripción del deal
  - Revisa el ticket
  ↓
Paso 4: TÚ completas (manual)
  - Edita información si falta
  - Ajusta estados/categorías
  - Añade notas personales
  ↓
Paso 5: TÚ publicas (manual)
  - Cambia deal a "negotiation" o siguiente
  - Envía el ticket
  ↓
Completo: Deal y Ticket enviados ✅
```

---

## Ventajas de Este Enfoque

| Aspecto | Antes (Auto) | Ahora (Borrador) |
|---------|--------------|------------------|
| **Control** | Ninguno | Total |
| **Revisión** | No | Sí |
| **Edición** | No | Sí |
| **Errores** | Posibles | Evitados |
| **Confirmación** | No | Sí, tú confirmas |

---

## Ejemplo Práctico

### Email Recibido:
```
De: cliente@empresa.com
Asunto: Consulta sobre servicios de envío
Cuerpo: Hola, quería información sobre...
```

### Lo Que Hace El Sistema (AUTO):
```
1. Detecta el email
2. Crea Contacto: cliente@empresa.com
3. Crea Deal [BORRADOR] con:
   - Título: "[BORRADOR] Email: Consulta sobre servicios..."
   - Estado: qualifiedtobuy
   - Contenido: El email completo
4. Crea Ticket [BORRADOR] con:
   - Asunto: "[BORRADOR] Consulta sobre servicios..."
   - Contenido: El email completo
```

### Lo Que Haces TÚ (MANUAL):
```
1. Abre HubSpot
2. Ve el contacto y deal nuevos
3. Lees el email en la descripción
4. Editas el titulo si quieres algo más específico
5. Cambias el estado a "negotiation"
6. Envías el ticket
7. Done!
```

---

## Checklist de Implementación

- [x] Google Apps Script detecta emails
- [x] GitHub Actions procesa webhook
- [x] Node.js crea borradores en HubSpot
- [x] Borradores están marcados [BORRADOR]
- [x] Estados son iniciales (no avanzados)
- [x] Descripción contiene email completo
- [x] Gmail marca como procesado (no se repite)
- [ ] TÚ revisa en HubSpot
- [ ] TÚ completas información
- [ ] TÚ envías/publicas

---

## No Está Automático (Por Seguridad)

❌ Enviamos automáticamente  
❌ Publicamos automáticamente  
❌ Avanzamos estados automáticamente  
❌ Enviamos respuestas automáticas  

✅ TÚ TIENES CONTROL TOTAL  

---

## Preguntas Frecuentes

### ¿Qué pasa si olvido enviar un borrador?
Nada malo. Simplemente quedará en borrador en HubSpot. Puedes enviarlo después cuando quieras.

### ¿Se detectan emails duplicados?
No. El sistema marca con label "Procesado-HubSpot" en Gmail. No se procesa dos veces.

### ¿Puedo editar el borrador antes de enviar?
Sí. Edita en HubSpot lo que necesites. Es un borrador completo.

### ¿Cómo sé si hay nuevos emails por procesar?
Ve a HubSpot → Deals con estado "qualifiedtobuy" o Tickets sin enviar.

---

## Monitoreo

### En Google Apps Script
```javascript
// Ver pendientes
checkNewEmails()
// Muestra en Logs cuántos nuevos hay
```

### En HubSpot
```
Deals:
Filtrar estado = "qualifiedtobuy" 
+ "source" contiene "email_sensor"
= Deals por completar

Tickets:
Filtrar sin enviar (status = draft o similar)
= Tickets por enviar
```

---

## Status del Sistema

🟢 **Operacional**  
📝 **Modo: Borradores**  
⏸️ **No envía automáticamente**  
✅ **Control Total en Tus Manos**  

---

**Última actualización**: 2026-09-25  
**Versión**: 1.1.0 (Draft Mode)

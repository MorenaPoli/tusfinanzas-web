# Guia: Configurar MercadoPago en TusFinanzas

## Paso 1: Crear cuenta de MercadoPago Developers

1. Entra a https://www.mercadopago.com.ar/developers
2. Logueate con tu cuenta de MercadoPago (o crea una si no tenes)
3. En el menu lateral, hace clic en **"Tu Integracion"** o **"Crear aplicacion"**
4. Completa los datos:
   - **Nombre**: TusFinanzas
   - **Producto**: Pagos online
   - **Pais**: Tu pais (Argentina, Mexico, Colombia, etc.)

## Paso 2: Obtener credenciales

1. En tu aplicacion de MercadoPago, ve a la pestana **"Credenciales de produccion"**
2. Copia el **Access Token** (empieza con `APP_USR-`)
3. Ve a la pestana **"Notificaciones"** > **"Webhooks"**
4. Configura la URL de webhook:
   ```
   https://TU-DOMINIO/api/trpc/mercadopago.webhook
   ```
   Ejemplo real:
   ```
   https://tusfinanzas.app/api/trpc/mercadopago.webhook
   ```
5. Selecciona el evento: **"payment"** (pagos)

## Paso 3: Configurar variables de entorno

Actualiza el archivo `.env` de tu proyecto:

```env
# Agrega estas dos lineas al final de tu .env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
APP_URL=https://tusfinanzas.app
```

**IMPORTANTE**: El `APP_URL` debe ser tu dominio publico real. Si estas en desarrollo local, podes usar `http://localhost:3000`.

## Paso 4: Probar en modo Sandbox (desarrollo)

Para probar sin pagar de verdad:

1. En MercadoPago Developers, usa las **"Credenciales de prueba"** en vez de las de produccion
2. El Access Token de prueba empieza con `TEST-`
3. Coloca el token de prueba en tu `.env`
4. Cuando hagas un pago de prueba, MercadoPago te dara tarjetas de prueba:
   - **Visa**: 4509 9535 6623 3704
   - **Mastercard**: 5031 7557 3453 0604
   - **Codigo de seguridad**: 123
   - **Vencimiento**: cualquier fecha futura
   - **DNI**: 12345678

## Paso 5: Cambiar a produccion

Cuando todo funcione bien:

1. Cambia el `MERCADOPAGO_ACCESS_TOKEN` al de produccion (empieza con `APP_USR-`)
2. En MercadoPago, configura tu **"Cuenta de cobro"** con tus datos bancarios reales
3. MercadoPago va a retener el dinero en tu cuenta y lo podes transferir a tu banco

## Flujo de pago

1. Usuario va a **"Suscribirse"** en el dashboard
2. Selecciona plan (Pro $4.99/mes o Familiar $8.99/mes) y facturacion (mensual/anual)
3. Se crea una "preferencia de pago" en MercadoPago
4. Se redirige al checkout de MercadoPago
5. El usuario paga con tarjeta, debito, o saldo de MP
6. MercadoPago redirige a `/payment/success` o `/payment/failure`
7. El webhook de MercadoPago actualiza automaticamente el plan del usuario en la base de datos

## Comisiones de MercadoPago

| Metodo | Comision |
|--------|----------|
| Tarjeta de credito (cuotas) | ~4.49% + IVA |
| Tarjeta de debito | 1.99% + IVA |
| Saldo en cuenta MP | 1.99% + IVA |
| Dinero en cuenta | Sin costo |

Ejemplo: un pago de $4.99 por tarjeta de debito → recibis ~$4.89

## Estructura de precios

| Plan | Mensual | Anual | Ahorro anual |
|------|---------|-------|--------------|
| Pro | $4.99/mes | $39.99/ano | 33% off |
| Familiar | $8.99/mes | $69.99/ano | 35% off |

## Resumen de archivos creados/modificados

**Nuevos:**
- `api/mercadopago-router.ts` - Router tRPC para MercadoPago
- `src/sections/Checkout.tsx` - Pagina de checkout con planes
- `src/sections/PaymentSuccess.tsx` - Pagina de pago exitoso
- `src/sections/PaymentFailure.tsx` - Pagina de pago fallido
- `src/sections/PaymentPending.tsx` - Pagina de pago pendiente
- `MERCADOPAGO-GUIA.md` - Esta guia

**Modificados:**
- `api/router.ts` - Registro del router MP
- `src/App.tsx` - Nuevas rutas (/checkout, /payment/*)
- `src/sections/Dashboard.tsx` - Boton de upgrade + links al checkout
- `.env` / `.env.example` - Nuevas variables

## Soporte

Si tenes problemas:
1. Verifica que el Access Token sea correcto
2. Revisa los logs del servidor para ver errores del webhook
3. Consulta la documentacion oficial: https://www.mercadopago.com.ar/developers

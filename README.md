# TRIP LINE

Demo navegable de una plataforma de expediciones en México con destinos, reservas, checkout, comunidad, transmisiones, tienda y operaciones.

## Funciones incluidas

- Catálogo de cinco destinos con fechas, cupos, operadores y dificultad.
- Flujo `destino → fecha → viajeros → paquete → checkout → dashboard`.
- Login, reservas, soporte, carrito, lives y administración simulados con `localStorage`.
- Checkout de prueba con datos enmascarados y huella SHA-256; no guarda tarjeta ni CVV.
- Streaming local RTMP/HLS mediante MediaMTX.
- Archivo de transmisiones, comunidad, tienda y panel operativo demo.
- Centro de ayuda con seguridad, FAQ, contacto y cancelaciones.
- Diseño responsive, navegación por teclado y modo de movimiento reducido.

## Ejecutar localmente

No abras los archivos únicamente con `file://`; usa un servidor local:

```powershell
python -m http.server 8000
```

Después visita `http://localhost:8000`.

## Streaming local

1. Copia `js/stream-config.example.js` como `js/stream-config.local.js`.
2. Configura la IPv4 actual de la laptop.
3. Inicia MediaMTX.
4. Publica desde el teléfono en `rtmp://IP-DE-LAPTOP/live` con la clave `aventura1`.

Consulta [GUIA_CAMBIO_IP_STREAMING.md](GUIA_CAMBIO_IP_STREAMING.md). `stream-config.local.js` está ignorado por Git para no publicar configuración privada.

## Datos demostrativos

La capa de datos vive en `js/tripline-data.js`. Los flujos usan `localStorage` para mostrar cómo se verá el producto; no existe sincronización entre dispositivos ni persistencia de servidor. No uses datos personales o financieros reales.

Claves principales:

- `tripline_demo_session`
- `tripline_demo_users`
- `tripline_demo_orders`
- `tripline_demo_lives`
- `tripline_demo_support`
- `tripline_demo_cart`

## Backend futuro

La implementación real deberá sustituir el almacenamiento local por API y base de datos para:

- Usuarios, roles y sesiones seguras.
- Destinos, salidas, inventario y precios.
- Reservas, pagos, webhooks, reembolsos y documentos.
- Presencia global, claves RTMP, estado y grabación de streams.
- Soporte, tienda, auditoría y moderación.

Las tarjetas deben tokenizarse directamente con un proveedor como Stripe o Mercado Pago; el backend nunca debe recibir ni almacenar CVV.

## Desplegar en Vercel con Git

1. Sube el proyecto a un repositorio Git.
2. En Vercel selecciona **Add New → Project** e importa el repositorio.
3. Deja el framework como **Other** y el directorio raíz en la raíz del repositorio.
4. No agregues comando de build ni directorio de salida: es un sitio estático.
5. Publica primero como Preview y valida los flujos antes de promover a producción.

Cada push a una rama crea un Preview y cada push a la rama de producción actualiza el sitio. La configuración está en `vercel.json`.

### Streaming en Vercel

Vercel no puede acceder a MediaMTX mediante una IP privada `192.168.x.x`. Para transmisión pública necesitas MediaMTX en un servidor con dominio y HTTPS, por ejemplo:

```text
https://stream.tudominio.com/live/aventura1/index.m3u8
```

No publiques stream keys en JavaScript. La aplicación deberá obtener credenciales temporales desde un backend autenticado.

## Rutas útiles

- `/reserva.html` — configurador de expedición.
- `/dashboard.html` — cuenta del viajero.
- `/admin.html` — operaciones simuladas.
- `/streams.html` — archivo de transmisiones.
- `/tienda.html` — merchandise demo.
- `/ayuda.html` — seguridad, FAQ y contacto.

## Legal

- `condiciones-uso.html`
- `aviso-privacidad.html`

Ambas páginas indican que el producto actual es una demostración.
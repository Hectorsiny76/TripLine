# TRIPLINE — versión escalable

Archivos separados:

- `index.html` — estructura HTML.
- `css/styles.css` — estilos visuales.
- `js/app.js` — interacciones, HLS y carrusel.
- `assets/` — imágenes locales.

## Cambiar el video de portada

Sustituye `assets/tripline-hero.mp4` por otro video MP4 manteniendo el mismo nombre, o cambia la ruta del `<source>` dentro de `index.html`.

La capa `.hero-media__overlay` en `css/styles.css` mantiene el título y los botones legibles sobre videos o imágenes claras.

## Transmisión en vivo con MediaMTX

La página toma automáticamente el host desde el que se abre y reproduce HLS en el puerto `8888`. Si se abre directamente como archivo, usa como respaldo `192.168.100.14`.

Publica desde PRISM con:

```text
Server: rtmp://192.168.100.14/live
Stream Key: aventura1
```

MediaMTX debe permanecer abierto y PRISM transmitiendo para que la ruta `live/aventura1` esté disponible.

## Cuenta, comunidad y pagos de demostración

El flujo de usuario es completamente local y no tiene costos ni servicios externos:

- `login.html` simula acceso con Google, Facebook o correo.
- `comunidad.html` requiere sesión y permite simular un nuevo live.
- `checkout.html` simula la compra de los paquetes y agrega la reserva al perfil.

Las cuentas, lives y compras se almacenan en `localStorage` del navegador. No se procesan contraseñas, cobros ni transmisiones de usuarios reales.

## Editar la página de destinos

Al pulsar una tarjeta del inicio se abre `destinos.html?destino=...`. Los textos, datos e imagen principal de cada experiencia se administran en `js/destinos.js`.

## Imágenes de destinos

Las tarjetas usan clases reutilizables en `css/styles.css`:

- `.destino-bg--espiritu`
- `.destino-bg--lacandona`
- `.destino-bg--silencio`
- `.destino-bg--huasteca`
- `.destino-bg--orizaba`

Para agregar un destino nuevo, crea o coloca una imagen en `assets/`, agrega una clase nueva con `background-image`, y úsala en el `div.destino-bg` de la tarjeta.

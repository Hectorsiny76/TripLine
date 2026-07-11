# Guía para cambiar la IP del streaming

Esta guía se usa cada vez que la laptop recibe una dirección IP diferente. La laptop ejecuta MediaMTX, el teléfono publica el video por RTMP y la página lo reproduce por HLS.

## 1. Consultar la IP actual de la laptop

1. Abre PowerShell o Símbolo del sistema.
2. Ejecuta:

   ```powershell
   ipconfig
   ```

3. Busca el adaptador **Wi-Fi**.
4. Copia el valor de **Dirección IPv4**, por ejemplo: `192.168.100.14`.

No uses la puerta de enlace, una dirección IPv6 ni la IP de una VPN.

## 2. Iniciar MediaMTX

Ejecuta `mediamtx.exe` y deja abierta su ventana. Deben aparecer mensajes similares a:

```text
[RTMP] listener opened on :1935
[HLS] listener opened on :8888
```

No es necesario escribir la IP de la laptop dentro de MediaMTX cuando los listeners están configurados como `:1935` y `:8888`; eso significa que escucha en todas las interfaces disponibles.

## 3. Actualizar el teléfono

En la aplicación de transmisión configura:

```text
URL RTMP: rtmp://IP-DE-LA-LAPTOP/live
Clave: aventura1
```

Ejemplo:

```text
URL RTMP: rtmp://192.168.100.14/live
Clave: aventura1
```

Guarda la configuración y pulsa **Go Live**. El teléfono y la laptop deben estar conectados a la misma red Wi-Fi.

## 4. Actualizar el sitio web

Abre `js/stream-config.local.js` y reemplaza la IP anterior en estas tres direcciones:

```javascript
hlsBaseUrl: 'http://192.168.100.14:8888'
playbackUrls: ['http://192.168.100.14:8888/live/aventura1/index.m3u8']
publishUrls: ['rtmp://192.168.100.14/live']
```

Conserva los puertos, la ruta `live` y la clave `aventura1`.

## 5. Confirmar que el teléfono está publicando

Después de pulsar **Go Live**, MediaMTX debe mostrar mensajes parecidos a:

```text
[RTMP] connection opened
[RTMP] is publishing to path 'live/aventura1'
```

Si sólo aparecen los mensajes `listener opened`, MediaMTX está encendido pero todavía no recibe video del teléfono.

## 6. Probar la reproducción

Mientras el teléfono transmite, abre en la laptop:

```text
http://IP-DE-LA-LAPTOP:8888/live/aventura1/index.m3u8
```

Después recarga la página de TRIP LINE. El reproductor puede tardar unos segundos en recibir los primeros segmentos HLS.

## Lista rápida

- [ ] Ejecutar `ipconfig` y copiar la IPv4 del adaptador Wi-Fi.
- [ ] Iniciar MediaMTX.
- [ ] Cambiar la IP en la URL RTMP del teléfono.
- [ ] Mantener la clave `aventura1`.
- [ ] Cambiar la IP en `js/stream-config.local.js`.
- [ ] Confirmar que ambos dispositivos usan la misma red Wi-Fi.
- [ ] Pulsar **Go Live** en el teléfono.
- [ ] Buscar `is publishing to path 'live/aventura1'` en MediaMTX.
- [ ] Recargar la página web.

## Si no funciona

1. Verifica que la IP del teléfono y la del archivo coincidan con la IPv4 actual de la laptop.
2. Confirma que MediaMTX siga abierto.
3. Comprueba que el teléfono no esté usando datos móviles o una red Wi-Fi diferente.
4. Permite MediaMTX en el Firewall de Windows para redes privadas.
5. Revisa que no haya una VPN activa que cambie la ruta de red.
6. Un error `404` en el archivo `.m3u8` normalmente significa que todavía no hay una transmisión activa.

## Recomendación

Configura una reserva DHCP en el router para que la laptop reciba siempre la misma IP. Así no será necesario repetir estos cambios mientras uses esa red.
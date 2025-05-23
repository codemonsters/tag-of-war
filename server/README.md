# Backend / Servidor del Juego

Enlaces con ejemplos: 
* https://dev.to/codesphere/getting-started-with-web-sockets-in-nodejs-49n0
* https://ably.com/blog/web-app-websockets-nodejs

Arch Linux: yay -S npm nodejs

## Preparación del entorno de desarollo

### Linux y Mac:

1. Instalar NodeJS y NPM
2. Inicializar Node y crear el archivo package.json: ``server$ npm init -y``
3. Instalar las librerías necesarias (ws es una implementación de websocket, nodemon reinicia automáticamente el servidor Node cuando detecta cambios en el código, better-sqlite3 permite trabajar de manera síncrona con bases de datos SQLite3): ``server $ npm install ws nodemon uuid@latest better-sqlite3``

### Windows:

Desde una terminal PowerShell:
1. Instalar fnm (Fast Node Manager): ``server$ winget install Schniz.fnm``
2. Instalar Node.js: ``fnm install 23``
3. Inicializar Node y crear el archivo package.json: ``server$ npm.cmd init -y``
4. Instalar las librerías necesarias: ``server$ npm.cmd install ws nodemon uuid@latest better-sqlite3``

## Ejecutar el servidor

``server$ node main.js``

Se puede acceder a él desde la URL: ``ws://127.0.0.1:9090``

## Protocolo Comunicaciones entre Clientes y Servidor WebSocket

Para comunicarse, los clientes y el servidor intercambian mensajes en formato json con dos atributos:

```json
{
    "cmd": "nombre_del_comando",
    "data": {diccionario_con_argumentos}
}
```

### login

Tras iniciar la conexión del WebSocket, el cliente debe identificarse con el comando "login"

Solicitud anónima de ejemplo:

```json
{
    "cmd": "login",
    "data": { "username": "matador53" }
}
```

Solicitud de usuario registrado de ejemplo:
```json
{
    "cmd": "login",
    "data": { "username": "matador53", "password": "0cc175b9c0f1b6a831c399e269772661" }
}
```

Respuesta OK:

```json
{
    "cmd": "login",
    "success": true,
    "data": {}
}
```

Respuesta con error:

```json
{
    "cmd": "login",
    "success": false,
    "data": { "details": "username already taken" }
}
```

### create_and_join_room

Cada cliente identificado pueden crear como máximo una habitación. Tras crearla, el propietario entrará automáticamente en ella.

Solicitud de ejemplo:

```json
{
    "cmd": "create_and_join_room",
    "data": { "name": "room1" }
}
```

Respuesta OK:

```json
{
    "cmd": "create_and_join_room",
    "success": true,
    "data": {}
}
```

Respuesta con error:

```json
{
    "cmd": "create_and_join_room",
    "success": false,
    "data": { "details": "room name already used" }
}
```

Inmediatamente después de que un usuario cree una habitación, el servidor envia un mensaje como este al resto de clientes conectados y autentificados (tanto como invitado como con registro) informando sobre la creación de la habitación:

```json
{
    "cmd": "new_room_available",
    "success": false,
    "data": { "name": "room1" }
}
```

### join_room

Los clientes que previamente hayan hecho login y que no sean propietarios de una habitación, pueden entrar en otra habitación

Solicitud de ejemplo:

```json
{
    "cmd": "join_room",
    "data": { "name": "room1" }
}
```

Respuesta OK:

```json
{
    "cmd": "join_room",
    "success": true,
    "data": {}
}
```

Respuesta con error:

```json
{
    "cmd": "join_room",
    "success": false,
    "data": { "details": "The room is full" }
}
```

Inmediatamente después de que un jugador entre en una habitación, el servidor envía un mensaje como este al resto de los jugadores de la misma habitación:

```json
{
    "cmd": "player_joined_current_room",
    "data": { "username": "matador53" }
}
```

### get_rooms

Solicita al servidor una lista con información sobre todas las habitaciones actuales.

Solicitud de ejemplo:

```json
{
    "cmd": "get_rooms"
}
```

Respuesta OK:

```json
{
    "cmd": "get_rooms",
    "success": true,
    "data": {
        "rooms":
            [
                {
                    "room_name": "room1",
                    "owner": "matador53",
                    "number_of_players": 3,
                    "map": "map1",
                    "mode": "classic",
                    "playing": false,
                    "owner_ip": "192.168.0.1",
                    "owner_port": "7000"
                },
                {
                    "room_name": "test_room",
                    "owner": "player43",
                    "number_of_players": 1,
                    "map": "map1",
                    "mode": "infection",
                    "playing": true,
                    "owner_ip": "192.168.0.2",
                    "owner_port": "7000"
                }
            ]
        }
}
```

Respuesta con error:

```json
{
    "cmd": "get_rooms",
    "success": false,
    "data": { "details": "Please login to get the list of rooms" }
}
```

### leave_current_room

Los jugadores que estén en una habitación pueden abandonarla enviando este mensaje. Si quien abandona es el propietario, la habitación será eliminada (ver más abajo).

Solicitud de ejemplo:

```json
{
    "cmd": "leave_current_room"
}
```

Respuesta OK:

```json
{
    "cmd": "leave_current_room",
    "success": true,
    "data": { "name": "room1" }
}
```

Respuesta con error:

```json
{
    "cmd": "leave_current_room",
    "success": false,
    "data": { "details": "You are not in a room (nothing to leave)" }
}
```

Si quien abandona la habitación es su propietario, esta será destruida, echando a todos los jugadores que estén en ella. Además, cada uno de los demás jugadores recibirán el siguiente menaje:

```json
{
    "cmd": "room_destroyed",
    "data": { "name": "room1" }
}
```

### get_room_details

Los usuarios logeados pueden solicita al servidor detalles sobre el estado actual de cualquier habitación.

Solicitud de ejemplo:

```json
{
    "cmd": "get_room_details",
    "data": {"room_name": "room1"}
}
```

Respuesta OK:

```json
{
    "cmd": "get_room_details",
    "success": true,
    "data": {
        "room_name": "room1",
        "owner": "player43",
        "players": [
            "matador53",
            "matador54"
        ],
        "map": "map1",
        "mode": "infection",
        "playing": true,
        "owner_ip": "192.168.0.2",
        "owner_port": "7000"
    }
}
```

Respuesta con error:

```json
{
    "cmd": "get_room_details",
    "success": false,
    "data": { "details": "Room not found" }
}
```

### kick_from_current_room

El propietario de una habitación puede echar a un jugador de ella.

Solicitud de ejemplo:

```json
{
    "cmd": "kick_from_current_room",
    "data": { "username": "matador53" }
}
```

Respuesta OK:

```json
{
    "cmd": "kick_from_current_room",
    "success": true,
    "data": {}
}
```

Respuesta con error:

```json
{
    "cmd": "kick_from_current_room",
    "success": false,
    "data": { "details": "Only room owner can kick other players" }
}
```

Si un jugador es echado de una habitación, tanto el jugador que fue echado como los demás jugadores de la habitación recibirán  un mensaje como este:

```json
{
    "cmd": "player_kicked_from_current_room",
    "data": { "username": "matador53" }
}
```

### send_message_to_current_room

Envía un mensaje de texto que recibirán el resto de jugadores de la misma habitación.

Solicitud de ejemplo:

```json
{
    "cmd": "send_message_to_current_room",
    "data": { "message": "Hello world!" }
}
```

Respuesta OK:

```json
{
    "cmd": "send_message_to_current_room",
    "success": true,
    "data": {}
}
```

Respuesta con error:

```json
{
    "cmd": "send_message_to_current_room",
    "success": false,
    "data": { "details": "You are not in a room (nothing to send)" }
}
```

Tras el envío de un mensaje, el resto de los jugadores de la habitación recibirán un mensaje como este:

```json
{
    "cmd": "room_message",
    "data": { "from": "matador53", "message": "Hello world!" }
}
```

### start_match

El propietario de una habitación debe enviar este mensaje al servidor en el momento que quiera que el juego comience.

Solicitud de ejemplo:

```json
{
    "cmd": "start_match"
}
```

Respuesta OK:

```json
{
    "cmd": "start_match",
    "success": true,
    "data": {}
}
```

Respuesta con error:

```json
{
    "cmd": "start_match",
    "success": false,
    "data": { "details": "You don't own any room" }
}
```

Antes de que el servidor envíe la anterior respuesta, cada uno de los jugadores de la habitación recibirá un mensaje como el siguiente, en el cual se incluye la ip y el puerto al que tendrán que conectarse para unirse a la partida:

```json
{
    "cmd": "match_started",
    "data": { "host_ip": "192.168.0.1", "host_port": "7000" }
}
```

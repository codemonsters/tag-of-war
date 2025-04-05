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
    "cmd": "new_player_joined",
    "data": { "username": "matador53" }
}
```

### leave_current_room

Los jugadores que estén en una habitación pueden abandonarla enviando este mensaje. Si quien abandona es el administrador, la habitación será eliminada (ver más abajo).

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
    "data": {}
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

Si quien abandona la habitación es el administrador, esta será destruida, echando a todos los jugadores que estén en ella. Además, cada uno de los demás jugadores recibirán el siguiente menaje:

```json
{
    "cmd": "room_destroyed",
    "data": { "name": "room1" }
}
```

### kick_from_current_room

Los administradores de una habitación pueden echar a cualquier jugador de la misma.

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

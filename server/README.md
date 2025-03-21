# Backend / Servidor del Juego

Enlaces con ejemplos: 
* https://dev.to/codesphere/getting-started-with-web-sockets-in-nodejs-49n0
* https://ably.com/blog/web-app-websockets-nodejs

Arch Linux: yay -S npm nodejs

## Preparación del entorno de desarollo

Primero, instalar NodeJS y NPM

Initialize node and create a package.json file:
``npm init -y``

Install ws library (a websocket implementation) and nodemon (to track changes in our code and restart the server):
``npm install ws nodemon uuid@latest better-sqlite3``

Windows(en PowerShell):
# Download and install fnm:
winget install Schniz.fnm
# Download and install Node.js:
fnm install 23

Initialize node and create a package.json file:
``npm.cmd init -y``

Install ws library (a websocket implementation) and nodemon (to track changes in our code and restart the server):
``npm.cmd install ws nodemon uuid@latest sqlite3``


## Ejecutar el servidor

node main.js
ws://127.0.0.1:9090/
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
    "cmd": "logged_in",
    "success": true,
    "data": {}
}
```

Respuesta con error:

```json
{
    "cmd": "logged_in",
    "success": false,
    "data": { "details": "username already taken" }
}
```

### create_room

Cada cliente identificado pueden crear como máximo una habitación.

Solicitud de ejemplo:

```json
{
    "cmd": "create_room",
    "data": { "name": "room1" }
}
```

Respuesta OK:

```json
{
    "cmd": "create_room",
    "success": true,
    "data": {}
}
```

Respuesta con error:

```json
{
    "cmd": "create_room",
    "success": false,
    "data": { "details": "room name already used" }
}
```

### create_room

Los clientes que previamente hayan hecho login y que no sean propietarios de una
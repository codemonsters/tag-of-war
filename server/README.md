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

### join_room

Los clientes que previamente hayan hecho login y que no sean propietarios de una habitación, pueden entrar en otra habitación

Solicitud de ejemplo:

```json
{
    "cmd": "join_room",
    "data": { "name": "room1" }
}
```

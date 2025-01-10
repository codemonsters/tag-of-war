# Backend / Servidor del Juego

## Preparación del entorno de desarollo

Enlaces con ejemplos: 
* https://dev.to/codesphere/getting-started-with-web-sockets-in-nodejs-49n0
* https://ably.com/blog/web-app-websockets-nodejs

Arch Linux: yay -S npm nodejs

Initialize node and create a package.json file:
``npm init -y``

Install ws library (a websocket implementation) and nodemon (to track changes in our code and restart the server):
``npm install ws nodemon``

## Ejecutar el servidor

node main.js

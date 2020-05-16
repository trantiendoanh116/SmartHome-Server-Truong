var io = socketio(server);
//Tạo namespace để phân biêt SocketClient trên Esp, webapp, AndroidApp
var esp8266_nsp = io.of('/esp8266')
var middleware = require('socketio-wildcard')();
esp8266_nsp.use(middleware);
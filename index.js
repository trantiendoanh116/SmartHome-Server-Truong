const PORT = 80;

var http = require('http');
var express = require('express');
const path = require('path');
const router = express.Router();
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var socketio = require('socket.io')
var firebaseAdmin = require('./firebase_admin')
const db = firebaseAdmin.firestore();

var authorizeCookie = require('./middlewares/authentication').cookie;


var app = express();
var server = http.Server(app)
var ip = require('ip');

var io = socketio(server);
//Tạo namespace để phân biêt SocketClient trên Esp, webapp, AndroidApp
var esp8266_nsp = io.of('/esp8266')
var middleware = require('socketio-wildcard')();
esp8266_nsp.use(middleware);


server.listen(process.env.PORT || PORT);
console.log("Server nodejs chay tai dia chi : " + ip.address() + ":" + PORT)
//Cài đặt webapp các fie dữ liệu tĩnh
app.use(express.static("node_modules/mobile-angular-ui"))
app.use(express.static("node_modules/angular"))
app.use(express.static("node_modules/angular-route"))
app.use(express.static("node_modules/socket.io-client"))
app.use(express.static("node_modules/angular-socket-io"))
app.use(express.static("node_modules/firebase"))
app.use(express.static("public"))
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', router)

router.get('/home', authorizeCookie, function (req, res) {
  res.sendFile(path.join(__dirname + '/public/html/index.html'));
});

router.get('/', function (req, res) {
  res.redirect('/home');

});
router.get('/ping', function (req, res) {
  res.sendStatus(200);

});

router.get('/login', function (req, res) {
  const authtoken = req.cookies.authtoken || '';
  firebaseAdmin.auth().verifySessionCookie(authtoken, true)
    .then((decodedClaims) => {
      res.redirect('/user');
    }).catch(() => {
      res.sendFile(path.join(__dirname + '/public/html/login.html'));
    });

});

router.get('/user', authorizeCookie, function (req, res) {
  res.sendFile(path.join(__dirname + '/public/html/user.html'));

});


router.post('/sessionLogin', function (req, res, next) {

  if (!req.body.hasOwnProperty("idToken")) {
    console.info("UNAUTHORIZED REQUEST!")
    res.status(401).send('UNAUTHORIZED REQUEST!');
    return;
  }
  const idToken = req.body.idToken.toString();
  console.info("idToken: " + idToken);
  // Set session expiration to 14 days.
  const expiresIn = 14 * 60 * 60 * 24 * 1000;
  firebaseAdmin.auth().createSessionCookie(idToken, { expiresIn })
    .then((sessionCookie) => {
      // Set cookie policy for session cookie.
      res.setHeader('Cache-Control', 'private');
      res.cookie('authtoken', sessionCookie, { expires: new Date(Date.now() + expiresIn), httpOnly: true });
      res.end(JSON.stringify({ status: 'success' }));
    }, error => {
      console.error(error)
      res.status(401).send('UNAUTHORIZED REQUEST!');
    });
});


router.post('/logout', (req, res) => {
  const authtoken = req.cookies.authtoken || '';
  res.clearCookie('authtoken');
  firebaseAdmin.auth().verifySessionCookie(authtoken)
    .then((decodedClaims) => {
      return firebaseAdmin.auth().revokeRefreshTokens(decodedClaims.sub);
    })
    .then(() => {
      res.end(JSON.stringify({ status: 'success' }));
    })
    .catch((error) => {
      res.end(JSON.stringify({ status: 'success' }));
    });
});

//-------------API------------------//
router.post('/device/control', (req, res) => {
  var data = req.body;
  console.log(data);
  if (socketEsp8266 != undefined && socketEsp8266.connected) {
    esp8266_nsp.emit('CONTROL', data);
    return res.sendStatus(201);
  } else {
    console.log('ESP8266 disconnect');
    return res.sendStatus(400);
  }
});

var socketEsp8266;
////Bắt các sự kiện từ ESP8266
esp8266_nsp.on('connection', function (socket) {
  console.log('Socket ESP8266 connected')
  socketEsp8266 = socket;
  socket.on('disconnect', function () {
    console.log("Disconnect socket ESP8266")
    socketEsp8266 = undefined
  });

  socket.on("*", function (packet) {
    console.log('ESP8266 send to server: ', packet.data)
    var data = packet.data[1] || {}
    var deviceId = packet.data[0] || ''
    console.log('DeviceId = ' + deviceId + ', data = ' + JSON.stringify(data));
    if (data != {} && deviceId != '') {
      let collection;
      if (DEVICES.indexOf(deviceId) > -1) {
        collection = COLLECTION_DEIVICES;
      } else if (SENSORS.indexOf(deviceId) > -1) {
        collection = COLLECTION_SENSOR;
      } else {
        collection = '';
        console.error('DeviceId not found, data = ' + JSON.stringify(packet.data));
      }
      if (collection !== '') {
        db.collection(collection).doc(deviceId).update(data).then(response => {
          //console.log(response);
        }).catch(error => {
          console.log(error);
        });
        //console.log('send to firebase');
      }
    }
  });
});

const COLLECTION_DEIVICES = 'devices';
const COLLECTION_SENSOR = 'sensors';
const DEVICES = ['F1_D01', 'F1_D02', 'F1_D03', 'F1_D04', 'F1_D05', 'F1_D06', 'F1_D07', 'F1_D08', 'F1_D09', 'F1_D10', 'F1_D11', 'F1_D12', 'F1_D13', 'F1_D14', 'F1_D14', 'F1_D16', 'F1_D18', 'F1_D19'];
const SENSORS = ['F1_S01', 'F1_S02', 'F1_S03', 'F1_S04']



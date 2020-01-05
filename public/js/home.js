angular.module('myApp', [
	'ngRoute',
	'mobile-angular-ui',
	'btford.socket-io'
]).config(function ($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: '../html/home.html',
		controller: 'Home'
	});
}).factory('mySocket', function (socketFactory) {
	var myIoSocket = io.connect('/webapp');	//Tên namespace webapp

	mySocket = socketFactory({
		ioSocket: myIoSocket
	});
	return mySocket;

	//Hàm xử lý chính
}).controller('Home', function ($scope, mySocket) {
	const EVENT_RECEIVE_DATA = "DATA";
	const EVENT_CONTROL = "CONTROL";
	//Dùng để đặt các giá trị mặc định
	$scope.F1_D01 = 0;
	$scope.F1_D02 = 0;
	$scope.temp = 0;
	$scope.humi = 0;
	$scope.co = 0;

	$scope.changeDenTran = function () {
		var json = {};
		json["F1_D01"] = "change";
		mySocket.emit(EVENT_CONTROL, json);
	};
	$scope.changeDenChum = function () {
		var json = {};
		json["F1_D02"] = "change";
		mySocket.emit(EVENT_CONTROL, json);
	};


	mySocket.on(EVENT_RECEIVE_DATA, function (json) {
		console.log(json)
		
		if (json.hasOwnProperty('F1_D01')) {
			var value = json['F1_D01'];
			$scope.F1_D01 = value
		}
		if (json.hasOwnProperty('F1_D02')) {
			var value = json['F1_D02'];
			$scope.F1_D02 = value
		}
	
		if (json.hasOwnProperty('temp')) {
			var value = json['temp'];
			$scope.temp = value
		}
		if (json.hasOwnProperty('humi')) {
			var value = json['humi'];
			$scope.humi = value
		}
		if (json.hasOwnProperty('co')) {
			var value = json['co'];
			$scope.co = value
		}

	});


	mySocket.on('connect', function () {
		console.log("connected webapp")
	});


});
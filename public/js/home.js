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
	$scope.F1_D06 = 0;
	$scope.F1_D07 = 0;
	$scope.F1_D08 = 0;
	$scope.temp = 0;
	$scope.humi = 0;
	$scope.co = 0;

	$scope.changeDenTran = function () {
		var json = {};
		json["F1_D06"] = "change";
		mySocket.emit(EVENT_CONTROL, json);
	};
	$scope.changeDenChum = function () {
		var json = {};
		json["F1_D07"] = "change";
		mySocket.emit(EVENT_CONTROL, json);
	};
	$scope.changeDenTranh = function () {
		var json = {};
		json["F1_D08"] = "change";
		mySocket.emit(EVENT_CONTROL, json);
	};


	mySocket.on(EVENT_RECEIVE_DATA, function (json) {
		console.log(json)
		
		if (json.hasOwnProperty('F1_D06')) {
			var value = json['F1_D06'];
			$scope.F1_D06 = value
		}
		if (json.hasOwnProperty('F1_D07')) {
			var value = json['F1_D07'];
			$scope.F1_D07 = value
		}
		if (json.hasOwnProperty('F1_D08')) {
			var value = json['F1_D08'];
			$scope.F1_D08 = value
		}
	
		if (json.hasOwnProperty('C_S01')) {
			var temp = json['C_S01']['TEMP'] || 0
			var humi = json['C_S01']['HUMI'] || 0
			$scope.temp = temp
			$scope.humi = humi
		}
		if (json.hasOwnProperty('C_S02')) {
			$scope.co = json['C_S02']

		}
		

	});


	mySocket.on('connect', function () {
		console.log("connected webapp")
	});


});
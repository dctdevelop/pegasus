socket = io('https://live.pegasusgateway.com/socket')
window.socket = socket

app = angular.module('livecomms', [])
app.controller "MainCtrl", ($scope, $http)->
	$scope.main = "Sup"
	$scope.auth =
		pegasus : "https://pegasus1.pegasusgateway.com"
		username: "developer@digitalcomtech.com"
		password: "dctdevelop"
	$scope.token = null
	$scope.vehicles = []
	$scope.logs = []
	$scope.listening = []

	socket.on '_authenticated', (data)->
		console.log data
		$scope.vehicles = data.vehicles
		$scope.$apply()
		socket.emit("resources")
		return

	socket.on '_error', (message)->
		console.error message
		$scope.error = message
		$scope.$apply()
		return

	socket.on '_update', (message)->
		console.info message
		$scope.message = message
		$scope.$apply()
		return

	socket.on 'resources', (resources)->
		console.log resources
		# $scope.vehicles = vehicles
		# $scope.$apply()
		return

	socket.on 'events', (envelope)->
		console.log envelope

		namespace = envelope.namespace
		vehicle = envelope.object
		events = envelope.payload

		victim = angular.element(document.getElementById('scrollme'))[0]
		victim.scrollTop = victim.scrollHeight+10000

		events.map (i)->
			console.log i
			$scope.logs.push i

		$scope.$apply()

		return

	connect = ()->
		socket.emit 'authenticate', {'pegasus': $scope.auth.pegasus, "auth": $scope.token}
		return

	$scope.toggle = (vehicle)->
		console.log vehicle, vehicle in $scope.listening
		if vehicle in $scope.listening
			$scope.stop vehicle
		else
			$scope.listen vehicle

	$scope.listen = (vehicle)->
		if vehicle is "all"
			$scope.listening = $scope.vehicles
		else
			$scope.listening.push(vehicle)

		envelope = {namespace:"vehicle-events", objects: vehicle}
		socket.emit 'listen', envelope

		console.log('emitting listen to server', envelope)
		return

	$scope.stop = (vehicle)->
		if vehicle is "all"
			$scope.listening = []
		else
			$scope.listening.splice($scope.listening.indexOf(vehicle), 1)

		envelope = {namespace:"vehicle-events", objects: vehicle}
		socket.emit 'stop', envelope

		console.log('emitting stop to server', envelope)
		return

	$scope.authenticate = ()->
		$scope.error = null
		$scope.vehicles = []
		$scope.logs = []
		$scope.listening = []

		$scope.message = "Connecting to Gateway"
		$http.post $scope.auth.pegasus+"/api/v0/login", $scope.auth
		.success (data)->
			$scope.message = "Succesfully connected, establishing live communications"
			$scope.token = data.auth
			$http.defaults.headers.common.Authenticate = data.auth
			connect()
			return
		.error (data)->
			$scope.error = "Invalid credentials."
			return

	$scope.destroy = ()->
		stop('all')
		socket.disconnect()
		socket.connect()
		$scope.auth.password = ""
		$scope.token = null
		$scope.vehicles = []
		$scope.logs = []
		return

#Bootstrap application after everything is loaded (required if you want to use coffee-script directly in browser without precompiling)
angular.element(document).ready ()->
	angular.bootstrap(document, ['livecomms']);

# ------intialize the socket------------------------#
socket = io('https://live.pegasusgateway.com/socket')
window.socket = socket

app = angular.module('livecomms', ['ngMaterial'])
app.controller "MainCtrl", ($scope, $http, $filter, $timeout)->
	$scope.auth =
		pegasus : "https://pegasus1.pegasusgateway.com"
		base_url : "https://pegasus1.pegasusgateway.com/api/"
		username: "developer@digitalcomtech.com"
		password: "deV3lopErs"
	$scope.token = null
	$scope.vehicles = []
	$scope.vehicles_lis = []
	$scope.logs = []
	$scope.listening = []
#------Set up basic handlers--------------------------#
	socket.on '_authenticated', (data)->
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
		$scope.message = message
		$scope.$apply()
		return

	socket.on 'resources', (resources)->
		console.log "resources: ",resources
		return

	socket.on 'events', (envelope)->
		namespace = envelope.namespace
		vehicle = envelope.object
		payload = clean_payload envelope.payload
		window.globalHook?(payload)
		if 'event' not in payload.updates
			return
		window.hook?(payload)

		$scope.logs.push payload 
		$timeout ()->
			victim = angular.element(document.getElementById('scrollme'))[0]
			victim.scrollTop = victim.scrollHeight+10000
			return
		, 200

		$scope.$apply()
		return
	connect = ()->
		socket.emit 'authenticate', {'pegasus': $scope.auth.pegasus, "auth": $scope.token}
		return

	clean_payload = (payload)->
		payload._ver_core ?= '1.8.x'
		if payload.event?.type == 10
			payload.event?.label ?= 'trckpnt'
		else
			payload.event?.label = 'N/A'
		payload.updates ?= ['event']
		payload

	$scope.toggle = (vehicle)->
		if vehicle in $scope.listening
			$scope.stop vehicle
		else
			$scope.listen vehicle 
	process_cache = (events)->
		for ev in events
			clean = clean_payload ev
			$scope.logs.push clean_payload ev
		$timeout ()->
			victim = angular.element(document.getElementById('scrollme'))[0]
			victim.scrollTop = victim.scrollHeight+10000
			return
		, 200
		return

	$scope.listen = (vehicle)->
		if $scope._filter?.length
			filtered = $filter('filter') $scope.vehicles, $scope._filter
			vehicle = []
			for _f in filtered
				continue if _f in $scope.listening
				$scope.listening.push _f
				vehicle.push _f
		if vehicle is "all"
			$scope.listening = $scope.vehicles
		else
			$scope.listening.push(vehicle)

		envelope = {namespace:"vehicle-events", objects: vehicle}
		socket.emit 'listen', envelope, process_cache

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
		$http.post $scope.auth.pegasus+"/api/login", $scope.auth
		.then (response)->
			data = response.data
			$scope.message = "Succesfully connected, establishing live communications"
			$scope.token = data.auth
			$http.defaults.headers.common.Authenticate = data.auth
			connect()
			if $scope.token	 
				$scope.getVehicles()
			return
		.catch (response)->
			$scope.error = "Invalid credentials."
			return
#-------------------------GET USER VEHICLES ----------------------------------------//
	$scope.getVehicles = (page)->
		if page is undefined
			page = 1
		$http.get($scope.auth.base_url+'vehicles?page='+page)
		.then (response)->
			data = response.data
			$scope.vehicles_lis = $scope.vehicles_lis.concat(data.data)
			console.log "data", $scope.vehicles_lis
			if page != data.pages
				$scope.getVehicles page + 1
			return
		.catch (response)->
			$scope.error = "Invalid vehicles"
			return
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

socket = io('https://live.pegasusgateway.com/socket')
window.socket = socket

app = angular.module('livecomms', ['ngMaterial'])
app.controller "MainCtrl", ($scope, $http, $timeout)->
	$scope.main = "Sup"
	$scope.auth =
		pegasus : "https://pegasus1.pegasusgateway.com"
		username: "developer@digitalcomtech.com"
		password: "deV3lopErs"
	$scope.token = null
	$scope.vehicles = []
	$scope.vehicles_list = []
	$scope.logs = []
	$scope.listening = []

	socket.on '_authenticated', (data)->
		# console.log data
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
		# console.log resources
		# $scope.resources = resources
		# $scope.$apply()
		return
	socket.on 'events', (envelope)->
		namespace = envelope.namespace
		vehicle = envelope.object
		payload = clean_payload envelope.payload
		console.log "dphoto_ptr -> ", payload.event.dphoto_ptr is null
		if payload.event.dphoto_ptr is null
			return
		window.globalHook?(payload)
		if 'event' not in payload.updates
			return
		window.hook?(payload)

		$scope.logs.push payload 
		$timeout ()->
			victim = angular.element(document.getElementById('scrollme'))[0]
			victim?.scrollTop = victim?.scrollHeight+10000
			return
		, 200

		$scope.$apply()
		return
	connect = ()->
		socket.emit 'authenticate', {'pegasus': $scope.auth.pegasus, "auth": $scope.token}
		return

	clean_payload = (payload)->
		# console.log payload
		payload._ver_core ?= '1.8.x'
		if payload._ver_core.indexOf('1.8.') == 0
			_event = payload
			device = _event.device
			event.device = null
			delete _event.device
			_event.message = _event.taip
			_event.event_time ?= _event.event_time_epoch
			_event.system_time ?= _event.system_time_epoch
			payload =
				pre: true
				device: device
				event: _event
				_ver_core: _event._ver_core
		if payload.event?.type == 10
			payload.event?.label ?= 'trckpt'
		else
			payload.event?.label = 'N/A'
		payload.updates ?= ['event']
		payload


	connect = ()->
		socket.emit 'authenticate', {'pegasus': $scope.auth.pegasus, "auth": $scope.token}
		return

	$scope.toggle = (vehicle)->
		# console.log vehicle, $scope.listening
		if vehicle in $scope.listening
			$scope.stop vehicle
		else
			$scope.listen vehicle
		
		load_photo(vehicle)

	$scope.listen = (vehicle)->
	
		if $scope.vehicles.length is 0	
			return
		if vehicle is "all"
			$scope.listening = $scope.vehicles
		else
			$scope.listening.push(vehicle)

		envelope = {namespace:"vehicle-events", objects: vehicle}
		# console.log('emitting listen to server', envelope)
		socket.emit 'listen', envelope, process_cache

		return

	process_cache = (events)->
		for ev in events
			# console.log "e",ev.primary_id
			# clean = clean_payload ev
			$scope.logs.push clean_payload ev
		# console.log "full",$scope.logs
		$timeout ()->
			victim = angular.element(document.getElementById('scrollme'))[0]
			victim?.scrollTop = victim?.scrollHeight+10000
			return
		, 200

		return
	photoinfo = []
	load_photo = (vehicle)->
		# console.log "vid", vehicle
		if !vehicle
			return
		$http.get("#{$scope.auth.pegasus}/api/vehicles/"+vehicle+"/plugins/photocam/last")
		.then (response)->
			data = response.data
			$scope.log_photo_data = data.photos
			console.log "photo",$scope.log_photo_data
			# for p in $scope.log_photo_data
			# 	photoinfo[vehicle].push p
			# console.log "phot",photoinfo,vehicle		
		.catch (response) ->
			$scope.error = response.data?.message + ', ID-' + vehicle
	
	$scope.stop = (vehicle)->
		if vehicle is "all"
			$scope.listening = []
		else
			$scope.listening.splice($scope.listening.indexOf(vehicle), 1)

		# console.log('emitting stop to server', vehicle)
		socket.emit 'stop:vehicles', vehicle
		return

	$scope.authenticate = ()->
		$scope.auth_error = null
		$scope.vehicles = []
		$scope.logs = []
		$scope.listening = []

		$scope.message = "Connecting to Gateway"
		$http.post $scope.auth.pegasus+"/api/login", $scope.auth
		.then (response)->
			data = response.data
			$scope.message = "Successfully connected, establishing live communications"
			$scope.token = data.auth
			$http.defaults.headers.common.Authenticate = data.auth
			connect()
			$scope.getVehicles()
			return
		.catch (response)->
			$scope.auth_error = response.data.message 
			return
	$scope.getVehicles = (page)->
		if page is undefined
			page = 1
		$http.get($scope.auth.pegasus+"/api/"+'vehicles?page='+page)
		.then (response)->
			data = response.data
			$scope.vehicles_list = $scope.vehicles_list.concat(data.data)
			# console.log $scope.vehicles_list
			if page != data.pages
				$scope.getVehicles page + 1
			return
		.catch (response)->
			$scope.error = response
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

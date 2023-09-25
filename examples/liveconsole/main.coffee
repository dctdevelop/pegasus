socket = io('https://live.pegasusgateway.com/socket')
window.socket = socket

app = angular.module('livecomms', ['ngMaterial'])
app.controller "MainCtrl", ($scope, $http, $filter, $timeout)->
	$scope.main = "Sup"
	$scope.auth =
		pegasus : "https://pegasus1.pegasusgateway.com"
		username: "developer@digitalcomtech.com"
		password: "deV3lopErs"
	$scope.token = null
	$scope.vehicles = []
	$scope.history = []
	$scope.sent_indexes = {}
	$scope.listening = []
	$scope.pendings = []
	$scope.vehicles_list = []
	$scope.resp = []
	$scope.logs = []
	$scope.load = false

	socket.on '_authenticated', (data)->
		console.log data
		$scope.vehicles = data.vehicles
		console.log "vehicles",$scope.vehicles
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
		namespace = envelope.namespace
		vehicle = envelope.object
		payload = clean_payload envelope.payload
		window.globalHook?(payload)
		if 'event' not in payload.updates
			return
		window.hook?(payload)
		console.log "payload",payload
		# $scope.response = {}
		# $scope.event =  payload.event.outbresponse?.response
		# $scope.response?[payload.device.imei] = $scope.event
		# $scope.resp.push $scope.response
		$timeout ()->
			victim = angular.element(document.getElementById('scrollme'))[0]
			victim.scrollTop = victim.scrollHeight+10000
			return
		,200
		console.log "Event payload",$scope.resp
		$scope.$apply()
		return

	connect = ()->
		socket.emit 'authenticate', {'pegasus': $scope.auth.pegasus, "auth": $scope.token}
		return
	clean_payload = (payload)->
		payload?._ver_core ?= '3.0.0'
		if payload?._ver_core
			_event = payload
			payload =
				pre: true
				event: _event
				_ver_core: _event?._ver_core
		payload?.updates ?= ['event']
		payload

	$scope.toggle = (vehicle)->
		console.log vehicle, vehicle in $scope.listening
		if vehicle in $scope.listening
			$scope.stop vehicle
		else
			$scope.listen vehicle
	process_cache = (events)->
		for ev in events
			clean = clean_payload ev.event?.outbresponse
			$scope.resp.push clean_payload ev.event?.outbresponse
		$timeout ()->
			victim = angular.element(document.getElementById('scrollme'))[0]
			victim.scrollTop = victim.scrollHeight+10000
			return
		, 200

		return


	$scope.listen = (vehicle)->
		if vehicle is "all"
			$scope.listening = $scope.vehicles
		else
			$scope.listening.push(vehicle)

		envelope = {namespace:"vehicle-events", objects: vehicle}
		console.log("Emitting listening for 'vehicle-events' to server", envelope)
		socket.emit 'listen', envelope, process_cache 
		return

	$scope.stop = (vehicle)->
		if vehicle is "all"
			$scope.listening = []
		else
			$scope.listening.splice($scope.listening.indexOf(vehicle), 1)

		console.log("Emitting 'stop:vehicles' to server", vehicle)
		socket.emit 'stop:vehicles', vehicle
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
			$scope.message = "Successfully connected, establishing live communications"
			$scope.token = data.auth
			$http.defaults.headers.common.Authenticate = data.auth
			connect()
			$scope.getVehicles()
			$http.defaults.headers.common.Authenticate = $scope.token
			return
		.catch (response)->
			$scope.error = "Invalid credentials"
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

	$scope.sendCmd = ()->
		# socket.emit 'events', $scope.response
		$scope.load = true
		if $scope.command?.length is 0
			return
		if $scope.listening.length is 0
			return 
		console.log("Sending to the following entity IDs", $scope.listening)
		vids = $scope.listening 
		post_data = 
			cmd : $scope.command
			includeImei : false
		vids.map (vid)->
			uri = $scope.auth.pegasus+"/api/vehicles/"+vid+"/remote/console"
			$http.post(uri, post_data)
			.then (response)->
				data = response.data
				console.log "Remote request response",data
				if data.oids[0]
					ocid = data.oids[0]
					log = 
						ocid : ocid
						cmd : post_data.cmd
						imei: data.imei
						msg: data.msg
					$scope.history.push log
					$scope.load = false
					# $scope.sent_indexes[ocid] = $scope.history.length - 1
					console.log "History of command IDs",$scope.history
				return
			.catch (response)->
				$scope.error = "Invalid commands"+ " " + response.data.message
				console.log response
				return
			return 
	$scope.getVehicles = (page)->
		if page is undefined
			page = 1
		$http.get($scope.auth.pegasus+"/api/"+'vehicles?select=device:version,name&page='+page)
		.then (response)->
			data = response.data
			$scope.vehicles_list = $scope.vehicles_list.concat(data.data)
			console.log "Vehicle list", $scope.vehicles_list
			if page != data.pages
				$scope.getVehicles page + 1
			return
		.catch (response)->
			$scope.error = "Invalid vehicles"
			return
		return

#Bootstrap application after everything is loaded (required if you want to use coffee-script directly in browser without precompiling)
angular.element(document).ready ()->
	angular.bootstrap(document, ['livecomms']);

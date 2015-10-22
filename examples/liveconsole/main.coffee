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
	$scope.history = []
	$scope.sent_indexes = {}
	$scope.listening = []
	$scope.pendings = []

	socket.on '_authenticated', (message)->
		socket.emit("vehicle:list")
		return

	socket.on '_error', (message)->
		console.error message
		$scope.error = error
		$scope.$apply()
		return

	socket.on '_update', (message)->
		console.info message
		$scope.message = message
		$scope.$apply()
		return

	socket.on 'vehicle:list', (vehicles)->
		console.log vehicles
		$scope.vehicles = vehicles
		$scope.$apply()
		return

	socket.on 'events', (events)->
		victim = angular.element(document.getElementById('scrollme'))[0]
		victim.scrollTop = victim.scrollHeight+10000
		events.map (ev)->
			console.log ev
			#
			# 'outb_publish': {
			#	'do_outb_publish': True,
			#   'match': True,
			#   'outb_log': {
			#		'cid': 328081,
			#       'ctype': u'consolecmd',
			#        'state': 'device_ok'}},

			if ev.type == 10 #ignore gps events
				return
			if ev.type == 12
				return

			try
				ocid = ev.outb_publish.outb_log.cid
			catch exception
				ocid = undefined
			
			log = 
				ocid : ocid
				response : ev.taip
				unsolicited : true
				cmd : "...unsolicited..."

			console.log("check", ocid, $scope.sent_indexes)
			#console.log($scope.sent_indexes[ocid])
			if ocid == undefined
				log.unsolicited = false
				$scope.history.push log

			else
				if $scope.sent_indexes[ocid] == undefined
					log.unsolicited = false
					$scope.history.push log
				else
					ind = $scope.sent_indexes[ocid]
					$scope.history[ind].response = ev.taip


			#$scope.logs.push i
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

		console.log('emitting listen to server', vehicle)
		socket.emit 'listen:vehicles', vehicle
		return

	$scope.stop = (vehicle)->
		if vehicle is "all"
			$scope.listening = []
		else
			$scope.listening.splice($scope.listening.indexOf(vehicle), 1)

		console.log('emitting stop to server', vehicle)
		socket.emit 'stop:vehicles', vehicle
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
			$http.defaults.headers.common.Authenticate = $scope.token
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

	$scope.sendCmd = ()->
		if $scope.command.length == 0
			return
		#console.log("sending to ", $scope.listening)

		post_data = 
			cmd : $scope.command
			includeImei : false

		uri = $scope.auth.pegasus+"/api/vehicles/"+$scope.listening[0]+"/remote/console"
		$http.post(uri, post_data)
		.success (data)->
			
			if data.oids
				ocid = data.oids[0]
				console.log(ocid)
				log = 
					ocid : ocid
					cmd : post_data.cmd

				$scope.history.push log
				$scope.sent_indexes[ocid] = $scope.history.length - 1
			return
		.error (data)->
			
			return

		return 

#Bootstrap application after everything is loaded (required if you want to use coffee-script directly in browser without precompiling)
angular.element(document).ready ()->
	angular.bootstrap(document, ['livecomms']);

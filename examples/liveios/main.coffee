socket = io('https://live.pegasusgateway.com/socket')
window.socket = socket

app = angular.module('livecomms', ['ngMaterial'])
app.controller "MainCtrl", ($scope, $http, $timeout)->
	$scope.auth =
		pegasus : "https://pegasus1.pegasusgateway.com"
		username: "developer@digitalcomtech.com"
		password: "deV3lopErs"
	$scope.token = null
	$scope.load = false
	$scope.vehicles = []
	$scope.logs = []
	$scope.listening = []
	$scope.vehicles_list = []
	$scope.ios = {
		vid: null
		event_time: ''
		evlabel:'trckpt'
		io_pwr: null
		io_ign:null
		io_in1:null
		io_in2:null
		io_in3:null
		io_out1:null
		io_out2: null
	}
	$scope.alert = {
		type:""
		msg: ""
	}

	socket.on '_authenticated', (data)->
		console.log data
		$scope.vehicles = data.vehicles
		$scope.$apply()
		socket.emit("resources")
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
		console.log "Event", events
		events.map (i)->
			console.log i
			if $scope.ios.vid == i.vid
				$scope.ios.io_pwr = if i.io_pwr != undefined && i.io_pwr!=null then i.io_pwr else $scope.ios.io_pwr
				$scope.ios.io_ign = if i.io_ign != undefined && i.io_ign!=null then i.io_ign else $scope.ios.io_ign
				$scope.ios.io_in1 = if i.io_in1 != undefined && i.io_in1!=null then i.io_in1 else $scope.ios.io_in1
				$scope.ios.io_in2 = if i.io_in2 != undefined && i.io_in2!=null then i.io_in2 else $scope.ios.io_in2
				$scope.ios.io_in3 = if i.io_in3 != undefined && i.io_in3!=null then i.io_in3 else $scope.ios.io_in3
				$scope.ios.io_out1 = if i.io_out1 != undefined && i.io_out2!=null then i.io_out1 else $scope.ios.io_out1
				$scope.ios.io_out2 = if i.io_out2 != undefined && i.io_out2!=null then i.io_out2 else $scope.ios.io_out2
			$scope.logs.push i
			console.log "logs",$scope.logs
		$scope.$apply()
		return
	connect = ()->
		socket.emit 'authenticate', {'pegasus': $scope.auth.pegasus, "auth": $scope.token}
		return

	$scope.toggle = (vehicle)->
		$scope.alert.type=""
		$scope.alert.msg=""
		console.log vehicle, vehicle in $scope.listening
		if vehicle in $scope.listening
			$scope.stop vehicle
		else
			$scope.listen vehicle
		console.log "Entity", vehicle
		_get_state(vehicle)
		return

	$scope.modify_output = (out, state) ->
		$scope.load = true
		console.log "state",state,$scope.ios.vid
		$scope.alert.type=""
		$scope.alert.msg=""
		data = {
			otype:"n",
			out: out
			state: state
		}
		$http.post $scope.auth.pegasus+"/api/vehicles/"+$scope.ios.vid+"/remote/output", data
		.then (response)->
			data = response.data
			console.log data
			$scope.alert.type="SUCCESS"
			$scope.alert.msg=data.msg
			$timeout ->
				_get_state($scope.ios.vid)
				$scope.load = false
			,8000
			return
		.catch (response)->
			console.log "error",response.data.message
			$scope.alert.type="ERROR"
			$scope.alert.msg=data.message+  ' ' + response.data.message
			$scope.load = false
			return

	_get_state = (vehicle=null) ->
		$scope.load = true
		console.log "Vehicle id: ",vehicle
		if vehicle != null
			$scope.ios.vid = if $scope.ios.vid is null or $scope.ios.vid isnt vehicle then vehicle else $scope.ios.vid
		$http.get $scope.auth.pegasus+"/api/vehicles/"+$scope.ios.vid+"/remote/state"
		.then (response)->
			data = response.data
			$scope.ios.io_pwr= data.ios.io_pwr
			$scope.ios.io_ign= data.ios.io_ign
			$scope.ios.io_in1= data.ios.io_in1
			$scope.ios.io_in2= data.ios.io_in2
			$scope.ios.io_in3= data.ios.io_in3
			$scope.ios.io_out1= data.ios.io_out1
			$scope.ios.io_out2= data.ios.io_out2
			$scope.io_data = data.ios
			$scope.io_data.id = $scope.ios.vid
			$scope.logs.push $scope.io_data
			$scope.load = false
			console.log "ios",$scope.logs,$scope.ios.vid
			return
		.catch (response)->
			console.log data
			return

	$scope.listen = (vehicle)->
		$scope.listening = []
		$scope.listening.push(vehicle)
		socket.emit 'listen:vehicles', vehicle
		return

	$scope.stop = (vehicle)->
		$scope.listening = []
		socket.emit 'stop:vehicles', vehicle
		return
	$scope.getVehicles = (page)->
		if page is undefined
			page = 1
		$http.get($scope.auth.pegasus+"/api/"+'vehicles?page='+page)
		.then (response)->
			data = response.data
			$scope.vehicles_list = $scope.vehicles_list.concat(data.data)
			console.log "data", $scope.vehicles_list
			if page != data.pages
				$scope.getVehicles page + 1
			return
		.catch (response)->
			$scope.error = "Invalid vehicles"
			return
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
			console.log "mensje",$scope.message
			$scope.token = data.auth
			$http.defaults.headers.common.Authenticate = data.auth
			connect()
			$scope.getVehicles()
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

#Bootstrap application after everything is loaded (required if you want to use coffee-script directly in browser without precompiling)
angular.element(document).ready ()->
	angular.bootstrap(document, ['livecomms']);

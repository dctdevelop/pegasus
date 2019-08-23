app = angular.module('livecomms', ['ngMaterial'])
app.controller "MainCtrl", ($scope, $http, $filter, $timeout)->
	$scope.auth =
		pegasus : "https://pegasus1.pegasusgateway.com"
		username: "developer@digitalcomtech.com"
		password: "deV3lopErs"
	$scope.token = null
	$scope.vehicles = []
	$scope.vehicles_list = []
	$scope.load = false
	$scope.date_to = 
		to : new Date();
	$scope.date_from = 
		from :  new Date(new Date().setDate(new Date().getDate()-7))
	$scope.authenticate = ()->
		$scope.error = null
		$scope.message = "Connecting to Gateway"
		$http.post $scope.auth.pegasus+"/api/login", $scope.auth
		.then (response)->
			data = response.data
			$scope.message = "Successfully connected, establishing live communications"
			$scope.token = data.auth
			$http.defaults.headers.common.Authenticate = data.auth
			$scope.getVehicles()
			$http.defaults.headers.common.Authenticate = $scope.token
			return
		.catch (response)->
			$scope.error = "Invalid credentials"
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
	$scope.toggle = (vehicle) ->
		$scope.load = true
		$scope.id = vehicle
		d = $scope.date_from.from.setDate($scope.date_from.from.getDate()+0)
		d2 = $scope.date_to.to.setDate($scope.date_to.to.getDate()+1)
		f = $filter('date')(d, 'yyyy-MM-dd'+'T'+'HH:mm:ss')
		t = $filter('date')(d2, 'yyyy-MM-dd'+'T'+'HH:mm:ss')
		console.log "from",f
		console.log "vid",vehicle
		$http.get($scope.auth.pegasus+"/api/"+"rawdata?vehicles="+vehicle+"&from="+f+"&to="+t+"&fields=$basic&filter=valid_position")
		.then (response) ->
			data = response.data.events
			console.log "data",data
			$scope.events_raw = data
			$scope.load = false
		.catch (response) ->
			$scope.error_data = response
			return
		return 

#Bootstrap application after everything is loaded (required if you want to use coffee-script directly in browser without precompiling)
angular.element(document).ready ()->
	angular.bootstrap(document, ['livecomms']);

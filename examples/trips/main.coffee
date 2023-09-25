

app = angular.module('tripsApp', ["ui.bootstrap"])
app.controller "MainCtrl", ($scope, $http)->
    $scope.pegasus = {
        url:"https://pegasus1.pegasusgateway.com/api"
        username:"developer@digitalcomtech.com"
        password: "deV3lopErs"
    }

    $scope.token = null
    $scope.login_error=""
    $scope.vehicles = []
    $scope.selected_vehicle = null
    $scope.status = {
        opened: {
            from:false
            to:false
        }
    }
    $scope.dateOptions = {
        formatYear: 'yy'
        startingDay: 1
    }
    $scope.dt = {
        from_time:null
        to_time:null
    }
    $scope.formats = ['dd/MMMM/yyyy', 'yyyy-MM-dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[1];
    $scope.trips = []
    $scope.show_results = false

    $scope.signin = ->
        $http.post($scope.pegasus.url + '/login', $scope.pegasus)
        .then (response) ->
            data = response.data
            $scope.login_error = ""
            console.log data
            $scope.token = data.auth
            $http.defaults.headers.common.Authenticate = data.auth
            _populate_vehicles()
            return
        .catch (response) ->
            console.log response.data

    _populate_vehicles = (page) ->
        if page is undefined 
            page = 1
        $http.get($scope.pegasus.url+'/'+'vehicles?select=device:version,name&page='+page)
        .then (response)->
            data = response.data
            $scope.vehicles = $scope.vehicles.concat(data.data)
            console.log "Vehicle list", $scope.vehicles
            if page != data.pages
                _populate_vehicles page + 1
            return
        .catch (response)->
            $scope.error = "Invalid vehicles"
            return
        return

    $scope.get_trips = ->
        r_from = $scope.dt.from_time.getFullYear().toString()+"-"+($scope.dt.from_time.getMonth()+1).toString()+"-"+$scope.dt.from_time.getDate().toString()
        r_to = $scope.dt.to_time.getFullYear().toString()+"-"+($scope.dt.to_time.getMonth()+1).toString()+"-"+$scope.dt.to_time.getDate().toString()
        request = '/vehicles/'+$scope.selected_vehicle.id+'/trips?from_time='+r_from+'&to_time='+r_to
        $http.get($scope.pegasus.url + request).success((result) ->
            $scope.trips = result
            $scope.show_results = true
            return
            ).error (result, s, h) ->
                console.log result, s, h
                console.log '-----Error-----'
                return

    $scope.open = ($event, dtselected) ->
        if dtselected == "from"
            $scope.status.opened.from = true
        else
            $scope.status.opened.to = true
        return

    $scope.select_vehicle = (vehicle) ->
        $scope.selected_vehicle = vehicle
#Bootstrap application after everything is loaded (required if you want to use coffee-script directly in browser without precompiling)
angular.element(document).ready ()->
    angular.bootstrap(document, ['tripsApp']);

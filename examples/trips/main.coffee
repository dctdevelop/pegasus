

app = angular.module('tripsApp', ["ui.bootstrap"])
app.controller "MainCtrl", ($scope, $http)->
    $scope.pegasus = {
        url:"https://pegasus1.pegasusgateway.com/api"
        username:"developer@digitalcomtech.com"
        password: "dctdevelop"
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
        $http.post($scope.pegasus.url + '/login', $scope.pegasus).success((data) ->
            $scope.login_error = ""
            console.log data
            $scope.token = data.auth
            $http.defaults.headers.common.Authenticate = data.auth
            _populate_vehicles()
            return
            ).error (data, s, h) ->
                console.log data, s, h
                console.log '-----Error-----'
                $scope.login_error = data.message
                return

    _populate_vehicles = (page) ->
        page = page || 1
        $http.get($scope.pegasus.url + '/vehicles?set=100&page='+page).success((result) ->
            if result?
                $scope.vehicles = $scope.vehicles.concat(result.data)
                if page < result.pages
                    $scope._populate_vehicles(page+1)
            return
            )

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

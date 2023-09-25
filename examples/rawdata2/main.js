server = 'https://pegasus1.pegasusgateway.com/api/'
counters_app = angular.module('counters_app', ['ui.bootstrap', 'ngStorage','ngMaterial']);
counters_app.controller('MainCtrl', function($scope,$http,$localStorage) {
    //$localStorage.$reset()
    $scope.server = server
    $localStorage.$default({auth:{}, report_data:{}, vehicle:null })
    $scope.report_data = $localStorage.report_data
    $scope.auth = $localStorage.auth
    $scope.selected_vehicle = $localStorage.vehicle
    $scope.vehicles = []
    $scope.loading = {}
    $scope.vehicles_list = []

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    $scope.dts = {
        today : new Date(),
        from : new Date(),
        to: new Date(),
        same : true,
        open: {to:false, from:false}
    }
    $scope.format = 'yyyy-MM-dd'
    $scope.toggle_dt = function(picker,$event){
        $event.preventDefault();
        $event.stopPropagation();
        $scope.dts.open[picker] = !$scope.dts.open[picker]
    }

    $scope.login_check = function(){
        $http.get(server+'login')
        .then(function(response) {
            $scope.getVehicles()
        })
        .catch(function(response) {
            $scope.auth.token = undefined
            console.log("-----Error-----")
        });
    }
    $scope.logout = function(){
        $scope.auth.token = undefined
        //make actual logout request
        $http.get(server+'logout')
        .then(function(response){
            //pass
        })
        $localStorage.auth = undefined
    }
    $scope.login = function(){
        $http.post(server+'login',$scope.auth)
        .then(function(response) {
            data = response.data
            $scope.message = data.message
            $scope.auth.token = data.auth
            if($scope.auth.save){
                $localStorage.auth=auth
            }
            setTimeout(() => {
                $scope.getVehicles()
            }, 500);
            $http.defaults.headers.common.Authenticate = data.auth
        })
        ["catch"](function(response) {
            console.log(response)
            console.log("-----Error-----")
        });
    }
    $scope.getVehicles = function (page) {
        if (page === void 0) {
            page = 1;
        }
        $http.get(server+'vehicles?select=device:version,name&page=' + page)
        .then(function (response) {
            var data;
            data = response.data;
            $scope.vehicles_list = $scope.vehicles_list.concat(data.data);
            console.log("Vehicle list", $scope.vehicles_list);
            if (page !== data.pages) {
                $scope.getVehicles(page + 1);
            }
        })["catch"](function (response) {
            $scope.error = "Invalid vehicles";
        });
    };
    $scope.test = function(a){
        console.log(a)
    }
    $scope.select_vehicle = function(vehicle){
        $scope.selected_vehicle = vehicle
        $localStorage.vehicle = vehicle
    }
    $scope.generate_report = function(){
        $scope.report_data = {loading:'........'}
        from_date = $scope.dts.from
        to_date = $scope.dts.to
        from = from_date.getFullYear()+'/'+(from_date.getMonth()+1)+'/'+from_date.getDate()
        to = to_date.getFullYear()+'/'+(to_date.getMonth()+1)+'/'+to_date.getDate()
        console.log("--",from,to);
        // return
        request = {
            vehicles : $scope.selected_vehicle.id,
            codes : [0],
            fields : "io_ign,mph,code,lat,lon,vo,event_time",
            from : from,
            to : to
        }
        $http.get(server+'rawdata?vehicles='+$scope.selected_vehicle.id+"&from="+from+"&to="+to+"&$basic&fields=io_ign,mph,code,lat,lon,vo,event_time")
        .then(function(response){
            data = response.data
            $scope.report_data = data
            console.log("data", $scope.report_data);
            $localStorage.report_data = data
        })["catch"](function (response) {
            $scope.error = "Invalid vehicles";
            console.log("err",response);
            
        });
    }
    $scope.process = function(){

    }
    if($scope.auth.token){
        $http.defaults.headers.common.Authenticate = $scope.auth.token
        $scope.login_check()
    }
    if($scope.report_data.days){
        $scope.process()
    }
})

var serv = document.referrer;
if (serv == "") {
    var serverAux = document.URL;
    var serverArr = serverAux.split('/')

    if (serverArr[2] == "localhost:8080") {
        // var server = 'https://pegasus1.pegasusgateway.com/api/';
        // var server = 'https://www.track.kabzy.com/api/'
        // var server =  'https://gps.geoaustralchile.cl/api/'
        var server = 'https://plataforma.gpstelematica.com.mx/api/'
    }

    if (serverArr[2] == "cdn2.pegasusgateway.com") {
        var server = 'https://pegasus1.pegasusgateway.com/api/';
    }    
}
 
else {
    var serverAux = serv.split('/');
    var server = "https://" + serverAux[2] + "/api/";
}


app.controller('mainController', function($scope, $http, $localStorage, $location, $timeout, $q, $log, $mdDialog, $mdToast, $document, $interval) {

    $scope.auth = $localStorage.auth || {};
    $scope.flag_signin = true;
    $scope.picture = false;
    $scope.reports = false;
    $scope.backButton = false;

    $scope.flag_search = false;
    $scope.flag_report = false;
    $scope.flag_bar = false;
    $scope.techtable = false;
    $scope.isShownMileage = false;
    $scope.isShownSatcom = false;
    $scope.isShownMobileye = false;
    $scope.isShownGeo = false;
    $scope.isShownGraphECU = false;
    $scope.isShownGraphTech = false;
    $scope.isShownWorkDay = false;
    $scope.data_VG = {
        groups: [],
        vehicles:[]
    }
    $scope.vehicles = [];
    $scope.vehiclesSelect = null;
    $scope.groups = [];
    $scope.groupsSelect = null;
    $scope.odoMeter = [];
    $scope.geofences = [];
    $scope.users = [];
    $scope.geofences_types = [];
    $scope.newFinalArray = [];
    $scope.dates = {
        begin: new Date(),
        end: new Date()
    }

    $scope.currentDate = new Date();
    // $scope.loading = false;
    $scope.alert = "";
    $scope.vehiclesReport = [];
    $scope.labelDesc = "";
    $scope.reportName = "";
    $scope.sizeLiter = {
        liter: null
    };
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || jstz.determine().name()

    $scope.descriptions_Satcom = [{
        "name": "stcmignon",
        "description": "Ignition On via Satcom",
        "quantity": 0
    }, {
        "name": "stcmbrdtmp",
        "description": "High Board temperature",
        "quantity": 0
    }, {
        "name": "stcmbrdtpr",
        "description": "High Board Temperature Restored",
        "quantity": 0
    }, {
        "name": "stcmengcut",
        "description": "Engine Cut Done (Output 1 Activated)",
        "quantity": 0
    }, {
        "name": "stcmcutpnd",
        "description": "Engine Cut Pending",
        "quantity": 0
    }, {
        "name": "stcmengrst",
        "description": "Engine Restored (Output 1 Deactivated)",
        "quantity": 0
    }, {
        "name": "stcmantfai",
        "description": "GPS Antenna Failure",
        "quantity": 0
    }, {
        "name": "stcmantrst",
        "description": "GPS Antenna Restored",
        "quantity": 0
    }, {
        "name": "stcmignof",
        "description": "Ignition Off via Satcom",
        "quantity": 0
    }, {
        "name": "stcmimmo",
        "description": "Immobilization Activated",
        "quantity": 0
    }, {
        "name": "stcmimmoof",
        "description": "Immobilization Off",
        "quantity": 0
    }, {
        "name": "stcmin1on",
        "description": "Input 1 ON",
        "quantity": 0
    }, {
        "name": "stcmin2on",
        "description": "Input 2 ON",
        "quantity": 0
    }, {
        "name": "stcmin3on",
        "description": "Input 3 ON",
        "quantity": 0
    }, {
        "name": "stcmtst",
        "description": "Network Test",
        "quantity": 0
    }, {
        "name": "stcmprd",
        "description": "Periodic Event",
        "quantity": 0
    }, {
        "name": "stcmpwrlos",
        "description": "Power Loss",
        "quantity": 0
    }, {
        "name": "stcmpwrrst",
        "description": "Power Restored",
        "quantity": 0
    }, {
        "name": "stcmsimin",
        "description": "SIM Card Inserted",
        "quantity": 0
    }, {
        "name": "stcmsimrmv",
        "description": "SIM Card Removed",
        "quantity": 0
    }, {
        "name": "stcmspd",
        "description": "Speeding",
        "quantity": 0
    }, {
        "name": "stcmact",
        "description": "Satcom Mode Activated",
        "quantity": 0
    }, {
        "name": "stcmdeact",
        "description": "Satcom Mode Deactivated",
        "quantity": 0
    }];

    $scope.descriptions_Mobileye = [{
        "name": "mblyerr",
        "description": "Mobileye Error",
        "quantity": 0
    }, {
        "name": "mblylldw",
        "description": "Left Lane Departure Warning",
        "quantity": 0
    }, {
        "name": "mblyrldw",
        "description": "Right Lane Departure Warning",
        "quantity": 0
    }, {
        "name": "mblyfcw",
        "description": "Forward Collision Warning",
        "quantity": 0
    }, {
        "name": "mblymaint",
        "description": "Mobileye Maintenance Flag",
        "quantity": 0
    }, {
        "name": "mblyflsf",
        "description": "Mobileye Failsafe",
        "quantity": 0
    }, {
        "name": "mblypdfcw",
        "description": "Mobileye Pedestrian Forward Collision Warning",
        "quantity": 0
    }, {
        "name": "mblypddng",
        "description": "Pedestrian in Danger Zone",
        "quantity": 0
    }, {
        "name": "mblytmpr",
        "description": "Mobileye Tamper",
        "quantity": 0
    }, {
        "name": "mblyspd",
        "description": "Mobileye Speeding",
        "quantity": 0
    }, {
        "name": "mblyhdwrn",
        "description": "Mobileye Headway Warning",
        "quantity": 0
    }, {
        "name": "mblybrkon",
        "description": "Brakes on",
        "quantity": 0
    }, {
        "name": "mblylftsig",
        "description": "Left turn signal",
        "quantity": 0
    }, {
        "name": "mblyrghsig",
        "description": "Right turn signal",
        "quantity": 0
    }, {
        "name": "mblywprs",
        "description": "Wipers on",
        "quantity": 0
    }, {
        "name": "mblylwbm",
        "description": "Low Beams",
        "quantity": 0
    }, {
        "name": "mblyhibm",
        "description": "High Beams",
        "quantity": 0
    }, {
        "name": "mblytime",
        "description": "Time Signal",
        "quantity": 0
    }];

    $scope.frequencys = [{
        "id": 1,
        "frec": "0 (no average)",
        "value": 0
    }, {
        "id": 2,
        "frec": "30 seg",
        "value": 0.30
    }, {
        "id": 3,
        "frec": "1 min",
        "value": 1
    }, {
        "id": 4,
        "frec": "2 min",
        "value": 2
    }, {
        "id": 5,
        "frec": "5 min",
        "value": 5
    }, {
        "id": 6,
        "frec": "10 min",
        "value": 10
    }, {
        "id": 7,
        "frec": "30 min",
        "value": 30
    }, {
        "id": 8,
        "frec": "60 min",
        "value": 60
    }];

    // var self = this;
    // self.tech = [{
    //     'id': 1,
    //     'fulltype': 'Liter'
    // }, {
    //     'id': 2,
    //     'fulltype': 'Tank Size'
    // }];

    var last = {
        // bottom: false,
        top: true,
        left: true,
        // right: false
    };

    // self.selectedIndex = 1;
    // self.selectedtype = function() {
    //     return self.tech[self.selectedIndex].fulltype;
    // }

    $scope.login = function() {
        $http.post(server + 'login', $scope.auth)
            .success(function(data) {
                $scope.message = data.message
                $scope.auth.token = data.auth
                if ($scope.auth.save) {
                    $localStorage.auth = auth
                }

                $http.defaults.headers.common.Authenticate = data.auth;                
                $http.defaults.headers.common['X-Time-Zone'] = timezone;


                $scope.showSimpleToast();
                $scope.loadAll();
                $scope.Measure();
                $scope.loadGeo();
                $scope.loadUsers();
                $scope.loadGeoTypes();
                $scope.loadGroups();

                $scope.flag_signin = false;
                $scope.picture = true;
                $scope.flag_bar = true;
                $scope.showSimpleToast();                

                var timeoutId = setTimeout(function() {
                    $scope.showSimpleToast1();                                       
                }, 7200);

                var timeoutId = setTimeout(function() {
                    $scope.logoutButton = true;                                       
                }, 9000);

            })
            .error(function(data, s, h) {
                $scope.alert = 'Wrong username or password , please rectify.';
                $scope.showAlert();
            });
    }

    $scope.showSimpleToast = function() {
       $mdToast.show(
         $mdToast.simple()
           .textContent('Loading your sites data, please hold...')
           .theme('success-toast')
           .position('top left')
           .hideDelay(7200)
       );
    }

    $scope.showSimpleToast1 = function() {
       $mdToast.show(
         $mdToast.simple()
           .textContent('All done, Happy reporting... ')
           .theme('success-toast')
           .position('top left')
           .hideDelay(600)
       )
       self.isDisabled = false;

     }

    $scope.logout = function() {
        $http.get(server + 'logout')
            .success(function(data) {
                console.log('logged out')
                $localStorage.auth = $scope.auth;
                $scope.auth.token = undefined;
                $scope.logoutPage();

                $scope.odoMeter = [];
                $scope.vehicles = [];
                $scope.groups = [];
                $scope.vehiclesReport = [];
                $scope.dates.end = new Date();
                $scope.dates.begin = new Date();
                // $scope.loading = false;

                $scope.flag_signin = true;
                $scope.picture = false;
                $scope.flag_bar = false;
                $scope.flag_report = false;

                $scope.isShownMileage = false;
                $scope.isShownGeo = false;
                $scope.isShownSatcom = false;
                $scope.isShownGraphECU = false;
                $scope.isShownGraphTech = false;
                $scope.isShownWorkDay = false;
                $scope.reports = false;
                $scope.backButton = false;
                self.clear();
                self.isDisabled = true;
                $scope.logoutButton = false;


            })
            .error(function(data, s, h) {
                console.log("-----Error-----")
            });
    }

    $scope.Measure = function() {
        $http.get(server + "user")
            .success(function(data) {               
                if (data.prefs.distanceunits == "mile" || data.prefs.distanceunits == "km") {
                    $scope.unitMeasure = data.prefs.distanceunits;
                } else {
                    $scope.unitMeasure = "mile";

                };

                $scope.fuelunits = data.prefs.fuelunits;
            })
    }

    $scope.getOdometer = function(id) {
        if (id == null) {
            $scope.alert = 'You must specify a vehicle.';
            $scope.showAlert();
        } else {
            if ($scope.dates.begin > $scope.dates.end) {
                $scope.alert = 'The start date must be less than the end date.';
                $scope.showAlert();
                $scope.dates.end = new Date();
            }
            if (Math.round(Math.abs($scope.dates.end.getTime() - $scope.dates.begin.getTime()) / (1000 * 60 * 60 * 24)) > 31) {
                $scope.alert = 'The report cannot be more than 31 days.';
                $scope.showAlert();
                $scope.dates.begin = new Date();
                $scope.dates.end = new Date();
            } else {
                $scope.flag_report = false;
                // $scope.loading = true;
                $scope.currentDate = new Date();
                $scope.odoMeter = [];
                $scope.reportName = "Mileage";
                $scope.groupName = "";

                var from = $scope.dates.begin.getFullYear() + '-' + ($scope.dates.begin.getMonth() + 1) + '-' + $scope.dates.begin.getDate();
                var to = $scope.dates.end.getFullYear() + '-' + ($scope.dates.end.getMonth() + 1) + '-' + ($scope.dates.end.getDate());

                $http.get(server + "rawdata?vehicles=" + id + "&fields=first:@dev_dist,last:@dev_dist,diff:@dev_dist&filter=valid_position&resample=event_time&group_by=vid&how=first:first,last:last,diff:diff&freq=1D&from=" + from + "T00:00:00&to=" + to + "T23:59:59")
                    .success(function(events) {
                        $scope.odoMeter = events;

                        var pos = 0;
                        if ($scope.vehiclesSelect.groups.length > 0) {
                            while ($scope.groups.length > pos) {
                                if ($scope.vehiclesSelect.groups[0] == $scope.groups[pos].id) {
                                    $scope.groupName = $scope.groups[pos].name;
                                    break;
                                };
                                pos += 1;

                            };
                        }

                        $scope.loadReport();

                    })
                    .error(function(data, s, h) {
                        console.log(data, s, h)
                        console.log("-----Error-----")

                    });
            }

        }
    }

    $scope.optionsSatcom = {
        chart: {
            type: 'discreteBarChart',
            height: 450,
            margin: {
                top: 20,
                right: 20,
                bottom: 50,
                left: 55
            },
            x: function(d) {
                return d.label;
            },
            y: function(d) {
                return d.value;
            },
            showValues: false,
            // valueFormat: function(d){
            //     return d3.format(',.4f')(d);
            // },
            duration: 500,
            xAxis: {
                axisLabel: 'Event Name',
                rotateLabels: -8

            },
            yAxis: {
                axisLabel: 'Number of Events',
                axisLabelDistance: -10,
                tickFormat: function(d) {
                    return d3.format(',r')(d);
                }
            }
        }
    }

    $scope.loadGroupsSelect = function() {
       // Use timeout to simulate a 650ms request.
       return $timeout(function() {
         $scope.groups;
       }, 650);             
    }

    $scope.getSatcom = function(id) {
        if (id == null) {
            $scope.alert = 'You must specify a vehicle.';
            $scope.showAlert();
        } else {
            if ($scope.dates.begin > $scope.dates.end) {
                $scope.alert = 'The start date must be less than the end date.';
                $scope.showAlert();
                $scope.dates.end = new Date();
            }
            if (Math.round(Math.abs($scope.dates.end.getTime() - $scope.dates.begin.getTime()) / (1000 * 60 * 60 * 24)) > 31) {
                $scope.alert = 'The report cannot be more than 31 days.';
                $scope.showAlert();
                $scope.dates.begin = new Date();
                $scope.dates.end = new Date();
            } else {
                $scope.flag_report = false;
                // $scope.loading = true;
                $scope.currentDate = new Date();
                $scope.vehiclesReport = [];
                $scope.reportName = "Satcom";
                $scope.cont = 0;
                var graphSatcom = [];
                $scope.lat_lon = [];
                var aux = [];
                self.count = 0;
                self.hide = false;
                $scope.average_delay = '';
                $scope.rep = 0;


                var from = $scope.dates.begin.getFullYear() + '-' + ($scope.dates.begin.getMonth() + 1) + '-' + $scope.dates.begin.getDate();
                var to = $scope.dates.end.getFullYear() + '-' + ($scope.dates.end.getMonth() + 1) + '-' + ($scope.dates.end.getDate());


                $http.get(server + "rawdata?vehicles=" + id + "&from=" + from + "T00:00:00&to=" + to + "T23:59:59&fields=$basic,delay:@system_epoch-@event_epoch,ii&labels=stcmprd,stcmtst,stcmignon,stcmignoff,stcmspd,stcmin1on,stcmin2on,stcmin3on,stcmpwrloss,stcmantfail,stcmsimrmv,stcmbrdtmp,stcmimmo,stcmimmooff,stcmengcut,stcmengrstd,stcmcutpnd,stcmsimins,stcmpwrrstd,stcmantrstd,stcmbrdtmprstd,stcmsimin,stcmignof,stcmpwrlo,stcmantfa,stcmsimrm,stcmbrdtm,stcmimmoo,stcmengrs,stcmpwrrs,stcmantrs,stcmbrdtm,stcmact", $scope.auth.token)
                    .success(function(data) {
                        $scope.vehiclesReport = data.events;
                        $scope.speedUnit = data.units;
                        $scope.addField();
                        $scope.value = 0;
                        var aux1 = 0;
                        $scope.rep = 0;
                        $scope.diffDays = Math.round(Math.abs($scope.dates.end.getTime() - $scope.dates.begin.getTime())/(1000 * 60 * 60 * 24)); 

                        if ($scope.vehiclesReport.length != 0) {
                            for (var i = 0; i < $scope.vehiclesReport.length; i++) {
                                aux1 += $scope.vehiclesReport[i].delay;
                            }
                            aux1 = aux1 / $scope.vehiclesReport.length;
                            $scope.average_delay = $scope.convertSec_time(Math.round(aux1));
                        }
                        else{
                            $scope.average_delay = 0;
                        }



                        if ($scope.vehiclesReport.length < 200) {
                            $scope.rep = 1
                            }
                        if ( (200 < $scope.vehiclesReport.length) && ($scope.vehiclesReport.length < 400)){
                            $scope.rep = 2
                            }
                        if ((400 < $scope.vehiclesReport.length) && ($scope.vehiclesReport.length < 600)) {
                            $scope.rep = 3
                            }
                        if ( 600 < $scope.vehiclesReport.length) {
                            $scope.rep = 4
                            }


                        $scope.consultData();

                        for (var i = 0; i < $scope.descriptions_Satcom.length; i++) {
                            graphSatcom.push({
                                "label": $scope.descriptions_Satcom[i].description,
                                "value": $scope.descriptions_Satcom[i].quantity
                            });

                        }

                        for (var i = 0; i < $scope.vehiclesReport.length; i++) {
                            for (var j = 0; j < graphSatcom.length; j++) {
                                if ($scope.vehiclesReport[i].labelDesc == graphSatcom[j].label) {
                                    graphSatcom[j].value += 1;
                                    break;
                                }
                            }
                        }

                        for (var i = 0; i < graphSatcom.length; i++) {
                            if (graphSatcom[i].value != 0) {
                                aux.push(graphSatcom[i]);
                            }
                        }

                        graphSatcom = aux;

                        $scope.data1 = [{
                            key: "Quantity",
                            values: graphSatcom
                        }];


                        $scope.loadReport();

                    })
                    .error(function(data, s, h) {
                        console.log(data, s, h)
                        console.log("-----Error-----")

                    });

            }
        }
    }

    $scope.addField = function() {
        if ($scope.reportName == "Satcom") {

            for (var i = 0; i < $scope.vehiclesReport.length; i++) {
                for (var j = 0; j < $scope.descriptions_Satcom.length; j++) {
                    if ($scope.vehiclesReport[i].label == $scope.descriptions_Satcom[j].name) {
                        $scope.vehiclesReport[i]["labelDesc"] = $scope.descriptions_Satcom[j].description;
                    }
                }
            }

        }

        if ($scope.reportName == "Mobileye") {

            for (var i = 0; i < $scope.vehiclesReport.length; i++) {
                for (var j = 0; j < $scope.descriptions_Mobileye.length; j++) {
                    if ($scope.vehiclesReport[i].label == $scope.descriptions_Mobileye[j].name) {
                        $scope.vehiclesReport[i]["labelDesc"] = $scope.descriptions_Mobileye[j].description;
                    }
                }
            }

        }

        for (var i = 0; i < $scope.vehiclesReport.length; i++) {
            $scope.vehiclesReport[i]["my_delay"] = $scope.convertSec_time(Math.round($scope.vehiclesReport[i].delay));
            $scope.vehiclesReport[i]["address"] = "https://www.google.com/maps/place//@" + $scope.vehiclesReport[i].lat + "," + $scope.vehiclesReport[i].lon + ",15z";
        }
    }

    $scope.consultData = function() {
        if ($scope.reportName == "Satcom") {
            var label = "label_satcom";
        }
        if ($scope.reportName == "Mobileye") {
            var label = "label_mobileye";
        }        

        if (($scope.vehiclesReport.length - $scope.value) > 50) {
            var aux1 = $scope.value + 50;
            for (var aux = $scope.value; aux < aux1; aux++) {
                $scope.lat_lon.push({
                    "key": $scope.vehiclesReport[aux].id,
                    "lat": $scope.vehiclesReport[aux].lat,
                    "lon": $scope.vehiclesReport[aux].lon
                });
            }

            $scope.location($scope.lat_lon, aux, label);
            $scope.lat_lon = [];
            $scope.value += 50;
            $scope.consultData();
        } else {

            aux = $scope.vehiclesReport.length - $scope.value;
            for (var i = $scope.value; i < $scope.vehiclesReport.length; i++) {
                $scope.lat_lon.push({
                    "key": $scope.vehiclesReport[i].id,
                    "lat": $scope.vehiclesReport[i].lat,
                    "lon": $scope.vehiclesReport[i].lon
                });
            }
            $scope.location($scope.lat_lon, aux, label);
        }
    }

    $scope.location = function(obj, aux, label) {
        $scope.address = [];
        $http.post(server + 'reversegeo', obj).
        success(function(data, status, headers, config) {
            $scope.address = data;

            if (label == "label_satcom" || label == "label_mobileye") {
                for (var i = 0; i < $scope.vehiclesReport.length; i++) {
                    for (var j = 0; j < aux; j++) {
                        if ($scope.vehiclesReport[i].id == Object.keys($scope.address)[j]) {
                            $scope.vehiclesReport[i]["location"] = $scope.address[Object.keys($scope.address)[j]].location_full;
                            break;
                        }
                    };

                }
            }

            if (label == "start_location_ecu") {
                for (var i = 0; i < $scope.ecutrips.length; i++) {
                    for (var j = 0; j < aux; j++) {
                        if ($scope.ecutrips[i].id == Object.keys($scope.address)[j]) {
                            $scope.ecutrips[i]["start_location"] = $scope.address[Object.keys($scope.address)[j]].location_full;
                            $scope.ecutrips[i]["start_address"] = "https://www.google.com/maps/place//@" + $scope.ecutrips[i].start_lat + "," + $scope.ecutrips[i].start_lon + ",15z";
                            break;
                        }
                    };

                }
            }

            if (label == "end_location_ecu") {
                for (var i = 0; i < $scope.ecutrips.length; i++) {
                    for (var j = 0; j < aux; j++) {
                        if ($scope.ecutrips[i].id == Object.keys($scope.address)[j]) {
                            $scope.ecutrips[i]["end_location"] = $scope.address[Object.keys($scope.address)[j]].location_full;
                            $scope.ecutrips[i]["end_address"] = "https://www.google.com/maps/place//@" + $scope.ecutrips[i].end_lat + "," + $scope.ecutrips[i].end_lon + ",15z";
                            break;
                        }
                    };

                }
            }

            if (label == "start_location_tech") {
                for (var i = 0; i < $scope.techtrips.length; i++) {
                    for (var j = 0; j < aux; j++) {
                        if ($scope.techtrips[i].id == Object.keys($scope.address)[j]) {
                            $scope.techtrips[i]["start_location"] = $scope.address[Object.keys($scope.address)[j]].location_full;
                            $scope.techtrips[i]["start_address"] = "https://www.google.com/maps/place//@" + $scope.techtrips[i].start_lat + "," + $scope.techtrips[i].start_lon + ",15z";
                            break;
                        }
                    };

                }
            }

            if (label == "end_location_tech") {
                for (var i = 0; i < $scope.techtrips.length; i++) {
                    for (var j = 0; j < aux; j++) {
                        if ($scope.techtrips[i].id == Object.keys($scope.address)[j]) {
                            $scope.techtrips[i]["end_location"] = $scope.address[Object.keys($scope.address)[j]].location_full;
                            $scope.techtrips[i]["end_address"] = "https://www.google.com/maps/place//@" + $scope.techtrips[i].end_lat + "," + $scope.techtrips[i].end_lon + ",15z";
                            break;
                        }
                    };

                }
            }

        }).
        error(function(data, status, headers, config) {
            console.log("-----Error-----")
        });
    } 

    $scope.getMobileye = function(id) {
        if (id == null) {
            $scope.alert = 'You must specify a vehicle.';
            $scope.showAlert();
        } else {
            if ($scope.dates.begin > $scope.dates.end) {
                $scope.alert = 'The start date must be less than the end date.';
                $scope.showAlert();
                $scope.dates.end = new Date();
            }
            if (Math.round(Math.abs($scope.dates.end.getTime() - $scope.dates.begin.getTime()) / (1000 * 60 * 60 * 24)) > 31) {
                $scope.alert = 'The report cannot be more than 31 days.';
                $scope.showAlert();
                $scope.dates.begin = new Date();
                $scope.dates.end = new Date();
            } else {
                $scope.flag_report = false;
                // $scope.loading = true;
                $scope.currentDate = new Date();
                $scope.vehiclesReport = [];
                $scope.reportName = "Mobileye";
                $scope.cont = 0;
                var graphMobileye = [];
                $scope.lat_lon = [];
                var aux = [];
                self.count = 0;
                self.hide = false;
                $scope.average_delay = '';
                $scope.rep = 0;


                var from = $scope.dates.begin.getFullYear() + '-' + ($scope.dates.begin.getMonth() + 1) + '-' + $scope.dates.begin.getDate();
                var to = $scope.dates.end.getFullYear() + '-' + ($scope.dates.end.getMonth() + 1) + '-' + ($scope.dates.end.getDate());


                $http.get(server + "rawdata?vehicles=" + id + "&from=" + from + "T00:00:00&to=" + to + "T23:59:59&fields=$basic,delay:@system_epoch-@event_epoch,ii&labels=mblyerr,mblylldw,mblyrldw,mblyfcw,mblymaint,mblyflsf,mblypdfcw,mblypddng,mblytmpr,mblyspd,mblyhdwrn,mblybrkon,mblylftsig,mblyrghsig,mblywprs,mblylwbm,mblyhibm,mblytime", $scope.auth.token)
                    .success(function(data) {
                        $scope.vehiclesReport = data.events;
                        $scope.speedUnit = data.units;
                        $scope.addField();
                        $scope.value = 0;
                        var aux1 = 0;
                        $scope.rep = 0;
                        $scope.diffDays = Math.round(Math.abs($scope.dates.end.getTime() - $scope.dates.begin.getTime())/(1000 * 60 * 60 * 24)); 

                        if ($scope.vehiclesReport.length != 0) {
                            for (var i = 0; i < $scope.vehiclesReport.length; i++) {
                                aux1 += $scope.vehiclesReport[i].delay;
                            }
                            aux1 = aux1 / $scope.vehiclesReport.length;
                            $scope.average_delay = $scope.convertSec_time(Math.round(aux1));
                        }
                        else{
                            $scope.average_delay = 0;
                        }

                        if ($scope.vehiclesReport.length < 200) {
                            $scope.rep = 1
                            }
                        if ( (200 < $scope.vehiclesReport.length) && ($scope.vehiclesReport.length < 400)){
                            $scope.rep = 2
                            }
                        if ((400 < $scope.vehiclesReport.length) && ($scope.vehiclesReport.length < 600)) {
                            $scope.rep = 3
                            }
                        if ( 600 < $scope.vehiclesReport.length) {
                            $scope.rep = 4
                            }


                        $scope.consultData();

                        for (var i = 0; i < $scope.descriptions_Mobileye.length; i++) {
                            graphMobileye.push({
                                "label": $scope.descriptions_Mobileye[i].description,
                                "value": $scope.descriptions_Mobileye[i].quantity
                            });

                        }

                        for (var i = 0; i < $scope.vehiclesReport.length; i++) {
                            for (var j = 0; j < graphMobileye.length; j++) {
                                if ($scope.vehiclesReport[i].labelDesc == graphMobileye[j].label) {
                                    graphMobileye[j].value += 1;
                                    break;
                                }
                            }
                        }

                        for (var i = 0; i < graphMobileye.length; i++) {
                            if (graphMobileye[i].value != 0) {
                                aux.push(graphMobileye[i]);
                            }
                        }

                        graphMobileye = aux;

                        $scope.data1 = [{
                            key: "Quantity",
                            values: graphMobileye
                        }];


                        $scope.loadReport();

                    })
                    .error(function(data, s, h) {
                        console.log(data, s, h)
                        console.log("-----Error-----")

                    });

            }
        }
    }

    $scope.loadGeo = function(page) {
        if (page == null) {
            page = 1
        }
        $http.get(server + 'geofences?select=properties&page=' + page, $scope.auth.token)
            .success(function(data) {
                $scope.geofences = $scope.geofences.concat(data.data);
                if (page < data.pages) {
                    $scope.loadGeo(page + 1)
                }

            })
            .error(function(data, s, h) {
                console.log(data, s, h)
                console.log("-----Error-----")
            });
    }

    $scope.loadUsers = function(page) {
        if (page == null) {
            page = 1
        }
        $http.get(server + 'users?select=username&page=' + page, $scope.auth.token)
            .success(function(data) {
                $scope.users = $scope.users.concat(data.data)
                if (page < data.pages) {
                    $scope.loadUsers(page + 1)
                }

            })
            .error(function(data, s, h) {
                console.log(data, s, h)
                console.log("-----Error-----")
            });
    }

    $scope.loadGeoTypes = function(page) {
        if (page == null) {
            page = 1
        }
        $http.get(server + 'geofence_types?select=name&page=' + page, $scope.auth.token)
            .success(function(data) {
                $scope.geofences_types = $scope.geofences_types.concat(data.data);
                if (page < data.pages) {
                    $scope.loadGeoTypes(page + 1)
                }

            })
            .error(function(data, s, h) {
                console.log(data, s, h)
                console.log("-----Error-----")
            });
    }

    $scope.newArray = function() {
        $scope.picture = false;
        $scope.reports = true;
        $scope.backButton = true;
        // $scope.loading = true;
        $scope.flag_report = false;
        $scope.newFinalArray = [];
        $scope.owner = "";

        for (var i = 0; i < $scope.geofences.length; i++) {
            $scope.namesGroups = [];
            $scope.namesTypes = [];

            if ($scope.geofences[i].properties.groups != null) {
                for (var j = 0; j < $scope.geofences[i].properties.groups.length; j++) {

                    for (var k = 0; k < $scope.groups.length; k++) {

                        if ($scope.geofences[i].properties.groups[j] == $scope.groups[k].id) {

                            $scope.namesGroups.push($scope.groups[k].name);
                        };
                    };

                };
            }

            if ($scope.geofences[i].properties.types != null) {

                for (var j = 0; j < $scope.geofences[i].properties.types.length; j++) {

                    for (var k = 0; k < $scope.geofences_types.length; k++) {

                        if ($scope.geofences[i].properties.types[j] == $scope.geofences_types[k].id) {

                            $scope.namesTypes.push($scope.geofences_types[k].name);
                        };
                    };

                };
            }

            for (var j = 0; j < $scope.users.length; j++) {
                if ($scope.users[j].id == $scope.geofences[i].properties.owner) {
                    $scope.owner = $scope.users[j].username;
                };
            }

            var obj = {
                name: $scope.geofences[i].properties.name,
                id: $scope.geofences[i].properties.id,
                scope: $scope.geofences[i].properties.visibility,
                owner: $scope.owner,
                group_name: $scope.namesGroups.join(", "),
                types: $scope.namesTypes.join(", ")
            }
            $scope.newFinalArray.push(obj);
        }

        $scope.loadReport()
    }

    $scope.loadReport = function() {
        // $scope.loading = false;
        $scope.flag_report = true;
    }

    $scope.loadAll = function(page) {
        if (page == null) {
            page = 1
        }
        $http.get(server + 'vehicles?page=' + page, $scope.auth.token)
            .success(function(data, timeout) {
                $scope.head = timeout;
                $scope.vehicles = $scope.vehicles.concat(data.data)
                $scope.data_VG.vehicles = $scope.data_VG.vehicles.concat(data.data)
                if (page <= data.pages) {
                    $scope.loadAll(page + 1)
                }

            })
            .error(function(data, s, h) {
                console.log(data, s, h)
                console.log("-----Error-----")
            });

        return $scope.vehicles.map(function(vehicle) {
            vehicle.value = vehicle.name.toLowerCase();
            return vehicle;
        });
    }

    $scope.loadGroups = function(page) {
        if (page == null) {
            page = 1
        }
        $http.get(server + 'groups?page=' + page, $scope.auth.token)
            .success(function(data) {
                $scope.groups = $scope.groups.concat(data.data);
                $scope.data_VG.groups = $scope.data_VG.groups.concat(data.data);
                if (page < data.pages) {
                    $scope.loadGroups(page + 1)
                }

            })
            .error(function(data, s, h) {
                console.log(data, s, h)
                console.log("-----Error-----")
            });

        return $scope.groups.map(function(group) {
            group.value = group.name.toLowerCase();
            return group;
        });
    }

    $scope.querySearch = function(query) {
        var results = query ? $scope.vehicles.filter($scope.createFilterFor(query)) : $scope.vehicles,
            deferred;
        if (self.simulateQuery) {
            deferred = $q.defer();
            $timeout(function() {
                deferred.resolve(results);
            }, Math.random() * 1000, false);

            return deferred.promise;
        } else {
            return results;

        }
    }

    $scope.searchTextChange = function(text) {

        $log.info('Text changed to ' + text);
    }

    $scope.selectedItemChange = function(item1) {
        $scope.flag_report = false;
        $scope.vehiclesSelect = item1;
        $log.info('Item changed to vehicles' + JSON.stringify(item1));
    }

    $scope.selectedItemChange1 = function(item) {
        if(item == null || item == undefined){
            $scope.data_VG.vehicles = []
            return
        }
        $scope.flag_report = false;
        $scope.data_VG.vehicles = $scope.vehicles.filter(function(vehicle){
            return vehicle.groups.indexOf(item.id) > -1
        })
        $scope.groupsSelect = item;      
        $log.info('Item changed to group ' + JSON.stringify(item));
    }

    $scope.createFilterFor = function(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(item) {
            return (item.value.indexOf(lowercaseQuery) === 0);
        };
    }

    $scope.showAlert = function() {
        alert = $mdDialog.alert()
            .title('Attention!!!')
            .content($scope.alert)
            .ok('Close');

        $mdDialog
            .show(alert)
            .finally(function() {
                alert = undefined;
            });
    }

    $scope.FromHTML = function() {
        var pdf = new jsPDF('p', 'pt', 'letter'),
            source = $('#fromHTMLdiv')[0],
            specialElementHandlers = {
                '#bypassme': function(element, renderer) {
                    return true
                }
            }
        pdf.setFontSize(10);

        margins = {
            top: 40,
            bottom: 40,
            left: 60,
            right: 60
        };

        pdf.fromHTML(
            source, // HTML string or DOM elem ref.
            margins.left, // x coord
            margins.top, // y coord
            {
                'width': margins.content // max width of content on PDF
                    ,
                'elementHandlers': specialElementHandlers
            },
            function(dispose) {
                pdf.save($scope.reportName + ' Report ' + monthNames[$scope.dates.begin.getMonth()] + '-' + $scope.dates.begin.getDate() + ' to ' + monthNames[$scope.dates.end.getMonth()] + '-' + $scope.dates.end.getDate() + '.pdf');
            },
            margins
        )
    }

    $scope.exportGeofences = function() {
        header = ['id', 'name', 'scope', 'owner', 'groups', 'types']
        data = $scope.newFinalArray.map(function(row) {
            return [row.id, row.name, row.scope, row.owner, row.group_name, row.types]
        })
        body = [header].concat(data)
        body = body.map(function(row) {
            fields = row.map(function(value) {
                value = "" + value
                return value.replace(/,/g, "\t")
            })
            return fields.join(",")
        }).join("\n")
        data = window.btoa(unescape(encodeURIComponent(body)))
        uri = "data:text/csv;base64," + data
        link = document.createElement('a')
        link.style.display = 'none'
        link.href = uri
        link.download = "Geofence Report " + monthNames[$scope.currentDate.getMonth()] + ' ' + $scope.currentDate.getDate() + ', ' + $scope.currentDate.getFullYear() + ".csv"
        link.click()
    }

    $scope.exportMileage = function() {
        var aux = "";
        var pos = 0;
        for (var i = 0; i < $scope.vehicles.length; i++) {
            if ($scope.odoMeter.events[0].vid == $scope.vehicles[i].id) {
                aux = $scope.vehicles[i].name;
                break;
            }
        }

        while ($scope.odoMeter.events.length > pos) {
            $scope.odoMeter.events[pos]["name"] = aux;
            pos += 1;

        }

        header = ['Vehicle_Name', 'Date', 'Starting_Odometer', 'Ending_Odometer', 'Distance_driven']
        data = $scope.odoMeter.events.map(function(row) {
            return [row.name, row.event_time, row.first, row.last, row.diff]
        })
        body = [header].concat(data)
        body = body.map(function(row) {
            fields = row.map(function(value) {
                value = "" + value
                return value.replace(/,/g, "\t")
            })
            return fields.join(",")
        }).join("\n")
        data = window.btoa(unescape(encodeURIComponent(body)))
        uri = "data:text/csv;base64," + data
        link = document.createElement('a')
        link.style.display = 'none'
        link.href = uri
        link.download = "Odometer Report " + monthNames[$scope.currentDate.getMonth()] + ' ' + $scope.currentDate.getDate() + ', ' + $scope.currentDate.getFullYear() + ".csv"
        link.click()
    }

    $scope.viewReport = function() {
        $scope.picture = false;
        $scope.flag_search = true;
    }

    $scope.viewDescriptionMileage = function() {
        $scope.isShownMileage = !$scope.isShownMileage;
        $scope.isShownGeo = false;
        $scope.isShownSatcom = false;
        $scope.isShownGraphECU = false;
        $scope.isShownGraphTech = false;
        $scope.isShownWorkDay = false;
        $scope.isShownMobileye = false;
    }

    $scope.viewDescriptionGeo = function() {
        $scope.isShownGeo = !$scope.isShownGeo;
        $scope.isShownMileage = false;
        $scope.isShownSatcom = false;
        $scope.isShownGraphECU = false;
        $scope.isShownGraphTech = false;
        $scope.isShownWorkDay = false;
        $scope.isShownMobileye = false;
    }

    $scope.viewDescriptionSatcom = function() {
        $scope.isShownSatcom = !$scope.isShownSatcom;
        $scope.isShownMileage = false;
        $scope.isShownGeo = false;
        $scope.isShownGraphECU = false;
        $scope.isShownGraphTech = false;
        $scope.isShownWorkDay = false;
        $scope.isShownMobileye = false;
    }

    $scope.viewDescriptionMobileye = function() {
        $scope.isShownMobileye = !$scope.isShownMobileye;
        $scope.isShownSatcom = false;
        $scope.isShownMileage = false;
        $scope.isShownGeo = false;
        $scope.isShownGraphECU = false;
        $scope.isShownGraphTech = false;
        $scope.isShownWorkDay = false;
    }

    $scope.viewGraphECU = function() {
        $scope.isShownGraphECU = !$scope.isShownGraphECU;
        $scope.isShownMileage = false;
        $scope.isShownGeo = false;
        $scope.isShownSatcom = false;
        $scope.isShownGraphTech = false;
        $scope.isShownWorkDay = false;
        $scope.isShownMobileye = false;
    }

    $scope.viewGraphTech = function() {
        $scope.isShownGraphTech = !$scope.isShownGraphTech;
        $scope.isShownGraphECU = false;
        $scope.isShownMileage = false;
        $scope.isShownGeo = false;
        $scope.isShownSatcom = false;
        $scope.isShownWorkDay = false;
        $scope.isShownMobileye = false;
    }

    $scope.viewWorkDay = function() {
        $scope.isShownWorkDay = !$scope.isShownWorkDay;
        $scope.isShownGraphTech = false;
        $scope.isShownGraphECU = false;
        $scope.isShownMileage = false;
        $scope.isShownGeo = false;
        $scope.isShownSatcom = false;
        $scope.isShownMobileye = false;
    }

    $scope.viewIcons = function() {
        $scope.picture = false;
        $scope.reports = true;
        $scope.backButton = true;
    }

    $scope.principalPage = function() {
        $location.path('/');
        $scope.picture = true;
        $scope.reports = false;
        $scope.backButton = false;
        $scope.flag_report = false;
        $scope.dates = {
            begin: new Date(),
            end: new Date()
        }
        $scope.sizeLiter = {
            liter: null
        };

        self.clear();
        $scope.data = [];
    }

    $scope.mileageReport = function() {

        $location.path('/mileage');
    }

    $scope.geofencesReport = function() {

        $location.path('/geofences');
    }

    $scope.satcomReport = function() {

        $location.path('/satcom');
    }

    $scope.mobileyeReport = function() {

        $location.path('/mobileye');
    }

    $scope.graphReportECU = function() {

        $location.path('/graphECU');
    }

    $scope.graphReportTech = function() {

        $location.path('/graphtech');
    }

    $scope.workDayReport = function() {

        $location.path('/workday');
    }

    $scope.logoutPage = function() {

        $location.path('/');
    }

    $scope.options_linePlusBar = {
        chart: {
            type: 'linePlusBarChart',
            height: 500,
            margin: {
                top: 30,
                right: 75,
                bottom: 50,
                left: 75
            },
            legendRightAxisHint: (' [Right Axis]'),
            legendLeftAxisHint: (' [Left Axis]'),
            bars: {
                forceY: [0]
            },
            bars2: {
                forceY: [0]
            },
            color: ['#3f51b5', 'red'],
            x: function(d, i) {
                return i
            },
            xAxis: {
                axisLabel: 'Dates',
                tickFormat: function(d) {
                    var dx = $scope.data[0].values[d] && $scope.data[0].values[d].x || 0;
                    if (dx > 0) {
                        return d3.time.format('%b %d %X')(new Date(dx))
                    }
                    return null;
                }
            },
            x2Axis: {
                tickFormat: function(d) {
                    var dx = $scope.data[0].values[d] && $scope.data[0].values[d].x || 0;
                    return d3.time.format('%b %d %H:%M')(new Date(dx))
                },
                showMaxMin: true
            },
            y1Axis: {
                axisLabel: 'Fuel Percent',
                axisLabelDistance: 12
            },
            y2Axis: {
                axisLabel: $scope.volume                
            },
            useInteractiveGuideline: true,
            interactive: true,
            tooltip: {
              contentGenerator: 
              function(d) {
                    if (d.series[0].color === 'red' ){
                        if ($scope.volume === 'Liter') {
                            return '<table><thead><tr><th></th></tr></thead><tbody><tr><th>Liter ' + JSON.stringify(d.series[0].value) + '</th></tr></tbody></table>';                     
                       }
                       else{
                            return '<table><thead><tr><th></th></tr></thead><tbody><tr><th>Gallons ' + JSON.stringify(d.series[0].value) + '</th></tr></tbody></table>';                     
                        }
                    }
                    else{
                        return '<table><thead><tr><th>' + d3.time.format('%b %d %X')(new Date(d.data.x)) +'</th></tr></thead><tbody><tr><th>Fuel Percent ' + JSON.stringify(d.series[0].value) + '%</th></tr></tbody></table>';
                    }  
              }
            }
        }        
    }

    $scope.viewGraphReportECU = function(id) {
        $scope.ecutrips = [];
        $scope.percentGraph = [];
        $scope.literGraph = [];
        $scope.value = 0;
        $scope.start_lat_lon = [];
        $scope.end_lat_lon = [];
        self.count = 0;
        self.hide = false;
        $scope.selectedTime = $scope.frequencys[0].value;
        $scope.rep = 0;
        $scope.fuel_consumed = 0;
        var consumed = 0;

        if (id == null) {
            $scope.alert = 'You must specify a vehicle.';
            $scope.showAlert();
        }
        if (Math.round(Math.abs($scope.dates.end.getTime() - $scope.dates.begin.getTime()) / (1000 * 60 * 60 * 24)) > 31) {
            $scope.alert = 'The report cannot be more than 31 days.';
            $scope.showAlert();
            $scope.dates.begin = new Date();
            $scope.dates.end = new Date();
        }
        if ($scope.dates.begin > $scope.dates.end) {
            $scope.alert = 'The start date must be less than the end date.';
            $scope.showAlert();
            $scope.dates.end = new Date();
        } 
        if ($scope.sizeLiter.liter == null || $scope.sizeLiter.liter == 0) {
            $scope.alert = 'You must specify tank size.';
            $scope.showAlert();
        }else {
            var from = $scope.dates.begin.getFullYear() + '-' + ($scope.dates.begin.getMonth() + 1) + '-' + $scope.dates.begin.getDate();
            var to = $scope.dates.end.getFullYear() + '-' + ($scope.dates.end.getMonth() + 1) + '-' + ($scope.dates.end.getDate());

            for (var i = 0; i < $scope.frequencys.length; i++) {
                if ($scope.frequencys[i].frec == $scope.frequencys.frec) {
                    $scope.selectedTime = $scope.frequencys[i].value;
                    break;
                }
            }

        $http.get(server + "rawdata?vehicles=" + id + "&fields=io_ign,fuel_level_percentage:@ecu_fuel_level_real/10,ecu_fuel_level_real_flag&from=" + from + "T00:00:00&to=" + to + "T23:59:59&volume=user&filter=(io_ign%20%3E%200%20and%20ecu_fuel_level_real_flag%20==%20%22T%22%20and%20fuel_level_percentage%20%3E%200 and fuel_level_percentage<100)")
            .success(function(data) {
                    $scope.reportECU = data.events;
                    var aux2 = data.units.volume;
                    $scope.volume = aux2.charAt(0).toUpperCase() + aux2.slice(1);
                    $scope.distance = data.units.distance; 
                    

                    if ($scope.selectedTime != 0) {
                        var aux = new Date($scope.reportECU[0].event_time);
                        var aux1 = $scope.addMinutes(aux, $scope.selectedTime);
                        var sum = 0;
                        var average1 = 0;
                        var average2 = 0;
                        var incr = 0;


                        for (var i = 0; i < $scope.reportECU.length; i++) {
                            if (aux.getTime() < aux1) {
                                sum += $scope.reportECU[i].fuel_level_percentage;
                                incr += 1;
                                aux = new Date($scope.reportECU[i].event_time);
                            } else {
                                average1 = Math.floor(sum / incr);
                                var aux2 = new Date($scope.reportECU[i - incr].event_time).getTime();
                                $scope.percentGraph.push([aux2, average1]);
                                incr = 0;
                                sum = 0;
                                aux = new Date($scope.reportECU[i].event_time);
                                aux1 = $scope.addMinutes(aux, $scope.selectedTime);
                            }

                        }


                    } else {
                        for (var i = 0; i < $scope.reportECU.length; i++) {
                            if ($scope.reportECU[i].fuel_level_percentage != null) {
                                var aux2 = new Date($scope.reportECU[i].event_time);
                                var aux3 = aux2.getTime();
                                $scope.percentGraph.push([aux3, $scope.reportECU[i].fuel_level_percentage]);
                            }
                        }
                    }

                    if ($scope.sizeLiter.liter != null) {
                        for (var i = 0; i < $scope.percentGraph.length; i++) {
                            aux1 = $scope.sizeLiter.liter * $scope.percentGraph[i][1];
                            var average2 = Math.floor(aux1 / 100);
                            $scope.literGraph.push([$scope.percentGraph[i][0], average2]);
                        }
                    }

                    if ($scope.sizeLiter.liter != null) {
                        $scope.data = [{
                            "y1Axis": "1",
                            "key": "Fuel Percent",
                            "bar": true,
                            "values": $scope.percentGraph
                        }, {
                            "y2Axis": "2",
                            "key": $scope.volume,
                            "values": $scope.literGraph
                        }].map(function(series) {
                            series.values = series.values.map(function(d) {
                                return {
                                    x: d[0],
                                    y: d[1]
                                }
                            });
                            return series;
                        })
                    }
                    if (($scope.sizeLiter.liter == null) || ($scope.sizeLiter.liter == 0)) {
                        $scope.data = [{
                                "key": "Fuel Percent",
                                "yAxis": "1",
                                "type": "area",
                                "color": "#3f51b5",
                                "values": $scope.percentGraph

                            }

                        ].map(function(series) {
                            series.values = series.values.map(function(d) {
                                return {
                                    x: d[0],
                                    y: d[1]
                                }
                            });
                            return series;
                        });
                    }

                    $scope.ecuResumen(id);
                    $scope.loadReport();

                })
                .error(function(data, s, h) {
                    console.log(data, s, h)
                    console.log("-----Error-----")
                });
        }
    }

    $scope.ecuResumen = function(id) {
        var from = $scope.dates.begin.getFullYear() + '-' + ($scope.dates.begin.getMonth() + 1) + '-' + $scope.dates.begin.getDate();
        var to = $scope.dates.end.getFullYear() + '-' + ($scope.dates.end.getMonth() + 1) + '-' + ($scope.dates.end.getDate());
        var aux=[];
        var aux1=[];
        var array_aux=[];
        var liter = 0;
        $scope.fuel_consumed_trips = 0;
        var max=0;
        var min=0;
        var average = 0;
        var average1 = 0;
        var average2 = 0;
        var volume = 0;

        $http.get(server + "trips?vehicles=" + id + "&from_time=" + from + "T00:00:00&to_time=" + to + "T23:59:59&distance=user")
            .success(function(data) {
                // $scope.ecutrips = data;
                array_aux = data;

                if (array_aux.length != 0) {                    
                    var from_date = $scope.yyyymmdd() + "T00:00:00";
                    for (var i = 0; i < array_aux.length; i++) {
                        start  = array_aux[i].start_time.substring(0, 10) + "T" + array_aux[i].start_time.substring(11, 19);
                        if((array_aux[i].duration > 60) && (start > from_date)){
                            $scope.ecutrips.push(array_aux[i]);
                        }                    
                    }

                    for (var i = 0; i < $scope.ecutrips.length; i++) {
                        $scope.ecutrips[i].start_time = $scope.ecutrips[i].start_time.substring(0, 10) + "T" + $scope.ecutrips[i].start_time.substring(11, 19);
                        if ($scope.ecutrips[i].end_time != null) {
                            $scope.ecutrips[i].end_time = $scope.ecutrips[i].end_time.substring(0, 10) + "T" + $scope.ecutrips[i].end_time.substring(11, 19)
                        }

                        $scope.ecutrips[i]["duration_trip"] = $scope.convertSec_time($scope.ecutrips[i].duration);
                        $scope.ecutrips[i]["ign_trip"] = $scope.convertSec_time($scope.ecutrips[i].dev_ign);
                        $scope.ecutrips[i]["idle_trip"] = $scope.convertSec_time($scope.ecutrips[i].idle);
                        
                       }

                       for (var i = 0; i < $scope.ecutrips.length; i++){
                           $scope.fuel_consumed_trips = 0 
                           aux=[];  
                            if($scope.ecutrips[i].ignition > 600){
                                for (var j = 0; j < $scope.reportECU.length; j++){
                                    if (($scope.ecutrips[i].start_time <= $scope.reportECU[j].event_time) && ($scope.ecutrips[i].end_time >= $scope.reportECU[j].event_time)){                                                                          
                                        aux.push($scope.reportECU[j].fuel_level_percentage);
                                        liter_level = aux[0];
                                        aux1 = [aux[0]]                                  
                                    }

                                }

                                if (aux.length <= 5) {
                                    $scope.ecutrips[i]["fuel_consumed"] = "---";
                                } 
                                

                                if (aux.length > 5) {
                                    for (var x = 1; x < aux.length; x++) {
                                        liter = Math.abs(liter_level - aux[x]);

                                        if (liter < 10) {
                                            aux1.push(aux[x]);
                                            liter_level = aux[x];
                                        }
                                        else{
                                            if (aux1.length > 1) {
                                                average = Math.floor((aux1.length * 10) / 100);
                                                cont1 = 0;
                                                cont2 = aux1.length-1;
                                                if (average > 0) {  
                                                    while(average > cont1){
                                                        average1 = average1  + aux1[cont1];
                                                        average2 = average2  + aux1[cont2];
                                                        cont1+=1;
                                                        cont2-=1
                                                    }
                                                    max = average1 / average;
                                                    min = average2 / average;                                                    
                                                }
                                                else{
                                                    max = aux1[0];
                                                    min = aux1[aux1.length-1];
                                                }                                      

                                                volume = (Math.abs(max-min) * $scope.sizeLiter.liter) / 100;
                                                $scope.fuel_consumed_trips = $scope.fuel_consumed_trips + volume; 
                                                liter_level = aux[x];                                                                                        
                                                aux1=[]; 
                                                average= average1 = average2 = 0; 
                                                max = min = 0;                                              
                                            }
                                            else{
                                                liter_level = aux[x];
                                                aux1=[];
                                            }
                                        }
                                    }

                                    if (aux1.length > 1) {
                                        average = Math.floor((aux1.length * 10) / 100);
                                        cont1 = 0;
                                        cont2 = aux1.length-1;
                                        if (average > 0) {  
                                            while(average > cont1){
                                                average1 = average1  + aux1[cont1];
                                                average2 = average2  + aux1[cont2];
                                                cont1+=1;
                                                cont2-=1
                                            }
                                        }

                                        else{
                                            average = 1;
                                            average1 = aux1[0];
                                            average2 = aux1[aux1.length-1];
                                        }

                                        max = average1 / average;
                                        min = average2 / average;                                       

                                    } 


                                    volume = (Math.abs(max-min) * $scope.sizeLiter.liter) / 100;
                                    $scope.ecutrips[i]["fuel_consumed"] = $scope.fuel_consumed_trips + volume;  
                                    average= average1 = average2 = 0;                                                                         
                                    aux1=[];
                                    
                                }  
                            }
                        
                            else{
                                $scope.ecutrips[i]["fuel_consumed"] = "---";
                            } 
                       
                        }



                    $scope.ecutable = true;

                    if ($scope.ecutrips.length < 200) {
                        $scope.rep = 1
                    }
                    if ((200 < $scope.ecutrips.length) && ($scope.ecutrips.length < 300) ) {
                        $scope.rep = 2
                    }
                    if (300 < $scope.ecutrips.length) {
                        $scope.rep = 4
                    }

                    $scope.consultECU();
                }
                else{
                    $scope.noTrips = 'The trips are not enabled for this vehicle.';
                    $scope.ecutable = false;
                }

            })
            .error(function(data, s, h) {
                console.log(data, s, h)
                console.log("-----Error-----")
            });
    }

    $scope.consultECU = function() {
        var label1 = "start_location_ecu"
        var label2 = "end_location_ecu"
        if (($scope.ecutrips.length - $scope.value) > 50) {
            var aux1 = $scope.value + 50;
            for (var aux = $scope.value; aux < aux1; aux++) {
                $scope.start_lat_lon.push({
                    "key": $scope.ecutrips[aux].id,
                    "lat": $scope.ecutrips[aux].start_lat,
                    "lon": $scope.ecutrips[aux].start_lon
                });
                $scope.end_lat_lon.push({
                    "key": $scope.ecutrips[aux].id,
                    "lat": $scope.ecutrips[aux].end_lat,
                    "lon": $scope.ecutrips[aux].end_lon
                });
            }

            $scope.location($scope.start_lat_lon, aux, label1);
            $scope.location($scope.end_lat_lon, aux, label2);
            $scope.start_lat_lon = [];
            $scope.end_lat_lon = [];
            $scope.value += 50;
            $scope.consultECU();
        } else {

            aux = $scope.ecutrips.length - $scope.value;
            for (var i = $scope.value; i < $scope.ecutrips.length; i++) {
                $scope.start_lat_lon.push({
                    "key": $scope.ecutrips[i].id,
                    "lat": $scope.ecutrips[i].start_lat,
                    "lon": $scope.ecutrips[i].start_lon
                });
                $scope.end_lat_lon.push({
                    "key": $scope.ecutrips[i].id,
                    "lat": $scope.ecutrips[i].start_lat,
                    "lon": $scope.ecutrips[i].start_lon
                });
            }

            $scope.location($scope.start_lat_lon, aux, label1);
            $scope.location($scope.end_lat_lon, aux, label2);
        }
    }

    // $scope.size_tank = function(id){
    //     // self.size_tank = true;
    //     for (var i = 0; i < $scope.vehicles.length; i++) {
    //         if ($scope.vehicles[i].id == id) {
    //             $scope.sizeLiter.liter = $scope.vehicles[i].info.sizetank;
    //             if ($scope.sizeLiter.liter == undefined || $scope.sizeLiter.liter == null) {
    //                 $scope.sizeLiter.liter = 700;
    //                 // self.size_tank = false;
    //             }
    //         }
    //     }

    //     return $scope.sizeLiter.liter; 
    // }

    $scope.yyyymmdd = function() {         
                                    
            var yyyy = $scope.dates.begin.getFullYear().toString();                                    
            var mm = ($scope.dates.begin.getMonth()+1).toString(); // getMonth() is zero-based         
            var dd  = $scope.dates.begin.getDate().toString();             
                                
            return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
       }; 

    $scope.viewGraphReportTech = function(id) {
        $scope.reportTech = [];
        $scope.percentGraph = [];
        $scope.literGraph = [];
        $scope.value = 0;
        $scope.start_lat_lon = [];
        $scope.end_lat_lon = [];
        self.count = 0;
        self.hide = false;
        $scope.rep = 0;
        $scope.techtrips=[];
        $scope.selectedTime = $scope.frequencys[0].value;
        var liter=0;
        var liter_level=[];
        $scope.fuel_consumed = 0;
        var aux = [];
        // $scope.tank = $scope.size_tank(id);
        // // if ($scope.tank == undefined) {
        // //     $scope.sizeLiter.liter = 0;
        // // }

        if (id == null) {
            $scope.alert = 'You must specify a vehicle.';
            $scope.showAlert();
        }

        if (Math.round(Math.abs($scope.dates.end.getTime() - $scope.dates.begin.getTime()) / (1000 * 60 * 60 * 24)) > 31) {
            $scope.alert = 'The report cannot be more than 31 days.';
            $scope.showAlert();
            $scope.dates.begin = new Date();
            $scope.dates.end = new Date();
        }
        if ($scope.dates.begin > $scope.dates.end) {
            $scope.alert = 'The start date must be less than the end date.';
            $scope.showAlert();
            $scope.dates.end = new Date();
        }

        if ($scope.sizeLiter.liter == null || $scope.sizeLiter.liter == 0) {
            $scope.alert = 'You must specify tank size.';
            $scope.showAlert();
        } else {
            $scope.flag_report = false;

            for (var i = 0; i < $scope.frequencys.length; i++) {
                if ($scope.frequencys[i].frec == $scope.frequencys.frec) {
                    $scope.selectedTime = $scope.frequencys[i].value;
                    break;
                }
            }

            var from = $scope.dates.begin.getFullYear() + '-' + ($scope.dates.begin.getMonth() + 1) + '-' + $scope.dates.begin.getDate();
            var to = $scope.dates.end.getFullYear() + '-' + ($scope.dates.end.getMonth() + 1) + '-' + ($scope.dates.end.getDate());

            $http.get(server + "rawdata?vehicles=" + id + "&fields=fuel_level:@tec_fn/10,tec_st,io_ign&from=" + from + "T00:00:00&to=" + to + "T23:59:59&volume=user&distance=user&filter=(io_ign>0%20and%20tec_st>0)")

            .success(function(data) {
                    $scope.reportTech = data.events;
                    $scope.volume = 'Liter'
                    $scope.dist = data.units.distance;

                    if ($scope.selectedTime != 0) {
                        var aux = new Date($scope.reportTech[0].event_time);
                        var aux1 = $scope.addMinutes(aux, $scope.selectedTime);
                        var sum = 0;
                        var average1 = 0;
                        var average2 = 0;
                        var incr = 0;

                        for (var i = 1; i < $scope.reportTech.length; i++) { 
                            if (aux.getTime() <= aux1) {
                                sum += $scope.reportTech[i-1].fuel_level;
                                incr += 1;  
                                aux = new Date($scope.reportTech[i].event_time);                              
                            }
                            else {
                                average1 = Math.floor(sum / incr);
                                var aux2 = new Date($scope.reportTech[(i - incr) - 1].event_time).getTime();
                                var fuel_percent =Math.floor((average1 * 100) / $scope.sizeLiter.liter);
                                $scope.percentGraph.push([aux2, fuel_percent]);
                                $scope.literGraph.push([aux2, average1]);
                                
                                incr = 0;
                                sum = 0;
                                aux = new Date($scope.reportTech[i-1].event_time);
                                aux1 = $scope.addMinutes(aux, $scope.selectedTime);
                            }

                        }  
                    } else {
                        for (var i = 0; i < $scope.reportTech.length; i++) {
                            if ($scope.reportTech[i].fuel_level != null) {
                                var aux2 = new Date($scope.reportTech[i].event_time).getTime(); 
                                var fuel_percent =Math.floor(($scope.reportTech[i].fuel_level * 100) / $scope.sizeLiter.liter);                               
                                $scope.percentGraph.push([aux2, fuel_percent]);
                                $scope.literGraph.push([aux2, $scope.reportTech[i].fuel_level]);
                            }
                        }
                    }
                    
                    $scope.data = [{
                        "y1Axis": "1",
                        "key": "Fuel Percent",
                        "bar": true,
                        "values": $scope.percentGraph
                    }, {
                        "y2Axis": "2",
                        "key": $scope.volume,
                        "values": $scope.literGraph
                    }].map(function(series) {
                        series.values = series.values.map(function(d) {
                            return {
                                x: d[0],
                                y: d[1]
                            }
                        });
                        return series;
                    });
                    
                })
                .error(function(data, s, h) {
                    console.log(data, s, h)
                    console.log("-----Error-----")
                })

            $scope.techResumen(id);
            $scope.loadReport();
        }
    }

    $scope.techResumen = function(id) {
        var from = $scope.dates.begin.getFullYear() + '-' + ($scope.dates.begin.getMonth() + 1) + '-' + $scope.dates.begin.getDate();
        var to = $scope.dates.end.getFullYear() + '-' + ($scope.dates.end.getMonth() + 1) + '-' + $scope.dates.end.getDate();
        var aux=[];
        var aux1=[];
        var array_aux=[];
        var liter = 0;
        $scope.fuel_consumed_trips = 0;
        var max=0;
        var min=0;
        var average = 0;
        var average1 = 0;
        var average2 = 0;

        $http.get(server + "trips?vehicles=" + id + "&from_time=" + from + "T00:00:00&to_time=" + to + "T23:59:59&distance=user")
            .success(function(data) {
                array_aux = data;

                if (array_aux.length != 0) {
                    var from_date = $scope.yyyymmdd() + "T00:00:00";
                    for (var i = 0; i < array_aux.length; i++) {
                        start  = array_aux[i].start_time.substring(0, 10) + "T" + array_aux[i].start_time.substring(11, 19);
                        if((array_aux[i].duration > 60) && (start > from_date)){
                            $scope.techtrips.push(array_aux[i])
                        }                    
                    }

                    for (var i = 0; i < $scope.techtrips.length; i++) {
                        $scope.techtrips[i].start_time = $scope.techtrips[i].start_time.substring(0, 10) + "T" + $scope.techtrips[i].start_time.substring(11, 19);
                        if ($scope.techtrips[i].end_time != null) {
                            $scope.techtrips[i].end_time = $scope.techtrips[i].end_time.substring(0, 10) + "T" + $scope.techtrips[i].end_time.substring(11, 19)
                        }

                        $scope.techtrips[i]["duration_trip"] = $scope.convertSec_time($scope.techtrips[i].duration);
                        $scope.techtrips[i]["ign_trip"] = $scope.convertSec_time($scope.techtrips[i].dev_ign);
                        $scope.techtrips[i]["idle_trip"] = $scope.convertSec_time($scope.techtrips[i].idle);
                        
                       } 
                       for (var i = 0; i < $scope.techtrips.length; i++){
                           $scope.fuel_consumed_trips = 0 
                           aux=[];                      

                            if($scope.techtrips[i].ignition > 600){
                                for (var j = 0; j < $scope.reportTech.length; j++){
                                    if (($scope.techtrips[i].start_time <= $scope.reportTech[j].event_time) && ($scope.techtrips[i].end_time >= $scope.reportTech[j].event_time)){                                                                          
                                        aux.push($scope.reportTech[j].fuel_level);
                                        liter_level = aux[0];
                                        aux1 = [aux[0]]                                  
                                    }

                                }

                                if (aux.length <= 5) {
                                    $scope.techtrips[i]["fuel_consumed"] = "---";
                                } 
                                

                                if (aux.length > 5) {
                                    for (var x = 1; x < aux.length; x++) {
                                        liter = (Math.abs(liter_level - aux[x]) * 100) / $scope.sizeLiter.liter;

                                        if (liter < 10) {
                                            aux1.push(aux[x]);
                                            liter_level = aux[x];
                                        }
                                        else{
                                            if (aux1.length > 1) {
                                                average = Math.floor((aux1.length * 10) / 100);
                                                cont1 = 0;
                                                cont2 = aux1.length-1;
                                                if (average > 0) {  
                                                    while(average > cont1){
                                                        average1 = average1  + aux1[cont1];
                                                        average2 = average2  + aux1[cont2];
                                                        cont1+=1;
                                                        cont2-=1
                                                    }
                                                    max = average1 / average;
                                                    min = average2 / average;                                                    
                                                }
                                                else{
                                                    max = aux1[0];
                                                    min = aux1[aux1.length-1];
                                                }                                      

                                                $scope.fuel_consumed_trips = $scope.fuel_consumed_trips + Math.abs(max-min);  
                                                liter_level = aux[x];                                                                                        
                                                aux1=[]; 
                                                average= average1 = average2 = 0; 
                                                max = min = 0;                                              
                                            }
                                            else{
                                                liter_level = aux[x];
                                                aux1=[];
                                            }
                                        }
                                    }

                                    if (aux1.length > 1) {
                                        average = Math.floor((aux1.length * 10) / 100);
                                        cont1 = 0;
                                        cont2 = aux1.length-1;
                                        if (average > 0) {  
                                            while(average > cont1){
                                                average1 = average1  + aux1[cont1];
                                                average2 = average2  + aux1[cont2];
                                                cont1+=1;
                                                cont2-=1
                                            }
                                        }

                                        else{
                                            average = 1;
                                            average1 = aux1[0];
                                            average2 = aux1[aux1.length-1];
                                        }

                                        max = average1 / average;
                                        min = average2 / average;
                                        $scope.techtrips[i]["fuel_consumed"] = $scope.fuel_consumed_trips + Math.abs(max-min);  
                                        average= average1 = average2 = 0;                                                                         
                                        aux1=[];
                                        
                                    } 
                                }  
                            }
                        
                            else{
                                $scope.techtrips[i]["fuel_consumed"] = "---";
                            } 
 
                        }


                       if ($scope.techtrips.length != 0){
                           $scope.techtable = true;
                       }else{
                           $scope.techtable = false;
                       }

                       $scope.techtable = true;

                       if ($scope.techtrips.length < 100) {
                           $scope.rep = 1
                           }
                       if ( (100 < $scope.techtrips.length) && ($scope.techtrips.length < 300)){
                           $scope.rep = 2
                           }
                       if ((300 < $scope.techtrips.length) && ($scope.techtrips.length < 500)) {
                           $scope.rep = 4
                           }
                       if (500 < $scope.techtrips.length) {
                           $scope.rep = 6
                           }

                       $scope.consulTech();               
                    }
                else{
                   $scope.noTrips = 'The trips are not enabled for this vehicle.';
                   $scope.techtable = false;
                }
            })
            .error(function(data, s, h) {
                console.log(data, s, h)
                console.log("-----Error-----")
            });
    }

    $scope.consulTech = function() {
        var label1 = "start_location_tech"
        var label2 = "end_location_tech"
        if (($scope.techtrips.length - $scope.value) > 50) {
            var aux1 = $scope.value + 50;
            for (var aux = $scope.value; aux < aux1; aux++) {
                $scope.start_lat_lon.push({
                    "key": $scope.techtrips[aux].id,
                    "lat": $scope.techtrips[aux].start_lat,
                    "lon": $scope.techtrips[aux].start_lon
                });
                $scope.end_lat_lon.push({
                    "key": $scope.techtrips[aux].id,
                    "lat": $scope.techtrips[aux].end_lat,
                    "lon": $scope.techtrips[aux].end_lon
                });
            }

            $scope.location($scope.start_lat_lon, aux, label1);
            $scope.location($scope.end_lat_lon, aux, label2);
            $scope.start_lat_lon = [];
            $scope.end_lat_lon = [];
            $scope.value += 50;
            $scope.consulTech();
        } else {

            aux = $scope.techtrips.length - $scope.value;
            for (var i = $scope.value; i < $scope.techtrips.length; i++) {
                $scope.start_lat_lon.push({
                    "key": $scope.techtrips[i].id,
                    "lat": $scope.techtrips[i].start_lat,
                    "lon": $scope.techtrips[i].start_lon
                });
                $scope.end_lat_lon.push({
                    "key": $scope.techtrips[i].id,
                    "lat": $scope.techtrips[i].start_lat,
                    "lon": $scope.techtrips[i].start_lon
                });
            }

            $scope.location($scope.start_lat_lon, aux, label1);
            $scope.location($scope.end_lat_lon, aux, label2);
        }
    }

    $scope.viewWorkDayReport = function(vehicles) {

        if (vehicles == null) {
            $scope.alert = 'You must specify a group.';
            $scope.showAlert();
        } else {
            if ($scope.dates.begin > $scope.dates.begin) {
                $scope.alert = 'The start date must be less than the end date.';
                $scope.showAlert();
                $scope.dates.end = new Date();
            }
            if (Math.round(Math.abs($scope.dates.end.getTime() - $scope.dates.begin.getTime()) / (1000 * 60 * 60 * 24)) > 31) {
                $scope.alert = 'The report cannot be more than 31 days.';
                $scope.showAlert();
                $scope.dates.begin = new Date();
                $scope.dates.end = new Date();
            } else {

                $scope.arrayWorkDay = [];
                var vehicleData = [];


                var from = $scope.dates.begin.getFullYear() + '-' + ($scope.dates.begin.getMonth() + 1) + '-' + $scope.dates.begin.getDate();
                var to = $scope.dates.end.getFullYear() + '-' + ($scope.dates.end.getMonth() + 1) + '-' + $scope.dates.end.getDate();

                $http.get(server + 'rawdata?vehicles=' + vehicles + "&fields=dev_dist,dev_ign,ecu_total_fuel:@ecu_tfuel,rendimiento:@dev_dist/@ecu_tfuel&from=" + from + "T00:00:00&to=" + to + "T23:59:59&freq=8H&how=dev_dist:diff,dev_ign:diff,ecu_total_fuel:diff,rendimiento:mean&resample=event_time&group_by=vid&distance=user&volume=user&time=second")
                    .success(function(data) {
                        $scope.workXday = data.events;
                        $scope.units = data.units;

                        for (var i = 0; i < $scope.vehicles.length; i++) {
                            for (var j = 0; j < vehicles.length; j++) {
                                if ($scope.vehicles[i].id == vehicles[j]) {
                                    vehicleData.push({
                                        id: $scope.vehicles[i].id,
                                        name: $scope.vehicles[i].name
                                    });
                                }
                            }
                        }

                        for (var i = 0; i < $scope.workXday.length; i += 3) {
                            for (var j = 0; j < $scope.workXday.length; j++) {
                                if ($scope.workXday[i].vid == vehicleData[j].id) {
                                    var name = vehicleData[j].name;
                                    break;

                                }

                            }
                            var shift1 = {
                                name: name,
                                distance: $scope.workXday[i].dev_dist,
                                date: $scope.workXday[i].event_time,
                                fuel: $scope.workXday[i].ecu_total_fuel,
                                performance: $scope.workXday[i].dev_dist / $scope.workXday[i].ecu_total_fuel,
                                hours: $scope.convertSec_time($scope.workXday[i].dev_ign)
                            }

                            var shift2 = {
                                name: name,
                                distance: $scope.workXday[i + 1].dev_dist,
                                date: $scope.workXday[i + 1].event_time,
                                fuel: $scope.workXday[i + 1].ecu_total_fuel,
                                performance: $scope.workXday[i + 1].dev_dist / $scope.workXday[i + 1].ecu_total_fuel,
                                hours: $scope.convertSec_time($scope.workXday[i + 1].dev_ign)
                            }

                            var shift3 = {
                                name: name,
                                distance: $scope.workXday[i + 2].dev_dist,
                                date: $scope.workXday[i + 2].event_time,
                                fuel: $scope.workXday[i + 2].ecu_total_fuel,
                                performance: $scope.workXday[i + 2].dev_dist / $scope.workXday[i + 2].ecu_total_fuel,
                                hours: $scope.convertSec_time($scope.workXday[i + 2].dev_ign)
                            }


                            $scope.arrayWorkDay.push([shift1, shift2, shift3]);

                        }


                    })
                    .error(function(data, s, h) {
                        console.log(data, s, h)
                        console.log("-----Error-----")
                    });



                $scope.loadReport();
            }
        }
    }

    $scope.convertSec_time = function(sec) {

        var hours = Math.floor(sec / 3600);
        var minutes = Math.floor((sec % 3600) / 60);
        var seconds = sec % 60;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds;
    }

    $scope.addMinutes = function(date, minutes) {
        return date.getTime() + minutes * 60000;
    }

    // $scope.convertTemp = function(mV) {
    //     return -2.0368055E-35 * Math.pow(mV,11) + 6.2029607E-31 * Math.pow(mV,10) + -8.2710455E-27 * Math.pow(mV,9) + 6.3466737E-23 * Math.pow(mV,8) + -3.0989103E-19 * Math.pow(mV,7) + 1.0055822E-15 * Math.pow(mV,6) + -2.2005923E-12 * Math.pow(mV,5) + 3.2320968E-09 * Math.pow(mV,4) + -3.1180082E-06 * Math.pow(mV,3) + 0.0019020671 * Math.pow(mV,2) + -0.70336715*mV + 141.46249
    // }



    var self = this;
    self.simulateQuery = false;
    self.isDisabled = true;
    self.querySearch = $scope.querySearch;
    self.selectedItemChange = $scope.selectedItemChange;
    self.selectedItemChange1 = $scope.selectedItemChange1;
    self.searchTextChange = $scope.searchTextChange;
    self.clear = function(){
      self.searchText = undefined;
      self.selectedItem = undefined;
      self.searchText1 = undefined;
      self.selectedItem1 = undefined;
    };

    self.isOpen = false;
    self.mode = 'query';
    self.activated = true;
    self.determinateValue = 10;
    self.modes = [];

    $interval(function() {
        self.determinateValue += 1;
        if ((self.determinateValue > 100) && (self.count < $scope.rep)) {
            self.determinateValue = 50;
            self.count += 1;
        };
        if ((self.determinateValue == 100) && (self.count == $scope.rep)) self.hide = true;
    }, 100, 0, true);

    $interval(function() {
        self.mode = (self.mode == 'query' ? 'determinate' : 'query');
    }, 7200, 0, true);

});

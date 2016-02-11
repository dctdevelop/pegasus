var serv = document.referrer;
if (serv == "") {
    var serverAux = document.URL;
    var serverArr = serverAux.split('/')

    if (serverArr[2] == "localhost:8080") {
        var server = 'https://pegasus1.pegasusgateway.com/api/';
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
    $scope.previousButton = false;

    $scope.flag_search = false;
    $scope.flag_report = false;
    $scope.flag_bar = false;
    $scope.techtable = false;
    $scope.isShownMileage = false;
    $scope.isShownSatcom = false;
    $scope.isShownGeo = false;
    $scope.isShownGraphECU = false;
    $scope.isShownGraphTech = false;
    $scope.isShownWorkDay = false;

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
    $scope.loading = false;
    $scope.alert = "";
    $scope.groupName;
    $scope.vehiclesReport = [];
    $scope.labelDesc = "";
    $scope.reportName = "";
    $scope.myValue = false;
    $scope.sizeLiter = {
        liter: null
    };
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    $scope.descriptions = [{
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

    var self = this;
    self.tech = [{
        'id': 1,
        'fulltype': 'Liter'
    }, {
        'id': 2,
        'fulltype': 'Percent'
    }];

    var last = {
        // bottom: false,
        top: true,
        left: true,
        // right: false
    };

    self.selectedIndex = 1;
    self.selectedtype = function() {
        return self.tech[self.selectedIndex].fulltype;
    }

    $scope.login = function() {
        $http.post(server + 'login', $scope.auth)
            .success(function(data) {
                $scope.message = data.message
                $scope.auth.token = data.auth
                if ($scope.auth.save) {
                    $localStorage.auth = auth
                }

                $http.defaults.headers.common.Authenticate = data.auth;

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

            })
            .error(function(data, s, h) {
                $scope.alert = 'Wrong username or password , please rectify.';
                $scope.showAlert();
            });

        var timeoutId = setTimeout(function() {
            $scope.showSimpleToast1();
        }, 7200);
    }

    $scope.toastPosition = angular.extend({}, last);
    $scope.getToastPosition = function() {
        sanitizePosition();
        return Object.keys($scope.toastPosition)
            .filter(function(pos) {
                return $scope.toastPosition[pos];
            })
            .join(' ');
    }

    function sanitizePosition() {
        var current = $scope.toastPosition;
        if (current.bottom && last.top) current.top = false;
        if (current.top && last.bottom) current.bottom = false;
        if (current.right && last.left) current.left = false;
        if (current.left && last.right) current.right = false;
        last = angular.extend({}, current);
    }

    $scope.showSimpleToast = function() {
        $mdToast.show(
            $mdToast.simple()
            .textContent('Loading your sites data, please hold... ')
            .position($scope.getToastPosition())
            .hideDelay(7200)
        );
    }

    $scope.showSimpleToast1 = function() {
        $mdToast.show(
            $mdToast.simple()
            .textContent('All done, Happy reporting... ')
            .position($scope.getToastPosition())
            .hideDelay(600)
        );
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
                $scope.loading = false;

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
                $scope.previousButton = false;
                self.clear();


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
                $scope.loading = true;
                $scope.currentDate = new Date();
                $scope.odoMeter = [];
                $scope.reportName = "Mileage";

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
                // rotateLabels: 50
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
                $scope.loading = true;
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

                        for (var i = 0; i < $scope.vehiclesReport.length; i++) {
                            aux1 += $scope.vehiclesReport[i].delay;
                        }

                        aux1 = aux1 / $scope.vehiclesReport.length;
                        $scope.average_delay = $scope.convertSec_time(Math.round(aux1));


                        if ($scope.vehiclesReport.length < 200) {
                            $scope.rep = 1
                        }
                        if (200 < $scope.vehiclesReport.length < 00) {
                            $scope.rep = 2
                        }
                        if (400 < $scope.vehiclesReport.length < 600) {
                            $scope.rep = 3
                        } else {
                            $scope.rep = 4
                        }


                        $scope.consultSatcom();

                        for (var i = 0; i < $scope.descriptions.length; i++) {
                            graphSatcom.push({
                                "label": $scope.descriptions[i].description,
                                "value": $scope.descriptions[i].quantity
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
        for (var i = 0; i < $scope.vehiclesReport.length; i++) {
            for (var j = 0; j < $scope.descriptions.length; j++) {
                if ($scope.vehiclesReport[i].label == $scope.descriptions[j].name) {
                    $scope.vehiclesReport[i]["labelDesc"] = $scope.descriptions[j].description;
                }
            }
        }

        for (var i = 0; i < $scope.vehiclesReport.length; i++) {
            $scope.vehiclesReport[i]["my_delay"] = $scope.convertSec_time(Math.round($scope.vehiclesReport[i].delay));
            $scope.vehiclesReport[i]["address"] = "https://www.google.com/maps/place//@" + $scope.vehiclesReport[i].lat + "," + $scope.vehiclesReport[i].lon + ",15z";
            // $scope.location($scope.vehiclesReport[i].lat,$scope.vehiclesReport[i].lon);
        }
    }

    $scope.consultSatcom = function() {
        var label = "label_satcom";

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
            $scope.consultSatcom();
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

            if (label == "label_satcom") {
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

    $scope.loadGeo = function(page) {
        if (page == null) {
            page = 1
        }
        $http.get(server + 'geofences?select=properties&page=' + page, $scope.auth.token)
            .success(function(data) {
                $scope.geofences = $scope.geofences.concat(data.data)
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
                $scope.geofences_types = $scope.geofences_types.concat(data.data)
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
        $scope.previousButton = true;
        $scope.loading = true;
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
        $scope.loading = false;
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
                $scope.groups = $scope.groups.concat(data.data)
                if (page < data.pages) {
                    $scope.loadGroups(page + 1)
                }
                //console.log($scope.groups);

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

    $scope.querySearch1 = function(query) {
        var results = query ? $scope.groups.filter($scope.createFilterFor1(query)) : $scope.groups,
            deferred;
        console.log('results of scope.groups' + $scope.groups);
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

    $scope.selectedItemChange = function(item) {
        $scope.flag_report = false;
        $scope.vehiclesSelect = item;
        $log.info('Item changed to ' + JSON.stringify(item));
    }

    $scope.selectedItemChange1 = function(item) {
        $scope.flag_report = false;
        $scope.groupsSelect = item;
        $log.info('Item changed to ' + JSON.stringify(item));
    }

    $scope.createFilterFor = function(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(item) {
            return (item.value.indexOf(lowercaseQuery) === 0);
        };
    }

    $scope.createFilterFor1 = function(query) {
        var lowercaseQuery1 = angular.lowercase(query);
        return function filterFn1(item) {
            return (item.value.indexOf(lowercaseQuery1) === 0);
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
    }

    $scope.viewDescriptionGeo = function() {
        $scope.isShownGeo = !$scope.isShownGeo;
        $scope.isShownMileage = false;
        $scope.isShownSatcom = false;
        $scope.isShownGraphECU = false;
        $scope.isShownGraphTech = false;
        $scope.isShownWorkDay = false;
    }

    $scope.viewDescriptionSatcom = function() {
        $scope.isShownSatcom = !$scope.isShownSatcom;
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
    }

    $scope.viewGraphTech = function() {
        $scope.isShownGraphTech = !$scope.isShownGraphTech;
        $scope.isShownGraphECU = false;
        $scope.isShownMileage = false;
        $scope.isShownGeo = false;
        $scope.isShownSatcom = false;
        $scope.isShownWorkDay = false;
    }

    $scope.viewWorkDay = function() {
        $scope.isShownWorkDay = !$scope.isShownWorkDay;
        $scope.isShownGraphTech = false;
        $scope.isShownGraphECU = false;
        $scope.isShownMileage = false;
        $scope.isShownGeo = false;
        $scope.isShownSatcom = false;
    }

    $scope.viewIcons = function() {
        $scope.picture = false;
        $scope.reports = true;
        $scope.previousButton = true;
    }

    $scope.principalPage = function() {
        $location.path('/');
        $scope.picture = true;
        $scope.reports = false;
        $scope.previousButton = false;
        $scope.flag_report = false;
        $scope.dates = {
            begin: new Date(),
            end: new Date()
        }
        $scope.sizeLiter = {
            liter: null
        };
        self.clear();
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

    $scope.options = {
        chart: {
            type: 'multiChart',
            height: 500,
            margin: {
                top: 30,
                right: 75,
                bottom: 50,
                left: 75
            },
            bars: {
                forceY: [0]
            },
            bars2: {
                forceY: [0]
            },
            x: function(d, i) {
                return i
            },
            xAxis: {
                axisLabel: 'Dates',
                tickFormat: function(d) {
                    var dx = $scope.data[0].values[d] && $scope.data[0].values[d].x || 0;
                    if (dx > 0) {
                        return d3.time.format('%x')(new Date(dx))
                    }
                    return null;
                },
                showMaxMin: true
                    // minRange: 60 * 1000
            },
            y1Axis: {
                axisLabel: 'Fuel Percentage (%)',
                tickFormat: function(d) {
                    return d3.format(',f')(d);
                },
                axisLabelDistance: 12
            },
            y2Axis: {
                axisLabel: $scope.volume,
                axisLabelDistance: 12
            }
        }
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
            useInteractiveGuideline: false,
            interactive: true,
            tooltip: {
              contentGenerator: 
              function(d) {
                if (($scope.sizeLiter.liter === 0) || ($scope.sizeLiter.liter === null)) {
                    return '<table><thead><tr><th></th></tr></thead><tbody><tr><th>Fuel Percent ' + JSON.stringify(d.series[0].value) + '%</th></tr></tbody></table>';                    
                }
                else{
                    if (d.series[0].color === 'red' ){
                       return '<table><thead><tr><th></th></tr></thead><tbody><tr><th>Gallons ' + JSON.stringify(d.series[0].value) + '</th></tr></tbody></table>';                     
                      
                    }
                    else{
                       return '<table><thead><tr><th>' + d3.time.format('%b %d %X')(new Date(d.data.x)) +'</th></tr></thead><tbody><tr><th>Fuel Percent ' + JSON.stringify(d.series[0].value) + '%</th></tr></tbody></table>';
                    }                   
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
        var cont1 = 0;
        $scope.rep = 0;

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
        } else {

            var from = $scope.dates.begin.getFullYear() + '-' + ($scope.dates.begin.getMonth() + 1) + '-' + $scope.dates.begin.getDate();
            var to = $scope.dates.end.getFullYear() + '-' + ($scope.dates.end.getMonth() + 1) + '-' + ($scope.dates.end.getDate());

            for (var i = 0; i < $scope.frequencys.length; i++) {
                if ($scope.frequencys[i].frec == $scope.frequencys.frec) {
                    $scope.selectedTime = $scope.frequencys[i].value;
                    break;
                }
            }

            $http.get(server + "rawdata?vehicles=" + id + "&fields=fuel_level_percentage:@ecu_fuel_level_real/10,event_hour,event_min,total_fuel_consumed:@ecu_tfuel&from=" + from + "T00:00:00&to=" + to + "T23:59:59&volume=user")

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
                                var aux2 = new Date($scope.reportECU[i - incr].event_time);
                                var aux3 = aux2.getTime();
                                $scope.percentGraph.push([aux3, average1]);
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

        $http.get(server + "trips?vehicles=" + id + "&from_time=" + from + "T00:00:00&to_time=" + to + "T23:59:59&distance=user")
            .success(function(data) {
                $scope.ecutrips = data;

                for (var i = 0; i < $scope.ecutrips.length; i++) {
                    $scope.ecutrips[i].start_time = $scope.ecutrips[i].start_time.substring(0, 10) + "T" + $scope.ecutrips[i].start_time.substring(11, 19);
                    $scope.ecutrips[i].end_time = $scope.ecutrips[i].end_time.substring(0, 10) + "T" + $scope.ecutrips[i].end_time.substring(11, 19);
                    
                   }; 

                if ($scope.ecutrips.length == 0) {
                    $scope.ecutable = false;
                } else {
                    $scope.ecutable = true;

                    if ($scope.ecutrips.length < 200) {
                        $scope.rep = 1
                    }
                    if (200 < $scope.ecutrips.length < 300) {
                        $scope.rep = 2
                    }
                    if (300 < $scope.ecutrips.length) {
                        $scope.rep = 4
                    }

                    for (var i = 0; i < $scope.ecutrips.length; i++) {
                        $scope.ecutrips[i]["duration_trip"] = $scope.convertSec_time($scope.ecutrips[i].duration);
                        $scope.ecutrips[i]["ign_trip"] = $scope.convertSec_time($scope.ecutrips[i].dev_ign);
                        $scope.ecutrips[i]["idle_trip"] = $scope.convertSec_time($scope.ecutrips[i].idle);
                    }
                }

                $scope.consultECU();

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

    $scope.viewGraphReportTech = function(id) {
        $scope.aux = [];
        $scope.percentGraph = [];
        $scope.literGraph = [];
        $scope.value = 0;
        $scope.start_lat_lon = [];
        $scope.end_lat_lon = [];
        self.count = 0;
        self.hide = false;
        $scope.rep = 0;



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

        if (self.selectedIndex == 2 && ($scope.sizeLiter.liter == null || $scope.sizeLiter.liter == 0)) {
            $scope.alert = 'You must specify tank size.';
            $scope.showAlert();
        } else {
            $scope.flag_report = false;
            $scope.loading = true;

            for (var i = 0; i < $scope.frequencys.length; i++) {
                if ($scope.frequencys[i].frec == $scope.frequencys.frec) {
                    $scope.selectedTime = $scope.frequencys[i].value;
                    break;
                }
            }

            var from = $scope.dates.begin.getFullYear() + '-' + ($scope.dates.begin.getMonth() + 1) + '-' + $scope.dates.begin.getDate();
            var to = $scope.dates.begin.getFullYear() + '-' + ($scope.dates.begin.getMonth() + 1) + '-' + ($scope.dates.begin.getDate());

            $http.get(server + "rawdata?vehicles=" + id + "&fields=fuel_level:@tec_fn,event_hour,event_min&from=" + from + "T00:00:00&to=" + to + "T23:59:59&volume=user&distance=user")

            .success(function(data) {
                    $scope.aux = data.events;
                    var aux2 = data.units.volume;
                    $scope.volume = aux2.charAt(0).toUpperCase() + aux2.slice(1);
                    $scope.dist = data.units.distance;


                    if ($scope.aux.length != 0) {
                        var cont = $scope.aux[0].event_hour;
                        var cont2 = $scope.aux[0].event_min;
                        var sum = 0;
                        var average1 = 0;
                        var average2 = 0;
                        var incr = 0;

                        for (var i = 0; i < $scope.aux.length; i++) {
                            var second = $scope.aux[i].event_time[17] + $scope.aux[i].event_time[18];
                            $scope.aux[i]["second"] = second;

                        }

                        if (($scope.selectedTime == 0) || $scope.selectedTime == null) {

                            for (var i = 0; i < $scope.aux.length; i++) {

                                $scope.percentGraph.push([$scope.aux[i].event_hour + ":" + $scope.aux[i].event_min, $scope.aux[i].fuel_level]);
                            }
                        } else {

                            for (var i = 0; i < $scope.aux.length; i++) {

                                if ($scope.aux[i].event_hour == cont) {
                                    sum += $scope.aux[i].fuel_level;
                                    incr += 1;
                                }

                                if (i < $scope.aux.length - 1) {
                                    if ($scope.aux[i].event_hour < $scope.aux[i + 1].event_hour) {
                                        average1 = Math.floor(sum / incr);
                                        $scope.percentGraph.push([$scope.aux[i].event_hour, average1]);
                                        incr = 0;
                                        cont = $scope.aux[i + 1].event_hour;
                                        sum = 0;
                                    }

                                } else {
                                    average1 = Math.floor(sum / incr);
                                    $scope.percentGraph.push([$scope.aux[i].event_hour, average1]);
                                }

                            }

                        }

                        if (self.selectedIndex == 1) {

                            $scope.literGraph = $scope.percentGraph;

                        } else {
                            for (var i = 0; i < $scope.percentGraph.length; i++) {
                                var aux1 = $scope.sizeLiter.liter * $scope.percentGraph[i][1];
                                average2 = Math.floor(aux1 / 100);
                                $scope.literGraph.push([$scope.percentGraph[i][0], average2]);
                            }

                        }

                        $scope.data = [{
                            "key": "Fuel Percent",
                            "yAxis": "1",
                            "type": "area",
                            "color": "#ffe0b2",
                            "values": $scope.percentGraph
                        }, {
                            "key": $scope.volume,
                            "yAxis": "2",
                            "type": "line",
                            "color": "red",
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
        var to = $scope.dates.end.getFullYear() + '-' + ($scope.dates.end.getMonth() + 1) + '-' + ($scope.dates.end.getDate());

        $http.get(server + "trips?vehicles=" + id + "&from_time=" + from + "T00:00:00&to_time=" + to + "T23:59:59&distance=user")
            .success(function(data) {
                $scope.techtrips = data;

                if ($scope.ecutrips.length == 0) {
                    $scope.techtable = false;
                } else {
                    $scope.techtable = true;}

                if ($scope.techtrips.length < 200) {
                    $scope.rep = 1
                }
                if (200 < $scope.techtrips.length < 400) {
                    $scope.rep = 2
                }
                if (400 < $scope.techtrips.length < 600) {
                    $scope.rep = 3
                } else {
                    $scope.rep = 4
                }

                for (var i = 0; i < $scope.techtrips.length; i++) {
                    $scope.techtrips[i].start_time = $scope.techtrips[i].start_time.substring(0, 10) + "T" + $scope.techtrips[i].start_time.substring(11, 19);
                    if ($scope.techtrips[i].end_time != null) {
                        $scope.techtrips[i].end_time = $scope.techtrips[i].end_time.substring(0, 10) + "T" + $scope.techtrips[i].end_time.substring(11, 19)
                    };
                    $scope.techtrips[i]["duration_trip"] = $scope.convertSec_time($scope.techtrips[i].duration);

                }

                $scope.consulTech();

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
    self.isDisabled = false;
    self.querySearch = $scope.querySearch;
    self.querySearch1 = $scope.querySearch1;
    self.selectedItemChange = $scope.selectedItemChange;
    self.selectedItemChange1 = $scope.selectedItemChange1;
    self.searchTextChange = $scope.searchTextChange;
    self.clear = function(){
      self.searchText = undefined;
      self.selectedItem = undefined;
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

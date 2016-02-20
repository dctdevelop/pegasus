
var app = angular.module('reports', ['ngStorage','ngMaterial','ng-mfb','ngRoute','nvd3']);
 
//Añade aquí las constantes 
 
app.config(function($routeProvider,$mdThemingProvider) {

    // $mdThemingProvider.theme('success-toast');
    
    $routeProvider   
        .when('/main', {
            url: '/',
            templateUrl: '/index.html',
            controller:'controllers/mainController'
        })

        .when('/mileage', {
            templateUrl: 'views/MileageReport.html'
        })

        .when('/geofences', {
            templateUrl: 'views/GeofencesReport.html'
        })        
        
        .when('/satcom', {
            templateUrl: 'views/SatcomReport.html'
                  
        })

        .when('/graphECU', {
            templateUrl: 'views/Fuel_Level_ECU.html'
                  
        })

        .when('/graphtech', {
            templateUrl: 'views/Fuel_Level_Tech.html'
                  
        })

        .when('/mobileye', {
            templateUrl: 'views/MobileyeReport.html'
                  
        })

        .when('/workday', {
            templateUrl: 'views/Work_Day_Report.html'
                  
        })

        .otherwise({
            redirectTo:'/'
        });
        
});



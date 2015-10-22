<?php
/*
@Author DCT developer Team.
@email pegasus.developers@digitalcomtech.com
@version 0.1
@date OCT 19 2015
::::Description:::
Snipped code in php for consume the pegasus API.
*/
require_once('lib/httpful.phar'); //include REST client library
$source = "https://pegasus1.pegasusgateway.com"; //URL your pegasus site.

/*
*  __USERNAME__ refers to your username for sign in on pegasus.
*  __PASSWORD__ refers to your password for sign in on pegasus.
*  Test credentials:
*  username: developer@digitalcomtech.com
*  password: dctdevelop
*/
$credentials = '{"username":"__USERNAME__", "password":"__PASSWORD__"}';

try {

    //sign in request.
    $response = \Httpful\Request::post($source . "/api/login")//Build post request
        ->sendsJson() // tell it we're sending (Content-Type) JSON
        ->body($credentials) // authenticate credentials
        ->addHeader('Origin', 'app-id') // SET Origin headear
        ->send(); // and finally, fire that thing off!

    $rjson = json_decode($response); // decode response.
    $token=$rjson->auth; //extract token

    //Devices request.
    $devices = \Httpful\Request::get($source . "/api/devices")
        ->sendsJson()
        ->addHeader('authenticate', $token) //set token, this is mandatory.
        ->send();
    echo $devices; //Show devices.
} catch (Exception $e) {
    printf($e);
}

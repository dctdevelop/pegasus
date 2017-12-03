<?php
/*
	Commnent or remove the following exit statement AFTER you have properly configured the CONSTANTS in the config.php file.
	The following script will modify your database, and could potentiallly overwrite tables previously created, make sure that the constant
	DB_TABLE_NAME is unique to your database.
*/
// exit();
require 'config.php';

if (PEGASUS_PROTOCOL == RPC){
	require 'rpc.php';
}

if (PEGASUS_PROTOCOL == JSON){
	require 'json.php';
}
?>

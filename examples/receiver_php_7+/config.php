<?php
ini_set('precision', 20);
define('RPC', 'RPC');
define('JSON', 'JSON');
error_reporting(E_ALL);
// ini_set('display_errors', true);
// ini_set('display_startup_errors', true);
date_default_timezone_set("America/New_York"); //Change to your desired timezone
//Enable $db_store once all configurations are set
$db_store = true;

// Database Constants, CONFIGURE THESE BEFORE ADDING THE FORWARD
define("DB_SERVER", "YOURDATABASE_SERVER");
define("DB_USER", "DATABSE_USER");
define("DB_PASS", "DATABASEP_PW");
define("DB_NAME", "DATABASE_NAME");
/*
	Make sure the table name is unique to your database. otherwise it will be overwritten during execution.
*/
define('DB_TABLE_NAME', 'UNIT_EVENTS_RPC');
/*
	Define the protocol your forwarder is configured with
	RPC or JSON
*/
define('PEGASUS_PROTOCOL', JSON);


/*
	CORE FUNCTIONALITY, MODIFY THIS CODE IF YOU KNOW WHAT YOU ARE DOING
*/
if ($db_store){
	// 1. Create a database connection
	$connection = mysqli_connect(DB_SERVER, DB_USER, DB_PASS, DB_NAME);

	// 2. Check connection status
	if (!$connection) {
		die("Database connection failed: " . mysqli_connect_error());
	}
	$query = "SELECT * FROM ".DB_TABLE_NAME." LIMIT 1";
	// Create the table if it does not exist using the following schema
	if (!mysqli_query($connection, $query))
	{
		// die('query failed: '. mysqli_connect_error());
		$create_command = file_get_contents('https://cdn.pegasusgateway.com/sql/eventKeysMySQL.sql');
		$create_command = str_replace('UNIT_EVENTS_RPC', DB_TABLE_NAME, $create_command);
		if(!mysqli_query($connection, $create_command)){
		 	die('table could not be created: '. mysqli_connect_error());
		}
	}
}
//Functions
function peg_insert_array($data){
	$connection = mysqli_connect(DB_SERVER, DB_USER, DB_PASS, DB_NAME);
	global $db_store;
	$fails = array();
	if(!$db_store){
		return $fails;
	}
	$fields = $values = array();
	for($i=0; $i<count($data); $i++ ){
		$sql  = "INSERT INTO `".DB_TABLE_NAME."`";
		$sql .= "(`".implode("`, `", array_keys($data[$i]))."`)";
		$sql .= " VALUES ('".implode("', '", array_values($data[$i]))."') ";
		if( !mysqli_query($connection, $sql) ){
			error_log(mysqli_connect_error());
			$fails[] = $data[$i]['id'];
		}
	}
	return $fails;
}

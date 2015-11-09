<?php
ini_set('precision', 20);
define('RPC', 'RPC');
define('JSON', 'JSON');
// error_reporting(E_ALL);
// ini_set('display_errors', true);
// ini_set('display_startup_errors', true);
date_default_timezone_set("America/Bogota"); //Change to your desired timezone
//Enable $db_store once all configurations are set
$db_store = false;

// Database Constants, CONFIGURE THESE BEFORE ADDING THE FORWARD
define("DB_SERVER", "YOURDATABASE_SERVER");
define("DB_USER", "DATABSE_USER");
define("DB_PASS", "DATABASEP_PW");
define("DB_NAME", "DATABASE_NAME");
/*
	Make sure the table name is unique to your database. otherwise it will be overwritten during execution.
	Don't forget to remove exit() from the index.php (line 7) to start receiving data
*/
define('DB_TABLE_NAME', 'PEGASUS_TEST');
/*
	Define the protocol your forwarder is configured with
	RPC or JSON
*/
define('PEGASUS_PROTOCOL', RPC);












/*
	CORE FUNCTIONALITY, MODIFY THIS CODE IF YOU KNOW WHAT YOU ARE DOING
*/
if($db_store){
	// 1. Create a database connection
	$connection = mysql_connect(DB_SERVER, DB_USER, DB_PASS);
	if (!$connection) {
		die("Database connection failed: " . mysql_error());
	}
	// 2. Select a database to use
	$db_select = mysql_select_db(DB_NAME, $connection);
	if (!$db_select) {
		die("Database selection failed: " . mysql_error());
	}
	$query = "SELECT * FROM ".DB_TABLE_NAME." LIMIT 1";
	// Create the table if it does not exist using the following schema
	if (!mysql_query($query)){
		$create_command = file_get_contents('https://cdn.pegasusgateway.com/sql/eventKeysMySQL.sql');
		$create_command = str_replace('UNIT_EVENTS_RPC', DB_TABLE_NAME, $create_command);
		if(!mysql_query($create_command)){
			die('table could not be created: '. mysql_error());
		}
	}
}
//Functions
function peg_insert_array($data){
	global $db_store;
	$fails = array();
	if(!$db_store){
		return $fails;
	}
	$fields = $values = array();
	for($i=0; $i<count($data); $i++ ){
		$sql  = "INSERT INTO `".DB_TABLE_NAME."`";
		$sql .= "(`".implode("`, `", array_keys($data[$i]))."`)";
		$sql .= " VALUES ('".implode("', '", array_values($data[$i]))."')";
		$sql .= " ON DUPLICATE KEY UPDATE id=id";
		if( !mysql_query($sql) ){
			error_log( mysql_error() );
			$fails[] = $data[$i]['id'];
		}
	}
	return $fails;
}

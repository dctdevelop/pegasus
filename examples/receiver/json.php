<?php
$events = json_decode(file_get_contents('php://input'), true);
//Custom Code Goes here, make sure to echo a json encoded array containing the event_ids of events that caused an error and were not processed properly.
//See the peg1_insert_array function structure wihtin the config.php file
echo json_encode( peg_insert_array($events) );
exit();
?>

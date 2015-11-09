<?php
class RPCHandler {
	public function pushevents($n, $events){
		$status = 'ok';
		/*You can run your custom logic here*/



		$store_to_db = peg_insert_array($events);
		if(count($store_to_db) > 0) {
			$status = 'not ok';
		}
		/*MAKE SURE THE SCRIPT RETURNS 'ok', so the queue is cleared on the pegasus gateway.*/
		return $status;
	}
}
?>

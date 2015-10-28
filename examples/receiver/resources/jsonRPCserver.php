<?php
class jsonRPCServer {
	public static function handle($object) {
		// checks if a JSON-RCP request has been received
		//accepted application/x-www-form-urlencoded to test form.
		if ($_SERVER['REQUEST_METHOD'] != 'POST' || empty($_SERVER['CONTENT_TYPE']) || $_SERVER['CONTENT_TYPE'] != 'application/json') {
			// This is not a JSON-RPC request
			return false;
		}
		// reads the input data
		$request = json_decode(file_get_contents('php://input'), true);
		try {
			if(method_exists($object, $request['method'])) {
				$result = call_user_func_array(array($object,$request['method']) , $request['params']);
				$response = array (
					'id' => $request['id'],
					'result' => $result,
					'error' => NULL
				);
			} else {
				$response = array (
					'id' => $request['id'],
					'result' => NULL,
					'error' => 'unknown method or incorrect parameters'
				);
			}
		} catch (Exception $e) {
			$response = array (
				'id' => $request['id'],
				'result' => NULL,
				'error' => $e->getMessage()
			);
		}
		// output the response
		if (!empty($request['id'])) { // notifications don't want response
			header('content-type: text/javascript');
			echo json_encode($response);
		}
		// finish
		return true;
	}
}
?>

<?php
require 'resources/jsonRPCserver.php';
require 'resources/rpchandler.php';
$rpchandler = new RPCHandler();
jsonRPCServer::handle($rpchandler) or print 'no request';
?>

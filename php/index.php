<?php
header("content-type:application/json");
$action = isset($_GET["action"])?trim($_GET["action"]):"searchTransOrderNumber";
if($action == "searchTransOrderNumber") {
	$number = isset($_GET['number'])?trim($_GET['number']):false;
	if($number) {
		$content = file_get_contents("http://47.101.208.226:18080/api/searchTransOrderNumber?number=".$number);
		echo $content;
		exit;
	} else {
		echo json_encode(array("code"=>300,"msg"=>"失败,number不得为空"));
		exit;
	}
	
}else if($action == "searchTransByOrderNo") {
	$number = isset($_GET['number'])?trim($_GET['number']):false;
	if($number) {
		$content = file_get_contents("http://gas777.iask.in:89/ServiceControl/JavaService.ashx?transId=".$number);
		echo $content;
		exit;
	} else {
		echo json_encode(array("code"=>300,"msg"=>"失败,number不得为空"));
		exit;
	}
}
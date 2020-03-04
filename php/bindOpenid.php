<?php
 header("content-type:application/json");
function tocurl($url, $header){
    $ch = curl_init();
    if(substr($url,0,5)=='https'){
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // 跳过证书检查
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, true);  // 从证书中检查SSL加密算法是否存在
    }
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
    $response = curl_exec($ch);
    if($error=curl_error($ch)){
        die($error);
    }
    curl_close($ch);
  //var_dump($response);
    return $response;
}

$header=array('Accept-Language:zh-CN','qcmappversion:1.0.5','Content-Type:application/x-www-form-urlencoded','charset:utf-8');
$openid = trim($_POST['openid']);
$userName = trim($_POST['userName']);
$password = trim($_POST['password']);
  if(!$password) {
  	  echo json_encode(array('code'=>301,"msg"=>"密码不能为空"));
  	  exit;
  }
  if(!$userName) {
  	  echo json_encode(array('code'=>300,"msg"=>"用户名不能为空"));
  	  exit;
  }
  if(!$openid) {
  	  echo json_encode(array('code'=>302,"msg"=>"openid不能为空"));
  	  exit;
  } 
$url = 'http://47.101.47.89:18090/api/bind?userName='.$userName."&password=".$password."&openid=".$openid; 
//$url = 'http://localhost:18090/api/bind'; 
$result = tocurl($url, $header);
echo $result;

/*  header("content-type:application/json");
  $openid = isset($_POST['openid'])?trim($_POST['openid']):"openid12321dfsdfsdsd";
  $userName = isset($_POST['userName'])?trim($_POST['userName']):"13370252985";
  $password = isset($_POST['password'])?trim($_POST['password']):"111111";
  $aHeader = array('qcmappversion:1.0.5','Content-Type:application/x-www-form-urlencoded; charset=UTF-8');
  
  if(!$password) {
  	  echo json_encode(array('code'=>301,"msg"=>"密码不能为空"));
  	  exit;
  }
  if(!$userName) {
  	  echo json_encode(array('code'=>300,"msg"=>"用户名不能为空"));
  	  exit;
  }
  if(!$openid) {
  	  echo json_encode(array('code'=>302,"msg"=>"openid不能为空"));
  	  exit;
  }  
  $url = 'http://47.101.47.89:18090/api/bind'; 
  $curl = curl_init();
  curl_setopt($curl, CURLOPT_URL, $url);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
  curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
  curl_setopt($curl, CURLOPT_HTTPHEADER, $aHeader);
  //curl_setopt($curl, CURLOPT_HEADER, 0)
  curl_setopt($curl, CURLOPT_POST, 1);
  //设置post数据
  $post_data = array(
      "openid" => $openid,
      "userName" => $userName,
      "password"=>$password
   );
  var_dump($post_data);
  curl_setopt($curl, CURLOPT_POSTFIELDS, $post_data);
  $res = curl_exec($curl);
  var_dump($res);
  curl_close($curl);
  echo $res;*/

<?php
  $openid = trim($_GET['openid']);
  $appid = 'wx9a95c716c2525c25'; 
  $unitId = 1;
  $aHeader = array('qcmappversion:1.0.5');
  $url = 'http://47.101.47.89:18090/api/getEmployeeByOpenid';    
            
  $curl = curl_init();
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($curl, CURLOPT_TIMEOUT, 500);
  curl_setopt($curl, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_HTTPHEADER, $aHeader);
  curl_setopt($curl, CURLOPT_POST, 1);
  //设置post数据
  $post_data = array(
      "openid" => $openid,
      "unitId" => $unitId
   );
  curl_setopt($curl, CURLOPT_POSTFIELDS, $post_data);
  $res = curl_exec($curl);
  var_dump($res);
  curl_close($curl);
        
  return json_decode($res, true);

<?php
  header("content-type:application/json");
  $code = trim($_GET['code']);
  $appid = 'wx9a95c716c2525c25'; 
  $secret = '6cc69e50ca02b6ca0a16cf000d4961d8';
  $url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' . $appid . '&secret='.$secret.'&js_code='.$code.'&grant_type=authorization_code';    
            
  $curl = curl_init();
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($curl, CURLOPT_TIMEOUT, 500);
  curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
  curl_setopt($curl, CURLOPT_URL, $url);
  $res = curl_exec($curl);
  curl_close($curl);
        
  echo $res;
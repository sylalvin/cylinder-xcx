const formatTime = (template, date) => {
  var specs = 'YYYY:MM:DD:HH:mm:ss'.split(':');
  
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split(/[-:.TZ]/).reduce(function (template, item, i)   {
    return template.split(specs[i]).join(item);
  }, template);
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
//参数data转formData
function json2Form(json) {
  var str = [];
  for (var p in json) {
    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
  }
  return str.join("&");
} 
function getObjectKeys(object) {
  var keys = [];
  for (var property in object)
    keys.push(property);
  return keys;
}
//将指定的元素放到第一位
function putElementToFirst(arr, key) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === key) {
      arr.splice(i, 1);
      break;
    }
  }
  arr.unshift(key);
  return arr;
}
//计算两个时间差,返回相差的毫秒数
function diff(begin, end = new Date()) {
  var bTime = new Date(begin.replace(/-/g, "/")).getTime();
  var eTime = new Date(end).getTime();
  var times = eTime - bTime;
  return times;
}

function checkLogin() {
  var id = wx.getStorageSync("pj_employee_id");
  if((id == "") || (id == null) || (id == undefined)) {
    return false;
  } else {
    return true;
  }
}

module.exports = {
  formatTime: formatTime,
  json2Form: json2Form,
  getObjectKeys: getObjectKeys,
  putElementToFirst: putElementToFirst,
  diff: diff,
  checkLogin: checkLogin
}

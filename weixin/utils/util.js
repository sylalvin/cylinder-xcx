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
module.exports = {
  formatTime: formatTime,
  json2Form: json2Form,
  getObjectKeys: getObjectKeys
}

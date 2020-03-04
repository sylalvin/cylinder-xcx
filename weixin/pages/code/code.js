//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: false
  },

  onLoad: function () {
    var that = this;

    var openid = "";
    try {
      openid = wx.getStorageSync('pj_cylinder_openid')
    } catch (e) {
      wx.showToast({
        title: '请检查您的网络',
        icon: 'none',    //如果要纯文本，不要icon，将值设为'none'
        duration: 2000
      })  
    };
    if (openid != "") {
      console.log(openid);
    } else {
      // 查看是否授权
      wx.getSetting({
        success: function (res1) {
          console.log(res1);
          if (res1.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: function (res) {
                console.log(res);
                wx.login({
                  success: res => {
                    wx.request({
                      url: 'https://wx.feifanqishi.net/getOpenid.php?js_code=' + res.code,
                      success: res2 => {
                        if (res.errMsg == "login:ok") {
                          wx.setStorage({
                            key: "pj_cylinder_openid",
                            data: res.code
                          });
                        }
                      }
                    });
                  }
                });
              }
            });
          } else {
          //  console.log("not");
              that.setData({
                isHide: true
              });
          }
        }
      });
    }
  },

  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false
      });
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  }
})
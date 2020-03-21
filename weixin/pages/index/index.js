//index.js
//获取应用实例
const app = getApp()
var Util = require('../../utils/util');

Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hasAuthority: false,
    isBinding:false,
    openid:""
  },

  onLoad: function () {
    //检查并设置版本号为全局变量
    wx.request({
      url: app.globalData.apiUrl + '/version',
      method: 'POST',
      success: (res) => {
        if ((res.data.data != "") && (res.data.data != null)) {
            app.globalData.qcmappversion = res.data.data
        }
      }
    });

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
      that.setData({
        hasAuthority: true,
        isBinding: true
      });
      console.log("openid:"+openid);
    } else {
      // 查看是否授权
      wx.getSetting({
        success: function (res1) {
          console.log("开始查询是否授权");
          if (res1.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: function (res) {
                //判断授权是否成功
                if(res) {
                  console.log(res);
                } else {
                  that.setData({
                    hasAuthority: false,
                    isBinding: false
                  });
                }
              }
            });
          } else {
            //  console.log("not");
            that.setData({
              hasAuthority: false,
              isBinding: false
            });
          }
        }
      });
    }
  },

  loginBtnClick: function(e) {
    var that = this;
    console.log(e.detail.value.login_username);
    console.log(e.detail.value.login_pwd);
    wx.getUserInfo({
      success: function (res) {
        //判断授权是否成功
        if (res) {
          wx.login({
            success: res => {
              console.log("js_code: "+res.code);
              wx.request({
                url: 'https://wx.feifanqishi.net/getOpenid.php?code=' + res.code,
                method: "GET",
                success: res2 => {
                  if (res2.errMsg == "request:ok") {
                    console.log("openid:"+res2.data.openid);
                    wx.setStorage({
                      key: "pj_cylinder_openid",
                      data: res2.data.openid
                    });
                    wx.request({
                      url: 'https://wx.feifanqishi.net/bindOpenid.php',
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded"
                      },
                      data: { openid: res2.data.openid, userName: e.detail.value.login_username, password: e.detail.value.login_pwd},
                      success: res3 => {
                        console.log(res3)
                        if(res3.data.code == 200) {
                          console.log(res3.data.data.name);
                          console.log(res3.data.data.id);
                          wx.setStorage({
                            key: "pj_employee_name",
                            data: res3.data.data.name
                          });
                          wx.setStorage({
                            key: "pj_employee_mobile",
                            data: res3.data.data.mobile
                          });
                          wx.setStorage({
                            key: "pj_employee_position",
                            data: res3.data.data.position
                          });
                          wx.setStorage({
                            key: "pj_employee_id",
                            data: res3.data.data.id
                          });
                          console.log(res3.data.data.name);
                          console.log(res3.data.data.mobile);
                          console.log(res3.data.data.position);
                          /** 职位 1司机，2押运员，3收发，4生产，5检测 **/
                          wx.showToast({
                            title: "绑定成功",
                            icon: 'success',
                            duration: 2000
                          });
                          that.setData({
                            hasAuthority: true,
                            isBinding: true
                          });
                        } else {
                          wx.showToast({
                            title: res3.data.msg,
                            icon: 'none',
                            duration: 2000
                          });
                        }
                      }
                    })
                  }
                }
              });
            }
          });
        } else {
          that.setData({
            hasAuthority: false,
            isBinding: false
          });
        }
      }
    });
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
        hasAuthority: true
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
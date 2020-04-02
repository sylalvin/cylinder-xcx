const updateManager = wx.getUpdateManager()

//app.js
App({
  onLaunch: function () {
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
    })
  },
  globalData: {
    userInfo: null,
    nowTime :function() {
      var myDate = new Date();
      var myDay = myDate.getDate();
      var myMonth = myDate.getMonth();
      if (myDay < 10){
        myDay = '0' + myDay;  //补齐
      }
      if (myMonth + 1 < 10) {
        myMonth = '0' + (myMonth + 1);  //补齐
      }
      return myDate.getFullYear() + '-' + myMonth + '-' + myDay;
    },
    
    //apiUrl: "http://47.101.208.226:18090/api", // 生产
    apiUrl: "http://47.101.47.89:18090/api", // 测试
    // apiUrl: "http://localhost:18090/api", // 测试192.168.31.65
    // apiUrl: "https://xch.feifanqishi.net/api",
    qcmappversion: '1.0.7',

    // 充装全局数据配置
    fillCylinderList: [],
    fillSetList: [],
    fillSetCylinderList: [],
    fillAllCylinderList: [],

    // 回厂验空全局配置数据
    backCylinderList: [],
    backSetList: [],
    backSetCylinderList: [],
    backAllCylinderList: [],

    // 充后验满全局配置数据
    outCylinderList: [],
    outSetList: [],
    outSetCylinderList: [],
    outAllCylinderList: [],

    // 发瓶卸货全局配置数据
    sendCylinderList: [],
    sendSetList: [],
    sendSetCylinderList: [],
    sendAllCylinderList: [],

    // 客户回瓶全局配置数据
    cusreCylinderList: [],
    cusreSetList: [],
    cusreSetCylinderList: [],
    cusreAllCylinderList: [],

    // 厂外库区流转全局配置数据
    wareCylinderList: [],
    wareSetList: [],
    wareSetCylinderList: [],
    wareAllCylinderList: []
  }
})

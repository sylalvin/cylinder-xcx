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
    saomiao: [],
    sanping: [],
    jige: [],
    zongqiping: [],
    "gasMediumName": "",
    "beginTime": "",
    "productionBatch":"",
    "purenessIndex":0,
    "areaIndex": 0,
    "remark": ""
  }
})

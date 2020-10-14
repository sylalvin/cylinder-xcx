// pages/conScan/conScan.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scanFlag: true,
    time: 2,
    flash: "off"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // error
  error: function(e) {
    console.log("Error: " + JSON.stringify(e));
  },

  // success
  success: function(e) {
    var that = this;
    if(that.data.scanFlag) {
      wx.vibrateShort({
        
      })
      console.log("Success: " + JSON.stringify(e.detail.result));
      that.setData({
        scanFlag: false
      })
      setTimeout(() => {
        that.setData({
          scanFlag: true
        })
      }, that.data.time * 1000)
    }
  },

  // 时间间隔
  changeTime: function(e) {
    this.setData({
      time: e.detail.value
    })
  },

  // 控制手电筒
  onFlash: function() {
    if (this.data.flash == "off") {
      this.setData({
        flash: "on"
      })
    } else {
      this.setData({
        flash: "off"
      })
    }
  }
})
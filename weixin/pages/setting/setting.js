var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    qcmappversion: app.globalData.qcmappversion,
    name: "",
    mobile: ""
  },

  // onload
  onLoad: function (options) {
    var that = this;
    wx.getStorage({
      key: 'pj_employee_name',
      success: function(res) {
        that.setData({
          'name': res.data
        })
      },
    });
    wx.getStorage({
      key: 'pj_employee_mobile',
      success: function (res) {
        that.setData({
          'mobile': res.data
        })
      },
    });
  },

  // logout
  logout: function() {
    wx.clearStorage();
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})
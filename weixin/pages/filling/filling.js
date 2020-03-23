var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    scanLogs: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
        
    wx.request({
      url: app.globalData.apiUrl + '/getDetectionMissionVoListByEmployeeId',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": app.globalData.qcmappversion
      },
      data: { "employeeId": wx.getStorageSync('pj_employee_id'), "beginDate": new Date().getFullYear() + "-" + ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + "-" + ((new Date().getDate() < 10) ? ("0" + new Date().getDate()) : (new Date().getDate()))},
      success: res => {
        let returnData =res.data.data;
        console.log(res);
        let scanLogs = [];
        for (var j = 0; j < returnData.length; j++) {
          scanLogs.push({ "id": returnData[j].id, "beginDate": returnData[j].beginDate, "name": returnData[j].mediemName, "quantity": returnData[j].yqDetectionVoList.length, "number": returnData[j].productionBatch, "status": returnData[j].status == 1 ?"充气中":"已完成" });
        }
        that.setData({ "scanLogs": scanLogs });
      },
      fail: function (res) {
        // fail调用接口失败
        wx.showToast({
          title: '网络错误'
        })
      },
      complete: function (res) {
        // complete
      }
    });
   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onSubmit: function() {
    wx.navigateTo({
      url: '/pages/addFilling/addFilling'
    })
  }

})
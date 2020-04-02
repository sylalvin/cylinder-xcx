var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    scanLogs: [],
    todayFillingTimes: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.fillingTimes();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    that.fillingTimes();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this;
    that.fillingTimes();
    that.returnBeginDate();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 今日充装次数及内容
  fillingTimes: function() {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    var beginDate = that.returnBeginDate();

    wx.request({
      url: app.globalData.apiUrl + '/getDetectionMissionVoListByEmployeeId',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": app.globalData.qcmappversion
      },
      data: {
        "employeeId": wx.getStorageSync('pj_employee_id'),
        "begin": beginDate
      },
      success: res => {
        // 获取数据后，停止刷新动作
        wx.hideLoading();
        wx.stopPullDownRefresh();

        let returnData = res.data.data;
        if ((returnData != null) && (returnData != [])) {
          if (returnData.length > 0) {
            let scanLogs = [];
            let todayFillingTimes = 0;
            for (var j = 0; j < returnData.length; j++) {
              scanLogs.push({ "id": returnData[j].id, "beginDate": returnData[j].beginDate, "name": returnData[j].mediemName, "quantity": returnData[j].yqDetectionVoList.length, "productionBatch": returnData[j].productionBatch, "status": returnData[j].status == 1 ? "充气中" : "已完成" });
              todayFillingTimes += returnData[j].yqDetectionVoList.length;
            }

            that.setData({
              "scanLogs": scanLogs,
              todayFillingTimes: todayFillingTimes
            })
          }
        }
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

  // 计算查询的开始时间
  returnBeginDate: function() {
    var that = this;
    var beginDate = "";
    var todayDate = new Date();
    var yesterdayDate = new Date();

    // 现在时间（小时）
    var nowHours = todayDate.getHours();
    // 今天日期
    todayDate = todayDate.getFullYear() + "-" + (that.checkRule(todayDate.getMonth() + 1)) + "-" + that.checkRule(todayDate.getDate());
    // 昨天日期
    yesterdayDate.setTime(yesterdayDate.getTime() - 24 * 60 * 60 * 1000);
    yesterdayDate = yesterdayDate.getFullYear() + "-" + (that.checkRule(yesterdayDate.getMonth() + 1)) + "-" + that.checkRule(yesterdayDate.getDate());
    
    if (nowHours < 7) {
      beginDate = yesterdayDate + ' ' + "15:00:00";
      return beginDate;
    } else if (nowHours < 19) {
      beginDate = yesterdayDate + ' ' + "17:00:00";
      return beginDate;
    } else {
      beginDate = todayDate + ' ' + "00:00:00";
      return beginDate;
    }
  },

  checkRule: function(x) {
    if(x < 10) {
      return '0' + x;
    } else {
      return x;
    }
  },

  onSubmit: function() {
    wx.navigateTo({
      url: '/pages/addFilling/addFilling'
    })
  }

})
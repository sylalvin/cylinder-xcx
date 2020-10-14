var app = getApp();
var util = require('../../utils/util');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    scanLogs: [],
    fillList: [],
    windowHeight: 1000,
    pageNo: 1,
    pageSize: 10,
    loading: false,
    dataStatusText: "暂无数据"
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!util.checkLogin()) {
      wx.showToast({
        title: '您还未登录,请先登录',
        icon: 'none',
        mask: true,
        duration: 1000
      })
      setTimeout(function () {
        wx.switchTab({
          url: '/pages/index/index',
        })
      }, 1000)
      return;
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   * 初始化数据
   */
  onReady: function () {
    var that = this;
    wx.getSystemInfo({
      success: (result) => {
        that.setData({
          windowHeight: result.windowHeight
        })
      },
    })
    that.fillingTimes("top");
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this;
    that.fillingTimes("top");
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 今日充装次数及内容
  fillingTimes: function(position) {
    var that = this;
    that.setData({
      loading: false
    })
    if(position == "top") {
      that.setData({
        pageNo: 1
      })
    }
    wx.showLoading({
      title: '加载中',
    })

    wx.request({
      url: app.globalData.apiUrl + '/getDetectionMissionVoListInDateAndNotFinishedByEmployeeId',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": app.globalData.qcmappversion
      },
      data: {
        "employeeId": wx.getStorageSync('pj_employee_id'),
        "unitId": 1,
        "pageSize": that.data.pageSize,
        "pageNo": that.data.pageNo
      },
      success: res => {

        let returnData = res.data.data;
        if ((returnData != null) && (returnData != [])) {
          if (returnData.length > 0) {
            if(returnData.length < 10) {
              that.setData({
                dataStatusText: "已经到底了"
              })
            }else{
              that.setData({
                dataStatusText: "向上滑动加载更多"
              })
            }
            let fillList = that.data.fillList;
            let scanLogs = that.data.scanLogs;
            if(position == "top") {
              scanLogs = [];
              fillList = [];
            }
            for (let j = 0; j < returnData.length; j++) {
              // 判断是否fillList中已存在temp
                if(!fillList.some(function(item){
                  return item[0] == returnData[j].id
                })) {
                let temp = [];
                if(returnData[j].yqDetectionVoList == null) {
                  continue
                }
                for (let k = 0; k < returnData[j].yqDetectionVoList.length; k++) {
                  returnData[j].yqDetectionVoList[k].beforeColor == null ? returnData[j].yqDetectionVoList[k].beforeColor = 1 : returnData[j].yqDetectionVoList[k].beforeColor;

                  returnData[j].yqDetectionVoList[k].beforeAppearance == null ? returnData[j].yqDetectionVoList[k].beforeAppearance = 1 : returnData[j].yqDetectionVoList[k].beforeAppearance;

                  returnData[j].yqDetectionVoList[k].beforeSafety == null ? returnData[j].yqDetectionVoList[k].beforeSafety = 1 : returnData[j].yqDetectionVoList[k].beforeSafety;

                  returnData[j].yqDetectionVoList[k].beforeRegularInspectionDate == null ? returnData[j].yqDetectionVoList[k].beforeRegularInspectionDate = 1 : returnData[j].yqDetectionVoList[k].beforeRegularInspectionDate;

                  returnData[j].yqDetectionVoList[k].beforeResidualPressure == null ? returnData[j].yqDetectionVoList[k].beforeResidualPressure = 1 : returnData[j].yqDetectionVoList[k].beforeResidualPressure;

                  returnData[j].yqDetectionVoList[k].fillingIfNormal == null ? returnData[j].yqDetectionVoList[k].fillingIfNormal = 1 : returnData[j].yqDetectionVoList[k].fillingIfNormal;

                  returnData[j].yqDetectionVoList[k].afterPressure == null ? returnData[j].yqDetectionVoList[k].afterPressure = 1 : returnData[j].yqDetectionVoList[k].afterPressure;

                  returnData[j].yqDetectionVoList[k].afterCheckLeak == null ? returnData[j].yqDetectionVoList[k].afterCheckLeak = 1 : returnData[j].yqDetectionVoList[k].afterCheckLeak;

                  returnData[j].yqDetectionVoList[k].afterAppearance == null ? returnData[j].yqDetectionVoList[k].afterAppearance = 1 : returnData[j].yqDetectionVoList[k].afterAppearance;

                  returnData[j].yqDetectionVoList[k].afterTemperature == null ? returnData[j].yqDetectionVoList[k].afterTemperature = 1 : returnData[j].yqDetectionVoList[k].afterTemperature;

                  returnData[j].yqDetectionVoList[k].ifPass == null ? returnData[j].yqDetectionVoList[k].ifPass = 1 : returnData[j].yqDetectionVoList[k].ifPass = 1; // 默认通过
                }
                temp.push(returnData[j].id);
                temp.push(returnData[j].yqDetectionVoList);
                
                scanLogs.push({ "id": returnData[j].id, "beginDate": returnData[j].beginDate, "name": returnData[j].mediemName, "quantity": returnData[j].yqDetectionVoList.length, "productionBatch": returnData[j].productionBatch, "status": returnData[j].status == 1 ? "充气中" : "已完成" });
                fillList.push(temp);
              }
            }

            that.setData({
              scanLogs: scanLogs,
              fillList: fillList,
              pageNo: that.data.pageNo + 1,
              loading: true
            })

            that.setGlobal();

            // 获取数据后，停止刷新动作
            wx.hideLoading();
            wx.stopPullDownRefresh();
            if(scanLogs.length == 0) {
              that.setData({
                dataStatusText: "暂无数据"
              })
            }
          }else{
            wx.hideLoading();
            wx.stopPullDownRefresh();
            if(that.data.pageNo == 1) {
              that.setData({
                scanLogs: [],
                fillList: [],
                pageNo: 1,
                loading: true,
                dataStatusText: "暂无数据"
              })
            }else {
              that.setData({
                loading: true,
                dataStatusText: "已经到底了"
              })
            }
            that.setGlobal();
          }
        }else{
          wx.hideLoading();
          wx.stopPullDownRefresh();
          if(that.data.pageNo == 1) {
            that.setData({
              scanLogs: [],
              fillList: [],
              pageNo: 1,
              loading: true,
              dataStatusText: "暂无数据"
            })
          }else {
            that.setData({
              loading: true,
              dataStatusText: "已经到底了"
            })
          }
          that.setGlobal();
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

  // 获取全局变量
  getGlobal: function () {
    var that = this;
    var fillList = app.globalData.fillList;
    var scanLogs = app.globalData.scanLogs;
    var pageNo = app.globalData.pageNo;
    that.setData({
      fillList: fillList,
      scanLogs: scanLogs,
      pageNo: pageNo
    })
  },

  // 设置全局变量
  setGlobal: function () {
    var that = this;
    app.globalData.fillList = that.data.fillList;
    app.globalData.scanLogs = that.data.scanLogs;
    app.globalData.pageNo = that.data.pageNo;
  },

  checkRule: function(x) {
    if(x < 10) {
      return '0' + x;
    } else {
      return x;
    }
  },

  jumpDetectionDetail: function(e) {
    var detectionId = e.currentTarget.dataset.detectionId;
    wx.redirectTo({
      url: '/pages/editFilling/editFilling?detectionMissionId=' + detectionId
    })
  },

  upper: function() {
    var that = this;
    if(that.data.loading) {
      that.fillingTimes("top")
    }
  },

  lower: function() {
    var that = this;
    if(that.data.loading) {
      that.fillingTimes("lower")
    }
  },

  onSubmit: function() {
    wx.navigateTo({
      url: '/pages/addFilling/addFilling'
    })
  }

})
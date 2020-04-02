const sliderWidth = 96;
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ishideBottom: true,
    detectionMissionId: 0,
    scan_sum: 0,
    gasMediumName: "",
    productionBatch: "",
    purenessItems: ["普", "2N", "3N", "4N", "5N", "6N"],
    purenessIndex: 0,
    pureness: "暂无",
    areaName: "",
    companyAreaId: 0,
    remark: "暂无",
    beginDate:"",
    beginTime: "",
    endTime:"",
    cylinderCheckList: [],
    cylinderIdList: [],
    productionBatch:"",
    remark: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //获取充装任务ID
    var detectionMissionId = options.id;
    that.setData({
      detectionMissionId: detectionMissionId
    })

    //获取充装任务并填充内容
    wx.request({
      url: app.globalData.apiUrl + '/getDetectionMissionVoById',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": app.globalData.qcmappversion
      },
      data: {
        detectionMissionId: detectionMissionId
      },
      success: res => {
        if (that.judge(res.data.data.yqDetectionVoList)) {
          var list = res.data.data.yqDetectionVoList;
          var timeStr = list[0].beginDate;
          var timeArr = String(timeStr).split(' ');
          if (timeArr.length == 2) {
            that.setData({ "beginTime": timeArr[1] });
          }
          var timeStr2 = list[0].endDate;
          var timeArr2 = String(timeStr2).split(' ');
          if (timeArr2.length == 2) {
            that.setData({ "endTime": timeArr2[1] });
          }
          var pureness = that.data.purenessItems[(list[0].pureness - 1)];
          console.log(JSON.stringify(list[0]));
          console.log(list[0].pureness - 1);
          console.log(pureness);
          that.setData({
            "cylinderCheckList": list,
            "scan_sum": list.length,
            "gasMediumName": list[0].mediemName,
            "productionBatch": list[0].productionBatch,
            "pureness": pureness,
            "companyAreaId": list[0].companyAreaId,
            "areaName": list[0].areaName,
            "remark": list[0].remark
          })
        }
      }
    });
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

  setBeginTime: function (e) {
    wx.showToast({
      title: "任务已开始，无法修改开始时间",
      icon: 'none',
      duration: 3600
    });
  },

  setEndTime: function (e) {
    let day = new Date();
    var now_hour, now_minute, now_second;
    if (day.getHours() < 9) {
      now_hour = "0" + day.getHours();
    } else {
      now_hour = day.getHours();
    }
    if (day.getMinutes() < 9) {
      now_minute = "0" + day.getMinutes();
    } else {
      now_minute = day.getMinutes();
    }
    if (day.getSeconds() < 9) {
      now_second = "0" + day.getSeconds();
    } else {
      now_second = day.getSeconds();
    }
    this.setData({
      "endTime": now_hour + ":" + now_minute + ":" + now_second,
      ishideBottom: false
    });
  },

  onChangeRemark: function (e) {
    this.setData({
      "remark": e.detail.value
    });
  },

  onSubmitMission: function (e) {
    var that = this;
    if (this.data.endTime == "") {
      wx.showToast({
        title: "请添加结束时间",
        icon: 'none',
        duration: 3000
      });
      return false;
    }
    var cylinderCheckList = [];
    for (var i = 0; i < that.data.cylinderCheckList.length;i++) {
      cylinderCheckList.push({ "cylinderId": that.data.cylinderCheckList[i].cylinderId, "companyAreaId": that.data.cylinderCheckList[i].companyAreaId, "checkLeak": 1, "beforeColor": 1, "beforeAppearance": 1, "beforeSafety": 1, "beforeRegularInspectionDate": 1, "beforeResidualPressure": 1, "fillingIfNormal": 1, "afterPressure": 1, "afterCheckLeak": 1, "afterAppearance": 1, "afterTemperature": 1, "ifNormal": 1, "ifPass": 1});
    }
    console.log({
      detectionMissionId: that.data.detectionMissionId,
      endDate: new Date().getFullYear() + "-" + ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + "-" + ((new Date().getDate() < 10) ? ("0" + new Date().getDate()) : (new Date().getDate())) + " " + that.data.endTime,
      productionBatch: that.data.productionBatch,
      companyAreaId: that.data.companyAreaId,
      remark: that.data.remark,
      "cylinderCheckList": JSON.stringify(cylinderCheckList)
    });
    wx.request({
      url: app.globalData.apiUrl + '/v2/updateDetection',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": app.globalData.qcmappversion
      },
      data: {
        detectionMissionId: that.data.detectionMissionId,
        endDate: new Date().getFullYear() + "-" + ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + "-" + ((new Date().getDate() < 10) ? ("0" + new Date().getDate()) : (new Date().getDate())) + " " + that.data.endTime,
        remark: that.data.remark,
        "cylinderCheckList": JSON.stringify(cylinderCheckList)
      },
      success: res => {
        if (res.data.code == 200) {
          wx.showToast({
            title: "修改成功",
            icon: 'none',
            duration: 3000
          });
          wx.navigateTo({
            url: '/pages/filling/filling'
          })
        } else {
          wx.showToast({
            title: "添加失败，请检查网络或信息",
            icon: 'none',
            duration: 3000
          });
        }
      }
    });

  },

  judge: function (x) {
    if ((x == "") || (x == null)) {
      return false;
    } else {
      return true;
    }
  },
})
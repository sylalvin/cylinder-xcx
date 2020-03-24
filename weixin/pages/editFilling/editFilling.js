const sliderWidth = 96;
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scanLogs: [],
    gasMediumName: "",
    sliderOffset: 0,
    sliderLeft: 0,
    productionBatch: "",
    purenessItems: ["普", "2N", "3N", "4N", "5N", "6N"],
    purenessIndex: 0,
    //areaItems: ["满瓶仓", "维修区"],
    //areaValues: [2, 3],
    areaItems: [],
    areaValues: [],
    areaIndex: 0,
    remark: "",
    sanping: 0,
    jige: 0,
    zongqiping: 0,
    beginDate:"",
    beginTime: "",
    endTime:"",
    list: [],
    cylinderIdList: [],
    missionId: 0,
    hideBottom: false,
    productionBatch:"",
    remark: "",
    cylinderCheckList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //获取充装任务ID
    let missionId = options.id;
    that.setData({ "missionId": missionId});
    
    var promise = new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.apiUrl + '/getCompanyProjectByCompanyId',
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "qcmappversion": app.globalData.qcmappversion
        },
        data: { unitId: 1 },
        success: res => {
          resolve(res.data.data);
        },
        fail: function (res) {
          // fail调用接口失败
          reject({ error: '网络错误', code: 0 });
        },
        complete: function (res) {
          // complete
        }
      });
    });
    var areaItems = [];
    var areaValues = [];
    promise.then(res => {
      if (res.length > 0) {
        for (var i = 0; i < res.length; i++) {
          if (res[i].projectName == "充装") {
            wx.request({
              url: app.globalData.apiUrl + '/getCompanyProjectAreaByCompanyProjectId',
              method: "POST",
              header: {
                "Content-Type": "application/x-www-form-urlencoded",
                "qcmappversion": app.globalData.qcmappversion
              },
              data: { unitId: 1, companyProjectId: res[i].id, projectId: res[i].projectId },
              success: res2 => {
                var returnData = res2.data.data;

                if (returnData.length > 0) {
                  for (var j = 0; j < returnData.length; j++) {
                    areaItems.push(returnData[j].companyAreaName);
                    areaValues.push(returnData[j].companyAreaId);
                  }
                  that.setData({ "areaItems": areaItems });
                  that.setData({ "areaValues": areaValues });
                }
              }
            });
            setTimeout(function () {
              //获取充装任务并填充内容
              wx.request({
                url: app.globalData.apiUrl + '/getDetectionMissionVoById',
                method: "POST",
                header: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  "qcmappversion": app.globalData.qcmappversion
                },
                data: { detectionMissionId: missionId },
                success: res2 => {
                  console.log(res2)
                  if (res2.data.data.status == 1) {
                    that.setData({ "hideBottom": false });
                  } else if (res2.data.data.status == 2) {
                    that.setData({ "hideBottom": true });
                  }
                  //设置气瓶数量
                  that.setData({"cylinderCheckList":res2.data.data.yqDetectionVoList});
                  that.setData({ "zongqiping": res2.data.data.yqDetectionVoList.length });
                  //设置充装介质
                  that.setData({ "gasMediumName": res2.data.data.mediemName });
                  //设置开始时间
                  var timeStr = res2.data.data.beginDate;
                  var timeArr = String(timeStr).split(' ');
                  if (timeArr.length == 2) {
                    that.setData({ "beginTime": timeArr[1] });
                  }
                  var timeStr2 = res2.data.data.endDate;
                  var timeArr2 = String(timeStr2).split(' ');
                  if (timeArr2.length == 2) {
                    that.setData({ "endTime": timeArr2[1] });
                  }
                  //设置纯度
                  that.setData({ "purenessIndex": res2.data.data.pureness - 1 });
                  //设置生产批次
                  that.setData({ "productionBatch": res2.data.data.productionBatch });
                  //设置备注
                  that.setData({ "remark": res2.data.data.remark });
                  //设置充后流向
                  var areaIndex = areaValues.indexOf(res2.data.data.yqDetectionVoList[0].companyAreaId);
                  
                  that.setData({ "areaIndex": areaIndex });
                }
              });
            }, 100) //延迟时间 这里是1秒
          }
        }
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
    this.setData({ "endTime": now_hour + ":" + now_minute + ":" + now_second });
  },

  onChangePureness: function (e) {
    var value = e.detail.value
    this.setData({ "purenessIndex": value })

  },

  onChangeArea: function (e) {
    this.setData({ "areaIndex": e.detail.value })
  },

  onChangeRemark: function (e) {
    this.setData({ "remark": e.detail.value });
  },

  onSubmitMission: function (e) {
    var that = this
    if (this.data.endTime == "") {
      wx.showToast({
        title: "请添加结束时间",
        icon: 'none',
        duration: 3000
      });
      return false;
    }
    var cylinderList = [];
    for (var i = 0; i < that.data.cylinderCheckList.length;i++) {
      cylinderList.push({ "cylinderId": that.data.cylinderCheckList[i].cylinderId, "companyAreaId": that.data.areaValues[that.data.areaIndex], "checkLeak": 1, "beforeColor": 1, "beforeAppearance": 1, "beforeSafety": 1, "beforeRegularInspectionDate": 1, "beforeResidualPressure": 1, "fillingIfNormal": 1, "afterPressure": 1, "afterCheckLeak": 1, "afterAppearance": 1, "afterTemperature": 1, "ifNormal": 1, "ifPass": 1});
    }
    wx.request({
      url: app.globalData.apiUrl + '/v2/updateDetection',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": app.globalData.qcmappversion
      },
      data: { detectionMissionId: this.data.missionId, endDate: new Date().getFullYear() + "-" + ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + "-" + ((new Date().getDate() < 10) ? ("0" + new Date().getDate()) : (new Date().getDate())) + " " + that.data.endTime, productionBatch: that.data.productionBatch, companyAreaId: that.data.areaValues[that.data.areaIndex], remark: that.data.remark, "cylinderCheckList": JSON.stringify(cylinderList) },
      success: res => {
        console.log(res);
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


})
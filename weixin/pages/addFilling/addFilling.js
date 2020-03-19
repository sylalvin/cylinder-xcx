var util = require("../../utils/util.js")

const sliderWidth = 96;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    saomiaoValue: 0,
    sanpingValue: 0,
    jigeValue: 0,
    zongqipingValue: 0,
    scanLogs: [],
    generateLogs: [],
    tabs: ["添加气瓶", "创建任务"],
    activeIndex: 1,
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
    beginTime:"",
    list:[],
    scanLogs:[],
    cylinderIdList: [],
    reLoadPage: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var app = getApp();
    //初始化全局参数
    if (this.data.reLoadPage == true) {
      console.log(app.globalData.saomiao);
      var newJigeKeys = util.getObjectKeys(app.globalData.jige);
      that.setData({
        "gasMediumName": "",
        "saomiaoValue": app.globalData.saomiao.length,
        "sanpingValue": app.globalData.sanping.length,
        "jigeValue": newJigeKeys.length,
        "zongqipingValue": app.globalData.zongqiping.length,
        "gasMediumName": app.globalData.gasMediumName,
        "beginTime": app.globalData.beginTime,
        "purenessIndex": app.globalData.purenessIndex,
        "productionBatch": app.globalData.productionBatch,
        "zongqipingValue": app.globalData.zongqiping,
        "remark": app.globalData.remark
      })
      if (that.data.cylinderIdList.length == 0) {
        that.setData({
          "gasMediumName": ""
        })
      }
    } else {
      app.globalData.saomiao = [];
      app.globalData.sanping = [];
      app.globalData.jige = [];
      app.globalData.zongqiping = [];
    }
    //初始化结束
    
    var promise = new Promise((resolve, reject) => {
      wx.request({
        url: 'http://localhost:18090/api/getCompanyProjectByCompanyId',
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "qcmappversion": "1.0.7"
        },
        data: {unitId: 1},
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
    promise.then(res => {
      if(res.length>0){
        for(var i=0;i<res.length;i++){
          if (res[i].projectName=="充装"){
            wx.request({
              url: 'http://localhost:18090/api/getCompanyProjectAreaByCompanyProjectId',
              method: "POST",
              header: {
                "Content-Type": "application/x-www-form-urlencoded",
                "qcmappversion": "1.0.7"
              },
              data: { unitId: 1, companyProjectId: res[i].id, projectId: res[i].projectId },
              success: res2 => {
                var returnData = res2.data.data;
                let areaItems =[];
                let areaValues = [];
                if (returnData.length>0){
                  for (var j = 0; j < returnData.length;j++){
                    areaItems.push(returnData[j].companyAreaName);
                    areaValues.push(returnData[j].companyAreaId);
                  }
                  that.setData({ "areaItems": areaItems });
                  that.setData({ "areaValues": areaValues });
                }
              }
            });
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

  setBeginTime: function(e) {
    var app = getApp();
    let day = new Date();
    var now_hour, now_minute, now_second;
    if (day.getHours() < 10) {
      now_hour = "0" + day.getHours();
    } else {
      now_hour = day.getHours();
    }
    if (day.getMinutes() < 10) {
      now_minute = "0" + day.getMinutes();
    } else {
      now_minute = day.getMinutes();
    }
    if (day.getSeconds() < 10) {
      now_second = "0" + day.getSeconds();
    } else {
      now_second = day.getSeconds();
    }
    this.setData({ "beginTime": now_hour + ":" + now_minute + ":" + now_second});
    app.globalData.beginTime = now_hour + ":" + now_minute + ":" + now_second;
  },

  setEndTime: function(e) {
    wx.showToast({
      title: "请先创建任务再设定结束时间",
      icon: 'none',
      duration: 3600
    });
  },

  onChangeProductionBatch: function(e) {
    var app = getApp();
    app.globalData.productionBatch = e.detail.value;
    this.setData({"productionBatch": e.detail.value});
  },

  viewCylinder: function(e) {
    var cylinderList = this.data.cylinderIdList;
    var app = getApp();
    var saomiao = app.globalData.saomiao;
    var sanping = app.globalData.sanping;
    var jige = app.globalData.jige;
    var zongqiping = app.globalData.zongqiping;

    if(cylinderList.length == 0) {
      wx.showToast({
        title: "您还没有添加气瓶信息",
        icon: 'none',
        duration: 3600
      });
      return false;
    }
    wx.navigateTo({
      url: '/pages/cylinderList/cylinderList?ids=' + cylinderList.join(",")
    }) 
  },

  onChangePureness: function(e) {
    var app = getApp();
    var value = e.detail.value
    app.globalData.purenessIndex = value;
    this.setData({ "purenessIndex": value})
    
  },

  onChangeArea: function (e) {
    var app = getApp();
    app.globalData.areaIndex = e.detail.value;
    this.setData({ "areaIndex": e.detail.value })
  },

  onChangeRemark: function(e) {
    var app = getApp();
    app.globalData.remark = e.detail.value;
    this.setData({"remark":e.detail.value});
  },

  onAddCylinder: function(e) {
    var app = getApp();
    var that = this
    wx.scanCode({
      success: (res) => {
        let msg = '';
        if (res.scanType === 'WX_CODE' && res.result === '') {
          msg = '宝宝心里苦，但宝宝不说...'
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
          });
        } else {
          //先处理短码，然后处理长码
          var url = res.result;
          var shortArr = url.split("/");
          var code = "";
          var jigeCode = "";
          if (shortArr.length == 4) {
            code = shortArr[3]
          } else {
            var longArr = url.split("=")
            if (longArr.length > 1) {
              code = longArr[1]
            } else {
              if(shortArr.length == 6){
                jigeCode = shortArr[5];
              }
            }
          }

          if (code != undefined && String(code).length > 0 && String(code).length != 11) {
            wx.showToast({
              title: "该气瓶编码有问题",
              icon: 'none',
              duration: 2000
            });
          } else if (String(jigeCode).length > 0) {
            wx.request({
              url: 'http://localhost:18090/api/getCylinderBySetId',
              method: "POST",
              header: {
                "Content-Type": "application/x-www-form-urlencoded",
                "qcmappversion": "1.0.7"
              },
              data: { setId: jigeCode },
              success: res => {
                var cylinderReturnList = res.data.data;
                var jigeArr = [];
                if(cylinderReturnList.length >0){
                  for(var j = 0; j<cylinderReturnList.length;j++) {
                    if (this.data.gasMediumName == "") {
                      that.setData({ "gasMediumName": cylinderReturnList[j].gasMediumName });
                      app.globalData.gasMediumName = cylinderReturnList[j].gasMediumName;
                    }
                    //增加对气瓶的判断
                    if (this.data.gasMediumName != "" && this.data.gasMediumName != cylinderReturnList[j].gasMediumName) {
                      wx.showToast({
                        title: "您扫码气瓶所属介质是" + cylinderReturnList[j].gasMediumName + ",不是" + this.data.gasMediumName,
                        icon: 'none',
                        duration: 5000
                      });
                      return false;
                    }
                    jigeArr = jigeArr.concat(cylinderReturnList[j].id);
                    app.globalData.zongqiping = app.globalData.zongqiping.concat(cylinderReturnList[j].id);
                    if (this.data.cylinderIdList.indexOf(cylinderReturnList[j].id) < 0) {
                      that.setData({
                        "cylinderIdList": this.data.cylinderIdList.concat(cylinderReturnList[j].id)
                      });
                    }
                  }
                  that.setData({ "zongqipingValue": app.globalData.zongqiping.length });
                  var jigeName = "J" + jigeCode;
                  that.setData({ "gasMediumName": cylinderReturnList[0].gasMediumName });
                  var newJige = app.globalData.jige;
                  newJige[jigeName] = jigeArr;
                  app.globalData.jige = newJige;
                  var newJigeKeys = util.getObjectKeys(newJige);
                  that.setData({ "jigeValue": newJigeKeys.length });
                  app.globalData.saomiao = app.globalData.saomiao.concat(jigeName);
                  that.setData({"saomiaoValue": app.globalData.saomiao.length});
                  that.setData({ "list": this.data.list.concat(jigeCode)});
                }
              }
            });
          } else {
            if (this.data.list.indexOf(code)<0) {
              wx.request({
                url: 'http://localhost:18090/api/getCylinderByNumber',
                method: "POST",
                header: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  "qcmappversion": "1.0.7"
                },
                data: { cylinderNumber: code},
                success: res => {
                  if (res.data.code == 200) {
                    if (this.data.gasMediumName == "") {
                      that.setData({ "gasMediumName": res.data.data.gasMediumName });
                      app.globalData.gasMediumName = res.data.data.gasMediumName;

                    }

                    //增加对气瓶的判断
                    if (this.data.gasMediumName != "" && this.data.gasMediumName != res.data.data.gasMediumName) {
                      wx.showToast({
                        title: "您扫码气瓶所属介质是" + res.data.data.gasMediumName + ",不是" + this.data.gasMediumName,
                        icon: 'none',
                        duration: 5000
                      });
                      return false;
                    }
                    //增加气瓶ID Begin
                    if (this.data.cylinderIdList.indexOf(res.data.data.id) < 0) {
                      that.setData({
                        "cylinderIdList": this.data.cylinderIdList.concat(res.data.data.id)
                      });
                    }
                    //增加气瓶ID End
                    app.globalData.saomiao = app.globalData.saomiao.concat(res.data.data.id);
                    that.setData({ "saomiaoValue": app.globalData.saomiao.length });
                    app.globalData.sanping = app.globalData.sanping.concat(res.data.data.id);
                    that.setData({ "sanpingValue": app.globalData.sanping.length });
                    app.globalData.zongqiping = app.globalData.zongqiping.concat(res.data.data.id);
                    that.setData({ "zongqipingValue": app.globalData.zongqiping.length });
                  } else {
                    wx.showToast({
                      title: "没有此二维码的相关数据",
                      icon: 'none',
                      duration: 3600
                    });
                  }
                }
              });
              that.setData({
                "list": this.data.list.concat(code)
              });
              //that.setData({ cylinderNumber: code })
            } else {
              wx.showToast({
                title: "重复扫码",
                icon: 'none',
                duration: 3600
              });
            }
          }
        }
      }
    })
  },

  onSubmitMission: function(e) {
    var that = this
    if(this.data.beginTime == "") {
      wx.showToast({
        title: "请添加开始时间",
        icon: 'none',
        duration: 3000
      });
      return ;
    }
    if(this.data.cylinderIdList.length == 0){
      wx.showToast({
        title: "请添加气瓶",
        icon: 'none',
        duration: 3000
      });
      return false;
    } else {
      var beginDateValue = new Date().getFullYear() + "-" + ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + "-" + ((new Date().getDate() < 10) ? ("0" + new Date().getDate()) : (new Date().getDate())) + " " + that.data.beginTime;
      wx.request({
        url: 'http://localhost:18090/api/addDetection',
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "qcmappversion": "1.0.7"
        },
        data: { unitId: 1, employeeId: wx.getStorageSync('pj_employee_id'), beginDate: beginDateValue, productionBatch: that.data.productionBatch, pureness: parseInt(that.data.purenessIndex) + 1, companyAreaId: that.data.areaValues[that.data.areaIndex], cylinderIdList: that.data.cylinderIdList, remark: that.data.remark, creator: wx.getStorageSync('pj_employee_name') },
        success: res => {
          if(res.data.code == 200) {
            wx.showToast({
              title: "添加成功",
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
    }
  },


})
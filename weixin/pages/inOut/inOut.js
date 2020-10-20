var app = getApp();
var util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    qcmappversion: '1.0.0',
    disabled: false,
    opacity: 0.9,
    duration: 2000,
    scanFlag: true,
    scan_number: 0,
    scan_bulk: 0,
    scan_set: 0,
    scan_sum: 0,
    cylinderList: [],
    setList: [],
    setCylinderList: [],
    allCylinderList: [],
    commonInfo: {
      creator: "",
      empty: 1,
      workAreaId: 1
    },
    bottleType: [
      { name: '进（In）', value: '1', checked: 'true' },
      { name: '出（Out）', value: '0' }
    ],
    areaArray: [{workAreaId: 1, workAreaName: "S0"},{workAreaId: 2, workAreaName: "残留气体处理"},{workAreaId: 3, workAreaName: "烘箱"},{workAreaId: 4, workAreaName: "充装"},{workAreaId: 5, workAreaName: "分析"},{workAreaId: 6, workAreaName: "充后检"},{workAreaId: 7, workAreaName: "S3"},{workAreaId: 8, workAreaName: "运输"},{workAreaId: 9, workAreaName: "S4"}],
    areaIndex: wx.getStorageSync('workInfo') ? Number(wx.getStorageSync('workInfo')) : 0,
    workAreaName: "",
    purenessArray: ["普", "2N", "3N", "4N", "5N", "6N", "4.5N"],
    display: 'none', // 自定义toast的mask
    showModal: false, // 自定义modal
    errorString: "", // 错误信息
    nostart: false // 是否连续扫描
  },

  onShow: function () {
    var that = this;
    if (!util.checkLogin()) {
      wx.showToast({
        title: '您还未登录,请先登录',
        icon: 'none',
        mask: true,
        duration: 2000
      })
      setTimeout(function () {
        wx.switchTab({
          url: '/pages/index/index',
        })
      }, 2000)
      return;
    }
    if(wx.getStorageSync('workInfo') && (Number(wx.getStorageSync('workInfo')) != that.data.areaIndex)) {
      that.setData({
        areaIndex: Number(wx.getStorageSync('workInfo'))
      })
    }
    // 执行删除后的初始化气瓶数据
    var setList = app.globalData.inOutSetList;
    var cylinderList = app.globalData.inOutCylinderList;
    var setCylinderList = app.globalData.inOutSetCylinderList;
    var allCylinderList = app.globalData.inOutAllCylinderList;
    that.setData({
      setList: setList,
      cylinderList: cylinderList,
      setCylinderList: setCylinderList,
      allCylinderList: allCylinderList
    })
    that.countData();
  },

  onHide: function () {
    var that = this;
    // 设置回厂验空全局变量
    that.setGlobal();
  },

  /**
   * 生命周期函数--监听页面加载
   * 获取版本号、流转区域
   */
  onLoad: function (options) {
    var that = this;
    // 初始化公共数据
    that.initData();

    // 获取版本号
    wx.request({
      url: app.globalData.apiUrl + '/version',
      method: 'POST',
      success: (res) => {
        if ((res.data.data != "") && (res.data.data != null)) {
          that.setData({
            qcmappversion: res.data.data
          })
          var qcmappversion = that.data.qcmappversion;

          wx.request({ // 获取工作区域
            url: app.globalData.apiUrl + '/getCompanyProjectByCompanyId',
            data: {
              'unitId': 1
            },
            header: {
              'qcmappversion': qcmappversion
            },
            method: 'GET',
            success: (res) => {
              
            },
            fail: (e) => {
              
            }
          })
        } else {
          that.errorModalNoStart("版本号不存在");
        }
      },
      fail: (e) => {
        that.errorModalNoStart("获取版本号接口访问失败");
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   * 初始化数据
   */
  onReady: function () {
    var that = this;
    that.mtoast = this.selectComponent("#mtoast");
    wx.getStorage({
      key: 'pj_employee_name',
      success: (res) => {
        that.setData({
          'commonInfo.creator': res.data
        })
      },
    })
  },

  // 气瓶进出
  radioChange: function (e) {
    var that = this;
    that.setData({
      "commonInfo.empty": e.detail.value
    })
  },

  // 普通选择器
  bindPickerChange: function (e) {
    var that = this;
    var workAreaId = that.data.areaArray[e.detail.value].workAreaId;
    var workAreaName = that.data.areaArray[e.detail.value].workAreaName;
    that.setData({
      areaIndex: e.detail.value,
      'commonInfo.workAreaId': workAreaId,
      workAreaName: workAreaName
    })
    var workInfo = e.detail.value;
    wx.setStorageSync('workInfo', workInfo)
  },

  // 页面主要逻辑部分--开始
  // 扫码添加
  start: function() {
    var that = this;
    if (that.data.scanFlag) {
      that.addCylinder();
    }
  },

  addCylinder: function () {
    var that = this;
    that.setData({
      scanFlag: true
    })
    wx.scanCode({
      success: (res) => {
        // 此处判断散瓶、集格
        if (res.result.indexOf("/set/code/") != -1) {
          // 集格
          var setCode = res.result.indexOf("/set/code/");
          setCode = res.result.substring(setCode + 10);
          that.queryCylinderBySetId(Number(setCode));
        } else if (res.result.indexOf("0001") != -1) {
          // 散瓶
          var setId = null;
          var cylinderCode = res.result;
          var cylinderList = that.data.cylinderList;
          var cylinderNumber = cylinderCode.substring(cylinderCode.length - 11);
          if (cylinderNumber.length != 11) {
            that.errorModal("该气瓶码长度不正确");
          } else {
            if (cylinderList.includes(cylinderNumber)) {
              that.errorModal("该气瓶(" + cylinderNumber + ")已扫描");
            } else {
              // 查询气瓶信息
              that.queryCylinderInfoByNumber(setId, cylinderNumber);
            }
          }
        } else {
          that.errorModal("该码不符合规范");
        }
      },
      fail: (e) => {
        // 退出扫码动作或调取扫码动作失败
        that.setData({
          scanFlag: false,
          display: 'none'
        })
      }
    })
  },

  // 根据集格编号查询集格下绑定的气瓶
  queryCylinderBySetId: function (setId) {
    var that = this;
    var qcmappversion = that.data.qcmappversion;
    var setList = that.data.setList;
    wx.request({
      url: app.globalData.apiUrl + '/getSetCylinderBySetId',
      method: 'GET',
      data: {
        'setId': setId
      },
      header: {
        'qcmappversion': qcmappversion
      },
      success: (res) => {
        if(res.data.code != 200) {
          that.errorModal("ID为 " + setId + " 的集格信息缺失");
          return;
        }
        if ((res.data.data != null) && (res.data.data.cylinderList.length > 0)) { // 集格下有绑定气瓶
          let data = res.data.data;
          if (setList.includes(setId)) {
            that.errorModal("该集格(" + data.setNumber + ")已扫描");
          } else {
            if(util.checkEmpty(data.regularInspectionDate)) {
              let regularInspectionDate = data.regularInspectionDate.substring(0, 7); // 集格下检日期
              regularInspectionDate = util.lastMonth(regularInspectionDate);
              let effect = util.compareDate(regularInspectionDate);
              if(!effect) {
                that.errorModal("集格：" + data.setNumber + "的过期日期为" + regularInspectionDate + "。该集格已过期，请先检验再使用！");
              } else {
                let errorString = "";
                for (let i = 0; i < data.cylinderList.length; i++) {
                  let cylinderScrapDate = "";
                  if(util.checkEmpty(data.cylinderList[i].cylinderScrapDate)) {
                    cylinderScrapDate = data.cylinderList[i].cylinderScrapDate.substring(0, 7);
                    cylinderScrapDate = util.lastMonth(cylinderScrapDate);
                    if(util.compareDate(cylinderScrapDate)) {
                      let regularInspectionDate = "";
                      if(util.checkEmpty(data.cylinderList[i].regularInspectionDate)) {
                        regularInspectionDate = data.cylinderList[i].regularInspectionDate.substring(0, 7);
                        regularInspectionDate = util.lastMonth(regularInspectionDate);
                        if(!util.compareDate(regularInspectionDate)) {
                          errorString += data.cylinderList[i].cylinderNumber + "-" + regularInspectionDate + "-（已过期）\r\n";
                        }
                      } else {
                        errorString += data.cylinderList[i].cylinderNumber + "-（下检日期为空）\r\n";
                      }
                    } else {
                      errorString += data.cylinderList[i].cylinderNumber + "-" + cylinderScrapDate + "-（已报废）\r\n";
                    }
                  } else {
                    errorString += data.cylinderList[i].cylinderNumber + "-（报废日期为空）\r\n";
                  }
                }
                if (errorString != "") {
                  that.errorModal(data.setNumber + "中的日期错误气瓶：" + "\r\n" + errorString);
                } else {
                  that.successShowMyToast("集格：" + data.setNumber + " \r\n绑定气瓶数量：" + data.cylinderList.length + " \r\n集格过期日期：" + regularInspectionDate);
                  setList.push(setId);
                  that.setData({
                    setList: setList
                  })
                  that.countData();
                  for (let i = 0; i < data.cylinderList.length; i++) {
                    let cylinderNumber = data.cylinderList[i].cylinderNumber;
                    that.queryCylinderInfoByNumber(setId, cylinderNumber);
                  }
                }
              }
            } else {
              let errorString = "";
              for (let i = 0; i < data.cylinderList.length; i++) {
                let cylinderScrapDate = "";
                if(util.checkEmpty(data.cylinderList[i].cylinderScrapDate)) {
                  cylinderScrapDate = data.cylinderList[i].cylinderScrapDate.substring(0, 7);
                  cylinderScrapDate = util.lastMonth(cylinderScrapDate);
                  if(util.compareDate(cylinderScrapDate)) {
                    let regularInspectionDate = "";
                    if(util.checkEmpty(data.cylinderList[i].regularInspectionDate)) {
                      regularInspectionDate = data.cylinderList[i].regularInspectionDate.substring(0, 7);
                      regularInspectionDate = util.lastMonth(regularInspectionDate);
                      if(!util.compareDate(regularInspectionDate)) {
                        errorString += data.cylinderList[i].cylinderNumber + "-" + regularInspectionDate + "-（已过期）\r\n";
                      }
                    } else {
                      errorString += data.cylinderList[i].cylinderNumber + "-（下检日期为空）\r\n";
                    }
                  } else {
                    errorString += data.cylinderList[i].cylinderNumber + "-" + cylinderScrapDate + "-（已报废）\r\n";
                  }
                } else {
                  errorString += data.cylinderList[i].cylinderNumber + "-（报废日期为空）\r\n";
                }
              }
              if (errorString != "") {
                that.errorModal(data.setNumber + "中的日期错误气瓶：" + "\r\n" + errorString);
              } else {
                that.successShowMyToast("集格：" + data.setNumber + " \r\n绑定气瓶数量：" + data.cylinderList.length + " \r\n集格过期日期：尚无记录");
                setList.push(setId);
                that.setData({
                  setList: setList
                })
                that.countData();
                for (let i = 0; i < data.cylinderList.length; i++) {
                  let cylinderNumber = data.cylinderList[i].cylinderNumber;
                  that.queryCylinderInfoByNumber(setId, cylinderNumber);
                }
              }
            }
          }
        } else {
          that.errorModal("集格：" + data.setNumber + "未绑定气瓶");
        }
      },
      fail: (e) => {
        that.errorModal("查询集格接口访问失败");
      }
    })
  },
 
  // 根据气瓶二维码编号查询气瓶信息
  queryCylinderInfoByNumber: function (setId, cylinderNumber, setNumber = null) {
    var that = this;
    var qcmappversion = that.data.qcmappversion;
    if (setId == null) {
      let cylinderList = that.data.cylinderList;
      let allCylinderList = that.data.allCylinderList;
      wx.request({
        url: app.globalData.apiUrl + '/getCylinderByNumber',
        method: 'GET',
        data: {
          'cylinderNumber': cylinderNumber
        },
        header: {
          'qcmappversion': qcmappversion
        },
        success: (res) => {
          if ((res.data.data != "") && (res.data.data != null)) {
            if (util.checkEmpty(res.data.data.setId)) {
              let setList = that.data.setList;
              if (setList.includes(res.data.data.setId)) {
                that.errorModal("该集格(" + res.data.data.setNumber + ")已扫描");
              } else {
                that.queryCylinderBySetId(res.data.data.setId);
              }
            } else {
              let cylinderId = res.data.data.id;
              let unitId = res.data.data.unitId;
              let cylinderCode = res.data.data.cylinderCode; // 气瓶码
              let cylinderTypeName = res.data.data.cylinderTypeName; // 气瓶类型名称
              let gasMediumName = res.data.data.gasMediumName; // 气瓶介质名称
              let cylinderScrapDate = ""; // 气瓶报废日期
              if(!util.checkEmpty(res.data.data.cylinderScrapDate)) {
                cylinderScrapDate = "2020-01";
              } else {
                cylinderScrapDate = res.data.data.cylinderScrapDate.substring(0, 7);
                cylinderScrapDate = util.lastMonth(cylinderScrapDate);
              }
              let regularInspectionDate = ""; // 气瓶下检日期
              if(!util.checkEmpty(res.data.data.regularInspectionDate)) {
                regularInspectionDate = "2020-01";
              } else {
                regularInspectionDate = res.data.data.regularInspectionDate.substring(0, 7);
                regularInspectionDate = util.lastMonth(regularInspectionDate);
              }
              let cylinderManufacturingDate = res.data.data.cylinderManufacturingDate.substring(0, 7); // 气瓶生产日期
              let volume = res.data.data.volume; // 气瓶容积
              let nominalTestPressure = res.data.data.nominalTestPressure; // 气瓶压力
              let weight = res.data.data.weight; // 气瓶重量
              let lastFillTime = res.data.data.lastFillTime; // 气瓶最后充装时间
              let lastFillPureness = that.data.purenessArray[res.data.data.lastFillPureness] ? that.data.purenessArray[res.data.data.lastFillPureness - 1] : "暂无记录"; // 气瓶最后充装纯度
              let wallThickness = res.data.data.wallThickness; // 气瓶壁厚
              let effect0 = util.compareDate(cylinderScrapDate);
              if(!effect0) {
                that.errorModal("气瓶：" + cylinderNumber + "的报废日期为" + cylinderScrapDate + "。该气瓶已报废，请先检验再使用！");
                return;
              }
              let effect = util.compareDate(regularInspectionDate);
              if(!effect) {
                that.errorModal("气瓶：" + cylinderNumber + "的过期日期为" + regularInspectionDate + "。该气瓶已过期，请先检验再使用！");
              } else {
                cylinderList.push(cylinderNumber);
                allCylinderList.push({ setId, cylinderNumber, cylinderId, unitId, cylinderCode, cylinderTypeName, gasMediumName, regularInspectionDate, cylinderScrapDate, cylinderManufacturingDate, volume, nominalTestPressure, weight, lastFillTime, lastFillPureness, wallThickness });
                that.setData({
                  cylinderList: cylinderList,
                  allCylinderList: allCylinderList
                })
                that.countData();
                that.successShowMyToast("二维码：" + cylinderNumber + " \r\n介质：" + gasMediumName + " \r\n过期日期：" + regularInspectionDate + " \r\n最后充装时间：" + lastFillTime + " \r\n最后充装纯度：" + lastFillPureness)
              }
            }
          } else {
            // 未查询到气瓶信息
            that.errorModal('ID为 ' + cylinderNumber + ' 的气瓶信息缺失');
          }
        },
        fail: (e) => {
          that.errorModal('查询气瓶接口访问失败');
        }
      })
    } else {
      let setCylinderList = that.data.setCylinderList;
      let allCylinderList = that.data.allCylinderList;
      wx.request({
        url: app.globalData.apiUrl + '/getCylinderByNumber',
        method: 'GET',
        data: {
          'cylinderNumber': cylinderNumber
        },
        header: {
          'qcmappversion': qcmappversion
        },
        success: (res) => {
          if ((res.data.data != "") && (res.data.data != null)) {
            let cylinderId = res.data.data.id;
            let unitId = res.data.data.unitId;
            let cylinderCode = res.data.data.cylinderCode; // 气瓶码
            let cylinderTypeName = res.data.data.cylinderTypeName; // 气瓶类型名称
            let gasMediumName = res.data.data.gasMediumName; // 气瓶介质名称
            let cylinderScrapDate = ""; // 气瓶报废日期
            if(!util.checkEmpty(res.data.data.cylinderScrapDate)) {
              cylinderScrapDate = "2020-01";
            } else {
              cylinderScrapDate = res.data.data.cylinderScrapDate.substring(0, 7);
              cylinderScrapDate = util.lastMonth(cylinderScrapDate);
            }
            let regularInspectionDate = ""; // 气瓶下检日期
            if(!util.checkEmpty(res.data.data.regularInspectionDate)) {
              regularInspectionDate = "2020-01";
            } else {
              regularInspectionDate = res.data.data.regularInspectionDate.substring(0, 7);
              regularInspectionDate = util.lastMonth(regularInspectionDate);
            }
            let cylinderManufacturingDate = res.data.data.cylinderManufacturingDate.substring(0, 7); // 气瓶生产日期
            let volume = res.data.data.volume; // 气瓶容积
            let nominalTestPressure = res.data.data.nominalTestPressure; // 气瓶压力
            let weight = res.data.data.weight; // 气瓶重量
            let lastFillTime = res.data.data.lastFillTime; // 气瓶最后充装时间
            let lastFillPureness = that.data.purenessArray[res.data.data.lastFillPureness] ? that.data.purenessArray[res.data.data.lastFillPureness - 1] : "暂无记录"; // 气瓶最后充装纯度
            let wallThickness = res.data.data.wallThickness; // 气瓶壁厚
            setCylinderList.push({ setId, cylinderNumber, cylinderId, unitId, cylinderCode, cylinderTypeName, gasMediumName, regularInspectionDate, cylinderScrapDate, cylinderManufacturingDate, volume, nominalTestPressure, weight, lastFillTime, wallThickness });
            allCylinderList.push({ setId, cylinderNumber, cylinderId, unitId, cylinderCode, cylinderTypeName, gasMediumName, regularInspectionDate, cylinderScrapDate, cylinderManufacturingDate, volume, nominalTestPressure, weight, lastFillTime, lastFillPureness, wallThickness });
            that.setData({
              setCylinderList: setCylinderList,
              allCylinderList: allCylinderList
            })
            that.countData();
          } else {
            // 未查询到气瓶信息
            that.errorModal('ID为 ' + cylinderNumber + ' 的气瓶信息缺失');
          }
        },
        fail: (e) => {
          that.errorModal('查询气瓶接口访问失败');
        }
      })
    }
  },

  // 初始化气瓶共用信息
  initData: function () {
    var that = this;
    that.setData({
      'commonInfo.workAreaId': 1
    })
  },

  // 计算扫码次数、气瓶、集格、总数数量
  countData: function () {
    var that = this;
    that.setData({
      scan_number: that.data.setList.length + that.data.cylinderList.length,
      scan_bulk: that.data.cylinderList.length,
      scan_set: that.data.setList.length,
      scan_sum: that.data.allCylinderList.length
    })
  },

  // 设置全局变量
  setGlobal: function () {
    var that = this;
    app.globalData.inOutCylinderList = that.data.cylinderList;
    app.globalData.inOutSetCylinderList = that.data.setCylinderList;
    app.globalData.inOutSetList = that.data.setList;
    app.globalData.inOutAllCylinderList = that.data.allCylinderList;
  },

  // 提交
  submitForm: function () {
    var that = this;
    that.setData({
      disabled: true,
      opacity: 0.3
    })
    console.log(that.data.commonInfo);
    that.setData({
      cylinderList: [],
      setList: [],
      setCylinderList: [],
      allCylinderList: [],
    })
    that.setGlobal();
    that.countData();
    that.successShowToastNoStart("提交成功");
    setTimeout(function () {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }, that.data.duration)
    // var qcmappversion = that.data.qcmappversion;
    // let allCylinderList = that.data.allCylinderList;
    // let cylinderIdList = "";
    // let unitId = 1;
    // if (allCylinderList.length > 0) {
    //   unitId = allCylinderList[0].unitId;
    //   for (let i = 0; i < allCylinderList.length; i++) {
    //     let tempCylinderId = allCylinderList[i].cylinderId;
    //     if (i == allCylinderList.length - 1) {
    //       cylinderIdList = cylinderIdList + String(tempCylinderId);
    //     } else {
    //       cylinderIdList = cylinderIdList + String(tempCylinderId) + ',';
    //     }
    //   }
    //   // 拼接气瓶信息
    //   let data = that.data.commonInfo;
    //   data.cylinderIdList = cylinderIdList;
    //   data.unitId = unitId;
    //   if (data.creator != "") {
    //     wx.request({
    //       url: app.globalData.apiUrl + '/addPreDetection',
    //       method: 'POST',
    //       data: data,
    //       header: {
    //         'qcmappversion': qcmappversion,
    //         "Content-Type": "application/x-www-form-urlencoded",
    //       },
    //       success: (res) => {
    //         if (res.data.code == "200") {
    //           that.setData({
    //             cylinderList: [],
    //             setList: [],
    //             setCylinderList: [],
    //             allCylinderList: [],
    //           })
    //           that.setGlobal();
    //           that.countData();
    //           that.successShowToastNoStart(res.data.msg);
    //           setTimeout(function () {
    //             wx.redirectTo({
    //               url: '/pages/backIndex/backIndex',
    //             })
    //           }, that.data.duration)
    //         } else {
    //           that.setData({
    //             disabled: false,
    //             opacity: 0.9,
    //           })
    //           that.errorModalNoStart(JSON.stringify(res.data.msg));
    //         }
    //       },
    //       fail: (e) => {
    //         that.errorModalNoStart("添加接口访问失败");
    //       }
    //     })
    //   } else {
    //     that.errorModalNoStart("创建人不能为空");
    //     return;
    //   }
    // } else {
    //   that.setData({
    //     disabled: false,
    //     opacity: 0.9
    //   })
    //   that.errorModalNoStart("您还未录入数据");
    // }
  },

  // 日期补零
  addZero: function(x) {
    if(x < 10) {
      return '0' + x;
    } else {
      return '' + x;
    }
  },

  // 正常弹窗提示
  successShowToastNoStart: function(successMsg) {
    var that = this;
    wx.showToast({
      title: successMsg,
      icon: 'none',
      duration: that.data.duration,
      mask: true
    })
  },

  successShowToast: function(successMsg) {
    var that = this;
    wx.showToast({
      title: successMsg,
      icon: 'none',
      duration: that.data.duration,
      mask: true
    })
    setTimeout(that.start, that.data.duration);
  },

  // 自定义toast
  successShowMyToast: function(successMsg) {
    var that = this;
    that.setData({
      display: 'block'
    })
    that.mtoast.showToast(successMsg, that.data.duration);
    setTimeout(that.start, that.data.duration);
  },

  errorModalNoStart: function(errorMsg) {
    var that = this;
    that.setData({
      display: 'block',
      showModal: true,
      errorString: errorMsg,
      nostart: true
    })
  },

  errorModal: function(errorMsg) {
    var that = this;
    that.setData({
      display: 'block',
      showModal: true,
      errorString: errorMsg,
      nostart: false
    })
  },

  closeModal: function() {
    var that = this;
    that.setData({
      display: 'none',
      showModal: false,
    })
  },

  // 页面主要逻辑部分--结束

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

  }

})
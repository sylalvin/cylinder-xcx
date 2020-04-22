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
      validityPeriod: 1,
      checkLeak: 1,
      pressure: 1,
      appearance: 1,
      temperature: 1,
      certificate: 1,
      productionSafety: 1,
      ifPass: 1,
      companyAreaId: 1,
      remark: ""
    },
    checkboxItems: [],
    checkboxPass: [],
    init_checkboxItems: [
      { name: 'validityPeriod', value: '检测有效期', checked: 'true' },
      { name: 'checkLeak', value: '检漏', checked: 'true' },
      { name: 'pressure', value: '测压', checked: 'true' },
      { name: 'appearance', value: '外观检查', checked: 'true' },
      { name: 'temperature', value: '温度无异常', checked: 'true' },
      { name: 'certificate', value: '合格证标签', checked: 'true' },
      { name: 'productionSafety', value: '生产安全标签', checked: 'true' }
    ],
    init_checkboxPass: [
      { name: 'ifPass', value: '检测通过：', checked: 'true' }
    ],
    areaArray: [],
    areaIndex: 0,
    companyAreaName: ""
  },

  onShow: function () {
    var that = this;
    // 执行删除后的初始化气瓶数据
    var setList = app.globalData.outSetList;
    var cylinderList = app.globalData.outCylinderList;
    var setCylinderList = app.globalData.outSetCylinderList;
    var allCylinderList = app.globalData.outAllCylinderList;
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
    // 设置充后验满全局变量
    that.setGlobal();
  },

  /**
   * 生命周期函数--监听页面加载
   * 获取版本号、流转区域
   */
  onLoad: function (options) {
    var that = this;
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

          wx.request({
            url: app.globalData.apiUrl + '/getCompanyProjectByCompanyId',
            data: {
              'unitId': 1
            },
            header: {
              'qcmappversion': qcmappversion
            },
            method: 'GET',
            success: (res) => {
              if (res.data.data) {
                var area = [];
                for (let i = 0; i < res.data.data.length; i++) {
                  if (res.data.data[i].projectName == "充后验满") {
                  // if (res.data.data[i].projectName == "充后检测") {
                    // 流转区域开始
                    wx.request({
                      url: app.globalData.apiUrl + '/getCompanyProjectAreaByCompanyProjectId',
                      data: {
                        'companyProjectId': res.data.data[i].projectId,
                        'unitId': res.data.data[i].unitId,
                        'projectId': 1
                      },
                      header: {
                        'qcmappversion': qcmappversion
                      },
                      method: 'GET',
                      success: (res) => {
                        if (res.data.data) {
                          var area = [];
                          for (let i = 0; i < res.data.data.length; i++) {
                            area.push({ companyAreaId: res.data.data[i].companyAreaId, companyAreaName: res.data.data[i].companyAreaName });
                          }
                          that.setData({
                            areaArray: area
                          })
                          if (area.length > 0) {
                            that.setData({
                              companyAreaName: area[0].companyAreaName
                            })
                          }
                        } else {
                          wx.showToast({
                            title: '流转区不存在',
                            icon: 'none',
                            duration: 2000
                          })
                        }
                      },
                      fail: (e) => {
                        wx.showToast({
                          title: '获取气瓶流转区接口访问失败',
                          icon: 'none',
                          duration: 2000
                        })
                      }
                    })
                    // 流转区域结束
                  }
                }
                that.setData({
                  areaArray: area
                })
              } else {
                wx.showToast({
                  title: '流转区不存在',
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            fail: (e) => {
              wx.showToast({
                title: '获取气瓶流转区接口访问失败',
                icon: 'none',
                duration: 2000
              })
            }
          })
        } else {
          wx.showToast({
            title: '版本号不存在',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: (e) => {
        wx.showToast({
          title: '获取版本号接口访问失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   * 初始化数据
   */
  onReady: function () {
    var that = this;

    wx.getStorage({
      key: 'pj_employee_name',
      success: (res) => {
        that.setData({
          'commonInfo.creator': res.data
        })
      },
    })
  },

  // 检测内容发生改变触发事件
  checkboxItemsChange: function (e) {
    var that = this;
    var changeArray = e.detail.value;

    // e.detail.value 为选中的数组
    var dic = { 'validityPeriod': 1, 'checkLeak': 1, 'pressure': 1, 'appearance': 1, 'temperature': 1, 'certificate': 1, 'productionSafety': 1 };
    for (let key in dic) {
      if (changeArray.includes(key)) {
        dic[key] = 1;
      } else {
        dic[key] = 0;
      }
    }
    var startData = that.data.commonInfo;
    for (var key in startData) {
      for (var jkey in dic) {
        if (key == jkey) {
          startData[key] = dic[jkey];
        }
      }
    }
    that.setData({
      commonInfo: startData
    })
  },

  // 检测结果发生改变触发事件
  checkboxPassChange: function (e) {
    var that = this;
    // e.detail.value 为选中的数组
    if (e.detail.value.length > 0) {
      that.setData({
        "commonInfo.ifPass": 1
      })
    } else {
      that.setData({
        "commonInfo.ifPass": 0
      })
    }
  },

  // 普通选择器
  bindPickerChange: function (e) {
    var that = this;
    var companyAreaId = that.data.areaArray[e.detail.value].companyAreaId;
    var companyAreaName = that.data.areaArray[e.detail.value].companyAreaName;
    that.setData({
      areaIndex: e.detail.value,
      'commonInfo.companyAreaId': companyAreaId,
      companyAreaName: companyAreaName
    })
  },

  bindInputChange: function (e) {
    var that = this;
    that.setData({
      'commonInfo.remark': e.detail.value
    })
  },

  // 页面主要逻辑部分--开始
  // 扫码添加
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
          var setList = that.data.setList;
          setCode = res.result.substring(setCode + 10);
          if (setList.includes(setCode)) {
            wx.showToast({
              title: '该集格已扫描',
              icon: 'none',
              mask: true,
              duration: 2500
            })
          } else {
            that.queryCylinderBySetId(setCode);
          }
        } else if (res.result.indexOf("0001") != -1) {
          // 散瓶
          var setId = null;
          var cylinderCode = res.result;
          var cylinderList = that.data.cylinderList;
          var cylinderNumber = cylinderCode.substring(cylinderCode.length - 11);
          if (cylinderNumber.length != 11) {
            wx.showToast({
              title: '该气瓶码长度不正确',
              icon: 'none',
              mask: true,
              duration: 2500
            })
          } else {
            if (cylinderList.includes(cylinderNumber)) {
              wx.showToast({
                title: '该气瓶已扫描',
                icon: 'none',
                mask: true,
                duration: 2500
              })
            } else {
              // 查询气瓶信息
              that.queryCylinderInfoByNumber(setId, cylinderNumber);
            }
          }
        } else {
          wx.showToast({
            title: '该码不符合规范',
            icon: 'none',
            mask: true,
            duration: 2500
          })
        }
        if (that.data.scanFlag) {
          setTimeout(that.addCylinder, 2000);
        }
      },
      fail: (e) => {
        // 退出扫码动作或调取扫码动作失败
        that.setData({
          scanFlag: false
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
      url: app.globalData.apiUrl + '/getCylinderBySetId',
      method: 'GET',
      data: {
        'setId': setId
      },
      header: {
        'qcmappversion': qcmappversion
      },
      success: (res) => {
        if ((res.data.data != null) || (res.data.data != [])) { // 集格下有绑定气瓶，集格计数
          setList.push(setId);
          that.setData({
            setList: setList
          })
          that.countData();
          wx.showToast({
            title: "集格编号：" + setId + " 绑定气瓶数量：" + res.data.data.length,
            icon: 'none',
            mask: true,
            duration: 2500
          })
          if (res.data.data.length > 0) {
            for (let i = 0; i < res.data.data.length; i++) {
              let cylinderNumber = res.data.data[i].cylinderNumber;
              that.queryCylinderInfoByNumber(setId, cylinderNumber);
            }
          } else {
            wx.showToast({
              title: 'ID为 ' + setId + ' 的集格未绑定气瓶',
              icon: 'none',
              mask: true,
              duration: 2500
            })
          }
        } else {
          wx.showToast({
            title: 'ID为 ' + setId + ' 的集格未绑定气瓶',
            icon: 'none',
            mask: true,
            duration: 2500
          })
        }
      },
      fail: (e) => {
        wx.showToast({
          title: '查询集格接口访问失败',
          icon: 'none',
          mask: true,
          duration: 2500
        })
      }
    })
  },

  // 根据气瓶二维码编号查询气瓶信息
  queryCylinderInfoByNumber: function (setId, cylinderNumber) {
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
              let cylinderId = res.data.data.id;
              let unitId = res.data.data.unitId;
              let cylinderCode = res.data.data.cylinderCode; // 气瓶码
              let cylinderTypeName = res.data.data.cylinderTypeName; // 气瓶类型名称
              let gasMediumName = res.data.data.gasMediumName; // 气瓶介质名称
              let regularInspectionDate = res.data.data.regularInspectionDate.substring(0, 7); // 气瓶下检日期
              let cylinderScrapDate = res.data.data.cylinderScrapDate.substring(0, 7); // 气瓶过期日期

              let cylinderManufacturingDate = res.data.data.cylinderManufacturingDate.substring(0, 7); // 气瓶生产日期
              let volume = res.data.data.volume; // 气瓶容积
              let nominalTestPressure = res.data.data.nominalTestPressure; // 气瓶压力
              let weight = res.data.data.weight; // 气瓶重量
              let lastFillTime = res.data.data.lastFillTime; // 气瓶最后充装时间
              let wallThickness = res.data.data.wallThickness; // 气瓶壁厚
              cylinderList.push(cylinderNumber);
              allCylinderList.push({ setId, cylinderNumber, cylinderId, unitId, cylinderCode, cylinderTypeName, gasMediumName, regularInspectionDate, cylinderScrapDate, cylinderManufacturingDate, volume, nominalTestPressure, weight, lastFillTime, wallThickness });
              that.setData({
                cylinderList: cylinderList,
                allCylinderList: allCylinderList
              })
              that.countData();
              wx.showToast({
                title: "二维码：" + cylinderNumber + " 介质：" + gasMediumName + " 过期日期：" + cylinderScrapDate,
                icon: 'none',
                mask: true,
                duration: 2500
              })
          } else {
            // 未查询到气瓶信息
            wx.showToast({
              title: 'ID为 ' + cylinderNumber + ' 的气瓶信息缺失',
              icon: 'none',
              mask: true,
              duration: 2500
            })
          }
        },
        fail: (e) => {
          wx.showToast({
            title: '查询气瓶接口访问失败',
            icon: 'none',
            mask: true,
            duration: 2500
          })
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
            let regularInspectionDate = res.data.data.regularInspectionDate.substring(0, 7); // 气瓶下检日期
            let cylinderScrapDate = res.data.data.cylinderScrapDate.substring(0, 7); // 气瓶过期日期

            let cylinderManufacturingDate = res.data.data.cylinderManufacturingDate.substring(0, 7); // 气瓶生产日期
            let volume = res.data.data.volume; // 气瓶容积
            let nominalTestPressure = res.data.data.nominalTestPressure; // 气瓶压力
            let weight = res.data.data.weight; // 气瓶重量
            let lastFillTime = res.data.data.lastFillTime; // 气瓶最后充装时间
            let wallThickness = res.data.data.wallThickness; // 气瓶壁厚
            setCylinderList.push({ setId, cylinderNumber, cylinderId, unitId, cylinderCode, cylinderTypeName, gasMediumName, regularInspectionDate, cylinderScrapDate, cylinderManufacturingDate, volume, nominalTestPressure, weight, lastFillTime, wallThickness });
            allCylinderList.push({ setId, cylinderNumber, cylinderId, unitId, cylinderCode, cylinderTypeName, gasMediumName, regularInspectionDate, cylinderScrapDate, cylinderManufacturingDate, volume, nominalTestPressure, weight, lastFillTime, wallThickness });
            that.setData({
              setCylinderList: setCylinderList,
              allCylinderList: allCylinderList
            })
            that.countData();
          } else {
            // 未查询到气瓶信息
            wx.showToast({
              title: 'ID为 ' + cylinderNumber + ' 的气瓶信息缺失',
              icon: 'none',
              duration: 2000
            })
          }
        },
        fail: (e) => {
          wx.showToast({
            title: '查询气瓶接口访问失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  },

  // 初始化气瓶共用信息
  initData: function () {
    var that = this;
    that.setData({
      checkboxItems: that.data.init_checkboxItems,
      checkboxPass: that.data.init_checkboxPass,
      'commonInfo.validityPeriod': 1,
      'commonInfo.checkLeak': 1,
      'commonInfo.pressure': 1,
      'commonInfo.appearance': 1,
      'commonInfo.temperature': 1,
      'commonInfo.certificate': 1,
      'commonInfo.productionSafety': 1,
      'commonInfo.ifPass': 1,
      'commonInfo.remark': ""
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
    app.globalData.outCylinderList = that.data.cylinderList;
    app.globalData.outSetCylinderList = that.data.setCylinderList;
    app.globalData.outSetList = that.data.setList;
    app.globalData.outAllCylinderList = that.data.allCylinderList;
  },

  // 提交
  submitForm: function () {
    var that = this;
    var qcmappversion = that.data.qcmappversion;
    let setList = that.data.setList;
    let cylinderList = that.data.cylinderList;
    let setCylinderList = that.data.setCylinderList;
    let allCylinderList = that.data.allCylinderList;
    if (allCylinderList.length > 0) {

      for (let i = allCylinderList.length - 1; i >= 0; i--) {
        let temp = allCylinderList[i];
        // 拼接气瓶信息
        let data = that.data.commonInfo;
        data.cylinderId = allCylinderList[i].cylinderId;
        data.unitId = allCylinderList[i].unitId;
        if (data.creator != "") {
        wx.request({
          url: app.globalData.apiUrl + '/addAfterDetection',
          method: 'GET',
          data: data,
          header: {
            'qcmappversion': qcmappversion
          },
          success: (res) => {
            if (res.data.code == "200") {
              let indexS = -2;
              let indexC = -2;
              let indexSC = -2;
              let indexA = -2;
              indexA = allCylinderList.indexOf(temp);
              indexSC = setCylinderList.indexOf(temp);
              indexC = cylinderList.indexOf(temp.cylinderNumber);

              if (indexA > -1) {
                allCylinderList.splice(indexA, 1);
                that.setData({
                  allCylinderList: allCylinderList
                })
                that.setGlobal();
                that.countData();
              }
              if (indexSC > -1) {
                setCylinderList.splice(indexSC, 1);
                that.setData({
                  setCylinderList: setCylinderList
                })
                that.setGlobal();
                that.countData();
              }
              if (indexC > -1) {
                cylinderList.splice(indexC, 1);
                that.setData({
                  cylinderList: cylinderList
                })
                that.setGlobal();
                that.countData();
              }
              if (temp.setId != null) {
                let count = 0;
                for (let j = 0; j < allCylinderList.length; j++) {
                  if (allCylinderList[j].setId == temp.setId) {
                    count += 1;
                  }
                }
                if (count == 0) {
                  indexS = setList.indexOf(temp.setId);
                  if (indexS > -1) {
                    setList.splice(indexS, 1);
                    that.setData({
                      setList: setList
                    })
                    that.setGlobal();
                    that.countData();
                  }
                }
              }

              that.checkData(i + 1);
            } else {
              wx.showToast({
                title: 'ID为 ' + data.cylinderId + ' 的气瓶上传失败',
                icon: 'none',
                duration: 2000
              })
              that.checkData();
            }
          },
          fail: (e) => {
            wx.showToast({
              title: '添加接口访问失败,5秒后再次请求',
              icon: 'none',
              mask: true,
              duration: 2500
            })
            setTimeout(function () {
              that.checkData();
            }, 5000)
          }
        })
        } else {
          wx.showToast({
            title: '创建人不能为空',
            icon: "none",
            duration: 2000
          })
          return;
        }
      }
    } else {
      wx.showToast({
        title: '您还未录入数据',
        icon: 'none',
        duration: 2000
      })
    }
  },

  // 上传数据
  checkData: function (status = null) {
    var that = this;
    var qcmappversion = that.data.qcmappversion;
    var allCylinderList = that.data.allCylinderList;
    if (allCylinderList.length > 0) {
      if (status == null) {
        that.submitForm();
      } else {
        console.log("正在提交第： " + status + " 条数据...");
      }
    } else {
      that.setData({
        disabled: true,
        opacity: 0.3
      })
      // 提交成功后，清除回空全局变量
      // that.setData({
      //   cylinderList: [],
      //   setList: [],
      //   setCylinderList: [],
      //   allCylinderList: [],
      // })
      // app.globalData.outCylinderList = [];
      // app.globalData.outSetCylinderList = [];
      // app.globalData.outSetList = [];
      // app.globalData.outAllCylinderList = [];
      // that.countData();
      wx.showToast({
        title: '提交成功',
        icon: 'none',
        duration: 2000
      })
    }
  },
  // 页面主要逻辑部分--结束

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }

})
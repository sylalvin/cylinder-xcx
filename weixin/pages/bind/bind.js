var util = require("../../utils/util.js")
var app = getApp();
Page({
  data: {
    cylinderId: '',
    cylinderCode: '',
    cylinderTypeArray: [], // 气瓶类型种类
    cylinderTypeIndex: 0, // 所选气瓶种类index
    cylinderTypeId: 1, // 气瓶类型id
    cylinderTypeName: "", // 气瓶类型名称
    gasMediumArray: [], // 介质种类
    gasMediumIndex: 0, // 所选介质index
    gasMediumId: 1, // 介质种类id
    gasMediumName: "", // 介质种类名称
    setList: [], // 全部集格种类
    setId: -1,
    setNumber:"",
    setName: "",
    forSetList: [],
    manuCodes: [], // 气瓶制造商
    cylinderManufacturerName: "",
    cylinderManufacturerId: 0,
    codeIndex: 0,
    mYear: "",
    mMonth: "",
    rYear: "",
    rMonth: "",
    cylinderNumber: '',
    nominalTestPressure: 0,
    weight: 0, 
    volume: 0, 
    wallThickness: 0,
    disabled: false,
    opacity: 0.9,
    animationData: {},
    hasAdd: false, // 气瓶是否已添加标签
    hasBind: false, // 气瓶是否已绑定标签
    employeeId: wx.getStorageSync('pj_employee_id'),
    employeeName: wx.getStorageSync('pj_employee_name'),
    codefocus: true, // 钢瓶码焦点
    pfocus: false, // 压力焦点
    wfocus: false, // 重量焦点
    vfocus: false, // 容积焦点
    nfocus: false, // 壁厚焦点
    myfocus: false, // 生产年焦点
    mmfocus: false, // 生产月焦点
    ryfocus: false, // 下检年焦点
    rmfocus: false, // 下检月焦点
    snfocus: false, // 集格二维码焦点
    cnfocus: false, // 气瓶二维码焦点
    firstQuery: true
  },

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

    wx.showLoading({
      title: '正在初始化...',
    })
    let cylinderTypeArray = [];
    let manuCodes = [];
    let setList = [];
    // 获取所有气瓶类型
    
    wx.request({
      url: app.globalData.apiUrl+'/getCompanyCylinderTypeVoListByUnitId',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": app.globalData.qcmappversion
      },
      data: { unitId: 1 },
      success: res => {
        let returnData = res.data.data;
        if(returnData.length > 0) {
          for(let i = 0; i < returnData.length; i++) {
            cylinderTypeArray.push({ cylinderTypeId: returnData[i].cylinderTypeId, cylinderTypeName: returnData[i].cylinderTypeName, gasMediumList: returnData[i].gasMediumList });
          }
          that.setData({
            cylinderTypeArray: cylinderTypeArray,
            cylinderTypeIndex: 0,
            cylinderTypeId: cylinderTypeArray[0].cylinderTypeId,
            cylinderTypeName: cylinderTypeArray[0].cylinderTypeName,
            gasMediumArray: cylinderTypeArray[0].gasMediumList,
            gasMediumIndex: 0,
            gasMediumId: cylinderTypeArray[0].gasMediumList[0].gasMediumId,
            gasMediumName: cylinderTypeArray[0].gasMediumList[0].gasMediumName
          });
        }
        that.initDone();
      }
    });

    // 获取气瓶制造单位信息
    wx.request({
      url: app.globalData.apiUrl +'/getCylinderManufacturer',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": app.globalData.qcmappversion
      },
      data: { unitId: 1 },
      success: res => {
        if(res.data.data.length > 0) {
          let returnData = res.data.data;
          for (let i = 0; i < returnData.length; i++) {
            manuCodes.push({ id: returnData[i].id, code: returnData[i].code, name: returnData[i].name, codename: returnData[i].code + '-' + returnData[i].licenseNo + '-' + returnData[i].name.substr(0, 10) });
          }
          that.setData({
            manuCodes: manuCodes,
            cylinderManufacturerName: manuCodes[0].name,
            cylinderManufacturerId: manuCodes[0].id
          });
        }
        that.initDone();
      }
    });

    // 获取集格信息
    wx.request({
      url: app.globalData.apiUrl +'/getSetInfoByUnitId',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": app.globalData.qcmappversion
      },
      data: { unitId: 1 },
      success: res => {
        if (res.data.data.length > 0) {
          let returnData = res.data.data;
          for (var i = 0; i < returnData.length; i++) {
            setList.push({ id: returnData[i].id, setNumber: returnData[i].setNumber, name: returnData[i].name });
          }
          that.setData({ setList: setList });
        }
        that.initDone();
      }
    });
  },

  onShow: function() {
    // 初始化完成
  },

  initDone: function() {
    var that = this;
    if ((that.data.cylinderTypeArray.length > 0) && (that.data.gasMediumArray.length > 0) && (that.data.manuCodes.length > 0) && (that.data.setList.length > 0)) {
      wx.showLoading({
        title: '完成数据初始化',
      })
      setTimeout(function() {
        wx.hideLoading();
      }, 300);
    }
  },

  // 集格模糊查询结果列表
  bindinput: function (e) {
    var that = this;
    if (e.detail.value.length < 5) {
      that.setData({
        forSetList: []
      })
      return;
    };
    // "setNumber": "pj15001"
    let setList = that.data.setList;
    let forSetList = [];
    for(let i = 0; i < setList.length; i++) {
      if (setList[i].setNumber) {
        if (setList[i].setNumber.indexOf(e.detail.value) > -1) {
          forSetList.push(setList[i]);
        }
      }
    }
    that.setData({
      forSetList: forSetList
    })
    that.showAnimation();
  },

  // 选取集格
  onSelectItem: function (e) {
    var that = this;
    let forSetList = that.data.forSetList;
    let index = e.currentTarget.dataset.setIndex;
    let setId = forSetList[index].id;
    let setNumber = forSetList[index].setNumber;
    let setName = forSetList[index].name;
    that.setData({
      setId: setId,
      setNumber: setNumber,
      setName: setName,
      forSetList: []
    })
  }, 

  // 获取当前时间
  getTodayDate: function() {
    var that = this;
    var date = new Date();
    var year = date.getFullYear();
    var month = that.addZero(date.getMonth() + 1);
    var todayDate = year + '-' + month;
    return todayDate;
  },

  // 日期补零
  addZero: function(x) {
    if(x < 10) {
      return '0' + x;
    } else {
      return '' + x;
    }
  },

  // 根据钢印号精确查询气瓶信息
  getCylinderByCode: function (e) {
    var that = this;
    var cylinderCode = e.detail.value;
    that.setData({
      cylinderCode: cylinderCode
    })
    var data = {
      unitId: 1,
      cylinderCode: cylinderCode
    }
    wx.request({
      url: app.globalData.apiUrl + '/getCylinderByCode',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": app.globalData.qcmappversion
      },
      data: data,
      success: res => {
        if (res.data.data != null) {
          let cylinderTypeArray = that.data.cylinderTypeArray;
          let gasMediumArray = that.data.gasMediumArray;
          let manuCodes = that.data.manuCodes;
          for(let i = 0; i < cylinderTypeArray.length; i++) {
            if (cylinderTypeArray[i].cylinderTypeId == res.data.data.cylinderTypeId) {
              let cylinderTypeIndex = i;
              gasMediumArray = cylinderTypeArray[i].gasMediumList;
              that.setData({
                cylinderTypeIndex: cylinderTypeIndex,
                gasMediumArray: gasMediumArray
              })
              for (let j = 0; j < gasMediumArray.length; j++) {
                if (gasMediumArray[j].gasMediumId == res.data.data.gasMediumId) {
                  let gasMediumIndex = j;
                  that.setData({
                    gasMediumIndex: gasMediumIndex
                  })
                }
              }
            }
          }
          for (let k = 0; k < manuCodes.length; k++) {
            if (manuCodes[k].id == res.data.data.cylinderManufacturerId) {
              let codeIndex = k;
              that.setData({
                codeIndex: codeIndex
              })
            }
          }
          that.setData({
            cylinderId: res.data.data.id,
            mYear: res.data.data.cylinderManufacturingDate ? res.data.data.cylinderManufacturingDate.substr(0, 4) : that.getTodayDate().substr(0, 4),
            mMonth: res.data.data.cylinderManufacturingDate ? res.data.data.cylinderManufacturingDate.substr(5, 2) : that.getTodayDate().substr(5, 2),
            rYear: res.data.data.regularInspectionDate ? res.data.data.regularInspectionDate.substr(0, 4) : that.getTodayDate().substr(0, 4),
            rMonth: res.data.data.regularInspectionDate ? res.data.data.regularInspectionDate.substr(5, 2) : that.getTodayDate().substr(5, 2),
            setNumber: res.data.data.setNumber,
            setId: res.data.data.setId,
            nominalTestPressure: res.data.data.nominalTestPressure ? res.data.data.nominalTestPressure : 0,
            weight: res.data.data.weight ? res.data.data.weight : 0,
            volume: res.data.data.volume ? res.data.data.volume : 0,
            wallThickness: res.data.data.wallThickness ? res.data.data.wallThickness : 0,
            cylinderNumber: res.data.data.cylinderNumber ? res.data.data.cylinderNumber : "",
            hasAdd: true
          })
          if (res.data.data.cylinderNumber != null) {
            that.setData({
              disabled: true,
              opacity: 0.3,
              hasBind: true
            })
            wx.showToast({
              title: '该气瓶已绑定二维码',
              icon: "none",
              duration: 2000,
              mask: true
            })
          }
        } else {
          that.setData({
            disabled: false,
            opacity: 0.9,
            hasAdd: false,
            hasBind: false
          })
          if(that.data.firstQuery) {
            that.reset();
          } else {
            that.noFirstReset();
          }
        }
      },
      error: function (e) {
        wx.showToast({
          title: '钢瓶码查询气瓶接口访问失败',
          icon: 'none'
        })
      }
    })
  },

  // 气瓶类型改变
  onCylinderTypeChange: function (e) {
    var that = this;
    var cylinderTypeArray = this.data.cylinderTypeArray;
    let cylinderTypeIndex = e.detail.value;
    that.setData({
      cylinderTypeIndex: cylinderTypeIndex,
      cylinderTypeId: that.data.cylinderTypeArray[cylinderTypeIndex].cylinderTypeId,
      cylinderTypeName: that.data.cylinderTypeArray[cylinderTypeIndex].cylinderTypeName,
      gasMediumArray: that.data.cylinderTypeArray[cylinderTypeIndex].gasMediumList,
      gasMediumIndex: 0,
      gasMediumId: that.data.cylinderTypeArray[cylinderTypeIndex].gasMediumList[0].gasMediumId,
      gasMediumName: that.data.cylinderTypeArray[cylinderTypeIndex].gasMediumList[0].gasMediumName,
    })
  },

  // 介质改变
  onGasMediumChange: function (e) {
    var that = this;
    var gasMediumArray = this.data.gasMediumArray;
    let gasMediumIndex = e.detail.value;
    that.setData({
      gasMediumIndex: gasMediumIndex,
      gasMediumId: gasMediumArray[gasMediumIndex].gasMediumId,
      gasMediumName: gasMediumArray[gasMediumIndex].gasMediumName
    });
  },

  // 气瓶制造商改变
  onManuCodeChange: function(e) {
    var that = this;
    var manuCodes = this.data.manuCodes;
    let codeIndex = e.detail.value;
    that.setData({
      codeIndex: codeIndex,
      cylinderManufacturerName: that.data.manuCodes[codeIndex].name,
      cylinderManufacturerId: that.data.manuCodes[codeIndex].id,
      myfocus: true
    });
  },

  // 压力改变
  onPressureChange: function(e) {
    if (e.detail.value.length > 0) {
      this.setData({ nominalTestPressure: e.detail.value });
    }
  },

  // 重量改变
  onWeightChange: function (e) {
    if (e.detail.value.length > 0) {
      this.setData({ weight: e.detail.value });
    }
  },

  // 容积改变
  onVolumeChange: function (e) {
    if (e.detail.value.length > 0) {
      this.setData({ volume: e.detail.value });
    }
  },

  // 壁厚改变
  onNessChange: function (e) {
    if (e.detail.value.length > 0) {
      this.setData({ wallThickness: e.detail.value });
    }
  },

  // 集格扫码
  onSetScan: function() {
    var that = this;
    wx.scanCode({
      success: (res) => {
        if (res.result.indexOf("/set/code/") != -1) {
          var setCode = res.result.indexOf("/set/code/");
          var setList = that.data.setList;
          setCode = res.result.substring(setCode + 10);
          for(let i = 0; i < setList.length; i++) {
            if(setList[i].id == setCode) {
              let setId = setList[i].id;
              let setNumber = setList[i].setNumber;
              let setName = setList[i].name;
              that.setData({
                setId: setId,
                setNumber: setNumber,
                setName: setName,
                forSetList: [],
                pfocus: true
              })
            }
          }
        } else {
          wx.showToast({
            title: '该码不符合集格码规范',
            icon: 'none',
            mask: true,
            duration: 1500
          })
        }
      },
      fail: (err) => {
        that.setData({
          forSetList: [],
          snfocus: true
        })
      }
    })
  },

  // 气瓶扫码
  onScan: function () {
    var that = this;
    wx.scanCode({
      success: (res) => {
        if (res.result.indexOf("0001") != -1) {
          var cylinderCode = res.result;
          var cylinderNumber = cylinderCode.substring(cylinderCode.length - 11);
          if (cylinderNumber.length != 11) {
            wx.showToast({
              title: '该气瓶码长度不正确',
              icon: 'none',
              mask: true,
              duration: 1500
            })
          } else {
            that.setData({
              cylinderNumber: cylinderNumber
            })
          }
        } else {
          wx.showToast({
            title: '请扫描气瓶二维码或条码',
            icon: 'none',
            mask: true,
            duration: 1500
          })
        }
      },
      fail: (err) => {
        that.setData({
          cnfocus: true
        })
      }
    })
  },

  // 手动输入标签码
  manualInput: function(e) {
    var that = this;
    if(e.detail.value.length > 0) {
      that.setData({
        cylinderNumber: e.detail.value
      })
    }
  },

  // 动画
  showAnimation: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease'
    });
    animation.opacity(1).step();
    that.setData({
      animationData: animation.export()
    })
  },

  // 重置data
  reset: function() {
    var that = this;
    that.setData({
      cylinderId: '',
      cylinderTypeIndex: 0,
      cylinderTypeId: that.data.cylinderTypeArray[0].cylinderTypeId,
      cylinderTypeName: that.data.cylinderTypeArray[0].cylinderTypeName,
      gasMediumArray: that.data.cylinderTypeArray[0].gasMediumList,
      gasMediumIndex: 0,
      gasMediumId: that.data.cylinderTypeArray[0].gasMediumList[0].gasMediumId,
      gasMediumName: that.data.cylinderTypeArray[0].gasMediumList[0].gasMediumName,
      setId: -1,
      setNumber:"",
      setName: "",
      forSetList: [],
      cylinderManufacturerName: that.data.manuCodes[0].name,
      cylinderManufacturerId: that.data.manuCodes[0].id,
      codeIndex: 0,
      mYear: "",
      mMonth: "",
      rYear: "",
      rMonth: "",
      cylinderNumber: '',
      nominalTestPressure: 0,
      weight: 0, 
      volume: 0, 
      wallThickness: 0,
      disabled: false,
      opacity: 0.9,
      hasAdd: false,
      hasBind: false
    })
  },

  // 再次绑定重置data
  againReset: function () {
    var that = this;
    that.setData({
      cylinderCode: '',
      cylinderId: '',
      setId: -1,
      setNumber: "",
      setName: "",
      forSetList: [],
      mYear: "",
      mMonth: "",
      rYear: "",
      rMonth: "",
      cylinderNumber: '',
      nominalTestPressure: 0,
      weight: 0,
      volume: 0,
      wallThickness: 0,
      disabled: false,
      opacity: 0.9,
      hasAdd: false,
      hasBind: false,
      codefocus: true
    })
  },

  // 不是首次绑定重置data
  noFirstReset: function () {
    var that = this;
    that.setData({
      cylinderId: '',
      setId: -1,
      setNumber: "",
      setName: "",
      forSetList: [],
      mYear: "",
      mMonth: "",
      rYear: "",
      rMonth: "",
      cylinderNumber: '',
      nominalTestPressure: 0,
      weight: 0,
      volume: 0,
      wallThickness: 0,
      disabled: false,
      opacity: 0.9,
      hasAdd: false,
      hasBind: false
    })
  },

  // 提交动作
  onSubmit: function () {
    var that = this;
    if(that.data.hasAdd && !that.data.hasBind) {
      that.addNumber(that.data.cylinderId);
    } else if (!that.data.hasAdd && !that.data.hasBind){
      that.addCylinder();
    } else {
      wx.showToast({
        title: '该气瓶已绑码',
        icon: 'none'
      })
    }
  },

  addCylinder: function() {
    var that = this;
    var data = {
      unitId: 1,
      cylinderCode: that.data.cylinderCode,
      cylinderTypeId: that.data.cylinderTypeId,
      gasMediumId: that.data.gasMediumId,
      manufacturingDate: that.data.mYear + '-' + that.data.mMonth + '-' + util.getDaysOfMonth(that.data.mYear + '-' + that.data.mMonth),
      cylinderTypeName: that.data.cylinderTypeName,
      gasMediumName: that.data.gasMediumName,
      regularInspectionDate: that.data.rYear + '-' + that.data.rMonth + '-' + util.getDaysOfMonth(that.data.rYear + '-' + that.data.rMonth),
      nominalTestPressure: that.data.nominalTestPressure,
      weight: that.data.weight,
      volume: that.data.volume,
      wallThickness: that.data.wallThickness,
      cylinderNumber: that.data.cylinderNumber,
      cylinderManufacturerName: that.data.cylinderManufacturerName,
      cylinderManufacturerId: that.data.cylinderManufacturerId,
      employeeId: that.data.employeeId,
      employeeName: that.data.employeeName
    };
    if (that.data.setId != -1) {
      data.setId = that.data.setId;
      data.setNumber = that.data.setNumber;
    }
    if (that.checkNull(data.cylinderCode) && that.checkNull(data.cylinderTypeId) && that.checkNull(data.cylinderTypeName) && that.checkNull(data.gasMediumId) && that.checkNull(data.gasMediumName) && that.checkNull(data.cylinderManufacturerName) && that.checkNull(that.data.mYear) && that.checkNull(that.data.mMonth) && that.checkNull(that.data.rYear) && that.checkNull(that.data.rMonth) && that.checkNull(data.nominalTestPressure) && that.checkNull(data.weight) && that.checkNull(data.volume) && that.checkNull(data.wallThickness) && that.checkRule(data.cylinderNumber) && that.checkUserInfoNull(data.employeeId) && that.checkUserInfoNull(data.employeeName)) {
      data.manufacturingDate = that.data.mYear + '-' + that.data.mMonth + '-' + util.getDaysOfMonth(that.data.mYear + '-' + that.data.mMonth);
      data.regularInspectionDate = that.data.rYear + '-' + that.data.rMonth + '-' + util.getDaysOfMonth(that.data.rYear + '-' + that.data.rMonth);
      wx.request({
        url: app.globalData.apiUrl + '/addCylinder',
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "qcmappversion": app.globalData.qcmappversion
        },
        data: data,
        success: res => {
          if (res.data.msg == "成功") {
            that.setData({
              cylinderId: res.data.data.id,
              firstQuery: false
            })
            wx.showModal({
              title: '提示',
              content: "成功绑定,是否继续?",
              success: function (res) {
                if (res.confirm) {
                  that.againReset();
                  // wx.redirectTo({
                  //   url: '/pages/bind/bind'
                  // });
                } else {
                  wx.switchTab({
                    url: '/pages/index/index',
                  })
                }
              }
            });
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 2000
            });
          }
        }
      });
    }
  },

  addNumber: function (cylinderId = null) {
    var that = this;
    if (that.checkNull(cylinderId) && that.checkRule(that.data.cylinderNumber) && that.checkUserInfoNull(that.data.employeeId) && that.checkUserInfoNull(that.data.employeeName)) {
      wx.request({
        url: app.globalData.apiUrl + '/addNumber',
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "qcmappversion": app.globalData.qcmappversion
        },
        data: {
          unitId: 1,
          cylinderId: cylinderId,
          cylinderNumber: that.data.cylinderNumber,
          employeeId: that.data.employeeId,
          employeeName: that.data.employeeName
        },
        success: res => {
          if (res.data.msg == "成功") {
            that.setData({
              firstQuery: false
            })
            wx.showModal({
              title: '提示',
              content: "成功绑定,是否继续?",
              success: function (res) {
                if (res.confirm) {
                  that.againReset();
                  // wx.redirectTo({
                  //   url: '/pages/bind/bind'
                  // });
                } else {
                  wx.switchTab({
                    url: '/pages/index/index',
                  })
                }
              }
            });
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 2000
            });
          }
        }
      });
    }
  },

  checkNull: function(p) {
    p = String(p);
    if (p == "" || p == null) {
      wx.showToast({
        title: '请检查有无漏填项！',
        icon: 'none'
      })
      return false;
    } else {
      return true;
    }
  },

  checkUserInfoNull: function(x) {
    x = String(x);
    if (x == "" || x == null) {
      wx.showToast({
        title: '请检查有无漏填项！',
        icon: 'none'
      })
      return false;
    } else {
      return true;
    }
  },

  checkRule: function(q) {
    q = String(q);
    if (q == "" || q == null) {
      wx.showToast({
        title: '请检查有无漏填项！',
        icon: 'none'
      })
      return false;
    } else {
      if (q.length != 11) {
        wx.showToast({
          title: '请保证标签码长度为 11',
          icon: 'none'
        })
        return false;
      } else {
        if (q.substr(0, 4) != "0001") {
          wx.showToast({
            title: '所填标签码不符合规范',
            icon: 'none'
          })
          return false;
        } else {
          return true;
        }
      }
    }
  },

  // 输入框焦点自动转移
  pInputCheck: function(e) {
    var that = this;
    if(e.detail.value.length == 2) {
      that.setData({
        wfocus: true
      })
    }
  },

  wInputCheck: function (e) {
    var that = this;
    let input = e.detail.value;
    if(input.indexOf('.') > -1) {
      let x = input.split('.')[1];
      if(x.length == 1) {
        that.setData({
          vfocus: true
        })
      }
    }
  },

  vInputCheck: function (e) {
    var that = this;
    let input = e.detail.value;
    if (input.indexOf('.') > -1) {
      let x = input.split('.')[1];
      if (x.length == 1) {
        that.setData({
          nfocus: true
        })
      }
    }
  },

  nInputCheck: function (e) {
    var that = this;
    let input = e.detail.value;
    if (input.indexOf('.') > -1) {
      let x = input.split('.')[1];
      if (x.length == 1) {
        that.onScan();
      }
    }
  },

  myInputCheck: function(e) {
    var that = this;
    if (e.detail.value.length == 2) {
      let myYear = e.detail.value;
      let myNumber = Number(myYear);
      if(myNumber < 60) {
        myYear = '20' + myYear;
      } else {
        myYear = '19' + myYear;
      }
      that.setData({
        mYear: myYear,
        mmfocus: true
      })
    }
  },

  mmInputCheck: function(e) {
    var that = this;
    let flag = false;
    if (e.detail.value.length > 0) {
      that.setData({
        mMonth: that.addZero(Number(e.detail.value))
      })
    }
    if ((e.detail.value.length - 1) == 2) {
      let checkTime = 0;
      let fiveArray = ['氢气', '氮气', '氩气', '氦气'];
      let threeArray = ['二氧化碳', '氧气', '混合气-腐蚀性', '混合气-非腐蚀性', '高纯空气'];
      let mYear = that.data.mYear;
      let mMonth = that.data.mMonth;
      let todayDate = that.getTodayDate();
      let tYear = todayDate.split('-')[0];
      let tMonth = todayDate.split('-')[1];
      let cylinderTypeName = that.data.cylinderTypeArray[that.data.cylinderTypeIndex].cylinderTypeName;
      let gasMediumName = that.data.gasMediumArray[that.data.gasMediumIndex].gasMediumName;
      if (cylinderTypeName == '钢制无缝气瓶' && fiveArray.indexOf(gasMediumName) > -1) {
        checkTime = 5;
      }
      if (cylinderTypeName == '钢制无缝气瓶' && threeArray.indexOf(gasMediumName) > -1) {
        checkTime = 3;
      }
      if (Number(tYear + tMonth) <= Number((Number(mYear) + checkTime) + mMonth)) {
        that.setData({
          rYear: Number(mYear) + checkTime,
          rMonth: mMonth,
          pfocus: true
        })
      } else {
        that.setData({
          rYear: '',
          rMonth: '',
          ryfocus: true
        })
      }
    }
  },

  ryInputCheck: function (e) {
    var that = this;
    if (e.detail.value.length == 2) {
      let mrYear = e.detail.value;
      let mrNumber = Number(mrYear);
      if (mrNumber < 60) {
        mrYear = '20' + mrYear;
      } else {
        mrYear = '19' + mrYear;
      }
      that.setData({
        rYear: mrYear,
        rmfocus: true
      })
    }
  },

  rmInputCheck: function (e) {
    if (e.detail.value.length > 0) {
      this.setData({
        rMonth: this.addZero(Number(e.detail.value))
      })
    }
    if ((e.detail.value.length - 1) == 2) {
      this.setData({
        pfocus: true
      })
    }
  },

  // 日期获取焦点清除内容
  mybfocus: function() {
    this.setData({
      mYear: ''
    })
  },

  mmbfocus: function () {
    this.setData({
      mMonth: ''
    })
  },

  rybfocus: function () {
    this.setData({
      rYear: ''
    })
  },

  rmbfocus: function () {
    this.setData({
      rMonth: ''
    })
  }
})
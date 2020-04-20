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
    manufacturingDate: "",
    regularInspectionDate: "",
    cylinderNumber: '',
    nominalTestPressure: 0,
    weight: 0, 
    volume: 0, 
    wallThickness: 0,
    disabled: false,
    opacity: 0.9,
    animationData: {},
    hasAdd: false, // 气瓶是否已添加标签
    hasBind: false,
    employeeId: wx.getStorageSync('pj_employee_id'),
    employeeName: wx.getStorageSync('pj_employee_name')
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
    let manufacturingDate = "";
    let regularInspectionDate = "";
    that.setData({
      manufacturingDate: that.getTodayDate(),
      regularInspectionDate: that.getTodayDate()
    })
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
            manuCodes.push({ id: returnData[i].id, code: returnData[i].code, name: returnData[i].name, codename: returnData[i].code + '-' + returnData[i].name });
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
    var day = that.addZero(date.getDate());
    var todayDate = year + '-' + month + '-' + day;
    return todayDate;
  },

  // 日期补零
  addZero: function(x) {
    if(x < 10) {
      return '0' + x;
    } else {
      return x;
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
            manufacturingDate: res.data.data.cylinderManufacturingDate ? res.data.data.cylinderManufacturingDate.substr(0, 10) : that.getTodayDate(),
            regularInspectionDate: res.data.data.regularInspectionDate ? res.data.data.regularInspectionDate.substr(0, 10) : that.getTodayDate(),
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
          that.reset();
        }
      },
      error: function (e) {
        alert("钢瓶码查询气瓶接口访问失败");
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
      cylinderManufacturerId: that.data.manuCodes[codeIndex].id
    });
  },

  // 生产日期改变
  bindManufacturingDateChange: function (e) {
    this.setData({
      manufacturingDate: e.detail.value
    })
  },

  // 下检日期改变
  bindInspectionDateChange: function (e) {
    this.setData({
      regularInspectionDate: e.detail.value
    })
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

  // 扫码动作
  onScan() {
    var that = this;
    wx.scanCode({
      success: (res) => {
        let msg = '';
        if (res.scanType === 'WX_CODE' && res.result === '') {
          msg = 'Error!'
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
          });
        } else {
          //先处理短码，然后处理长码
          var url = res.result;
          var shortArr = url.split("/");
          var code;
          if(shortArr.length == 4) {
            code = shortArr[3]
          } else {
            var longArr = url.split("=")
            if (longArr.length>0) {
              code = longArr[1]
            }
          }
          if(code.length != 11) {
            wx.showToast({
              title: "该气瓶编码不符合规范",
              icon: 'none',
              duration: 2000
            });
          } else {
            that.setData({cylinderNumber:code})
            wx.showToast({
              title: "扫描成功"
            });
          }
        }
      }
    })
  },

  // 动画
  showAnimation: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 3000,
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
      manufacturingDate: that.getTodayDate(),
      regularInspectionDate: that.getTodayDate(),
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
      cylinderId: '',
      setId: -1,
      setNumber: "",
      setName: "",
      forSetList: [],
      cylinderManufacturerName: that.data.manuCodes[0].name,
      cylinderManufacturerId: that.data.manuCodes[0].id,
      codeIndex: 0,
      manufacturingDate: that.getTodayDate(),
      regularInspectionDate: that.getTodayDate(),
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
      manufacturingDate: that.data.manufacturingDate,
      cylinderTypeName: that.data.cylinderTypeName,
      gasMediumName: that.data.gasMediumName,
      regularInspectionDate: that.data.regularInspectionDate,
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
    if (that.checkNull(data.cylinderCode) && that.checkNull(data.cylinderTypeId) && that.checkNull(data.cylinderTypeName) && that.checkNull(data.gasMediumId) && that.checkNull(data.gasMediumName) && that.checkNull(data.cylinderManufacturerName) && that.checkNull(data.manufacturingDate) && that.checkNull(data.nominalTestPressure) && that.checkNull(data.weight) && that.checkNull(data.volume) && that.checkNull(data.wallThickness) && that.checkRule(data.cylinderNumber) && that.checkUserInfoNull(data.employeeId) && that.checkUserInfoNull(data.employeeName)) {
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
              cylinderId: res.data.data.id
            })
            wx.showModal({
              title: '提示',
              content: "成功绑定,是否继续?",
              success: function (res) {
                console.log(JSON.stringify(res.confirm));
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
            wx.showModal({
              title: '提示',
              content: "成功绑定,是否继续?",
              success: function (res) {
                console.log(JSON.stringify(res.confirm));
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
    if (p == "" || p == null) {
      alert("请检查有无漏填项！");
      return false;
    } else {
      return true;
    }
  },

  checkUserInfoNull: function(x) {
    if (x == "" || x == null) {
      alert("登录者信息缺失！");
      return false;
    } else {
      return true;
    }
  },

  checkRule: function(q) {
    if (q == "" || q == null) {
      alert("请检查有无漏填项！");
      return false;
    } else {
      if (q.length != 11) {
        alert("请保证标签码长度为 11");
        return false;
      } else {
        if (q.substr(0, 4) != "0001") {
          alert("所填标签码不符合规范");
          return false;
        } else {
          return true;
        }
      }
    }
  }
})
var util = require("../../utils/util.js")
var app = getApp();
Page({
  onShareAppMessage() {
    return {
      title: 'scroll-view',
      path: 'page/component/pages/scroll-view/scroll-view'
    }
  },
  data: {
    cylinderTypeArray:[],
    gasItemsArray:[],
    gasArray:[],
    cylinderTypeItems: [],
    cylinderTypeIndex: 0,
    gasItems: [],
    gasIndex: 0,
    typeId: 0,
    setId: 0,
    setNumber:"",
    cylinderTypeId: 1,
    cylinderTypeName: "钢制无缝气瓶",
    gasMediumName: "氢气",
    gasMediumId: 3,
    manuCodes: [],
    codename: "sg",
    codeIndex: 0,
    manufacturingDate: new Date().getFullYear() + "-" + ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + "-" + ((new Date().getDate() < 10) ? ("0" + new Date().getDate()): (new Date().getDate())),
    regularInspectionDate: new Date().getFullYear() + "-" + ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + "-" + ((new Date().getDate() < 10) ? ("0" + new Date().getDate()) : (new Date().getDate())),
    phone: '',
    vrcode: '',
    cylinderNumber: '',
    nominalTestPressure: 0,
    weight: 0, 
    volume: 0, 
    wallThickness: 0,
    inputValue: '', //点击结果项之后替换到文本框的值
    adapterSource: [], //本地匹配源
    bindSource: [], //绑定到页面的数据，根据用户输入动态变化
    hideScroll: true,
    arrayHeight: 0,
    disabled: false,
    opacity: 0.9
  },

  onLoad: function (options) {
    var that = this;
    that.setData({ "disabled": false })
    var cylinderTypeItems = [];
    var cylinderTypeArray =[];
    var gasItemsArray = [];
    var gasArray = [];
    var gasItems = [];
    let manuCodes = [];
    let adapterSource = [];
    //获取所有气瓶类型
    wx.request({
      url: app.globalData.apiUrl+'/getCompanyCylinderTypeVoListByUnitId',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": app.globalData.qcmappversion
      },
      data: { unitId: 1 },
      success: res => {
        var returnData = res.data.data;
        if(returnData.length > 0) {
          for(let i =0; i<returnData.length; i++) {
            cylinderTypeItems.push(returnData[i].cylinderTypeName);
            cylinderTypeArray.push({ id: returnData[i].cylinderTypeId, name: returnData[i].cylinderTypeName});
            var tmpArray = [];
            for(var j =0; j<returnData[i].gasMediumList.length;j++) {
              if (gasArray.indexOf(returnData[i].gasMediumList[j].gasMediumName)<0) {
                gasArray.push({ "id": returnData[i].gasMediumList[j].gasMediumId,"name":returnData[i].gasMediumList[j].gasMediumName});
              }
              tmpArray.push(returnData[i].gasMediumList[j].gasMediumName);
            }
            gasItemsArray.push(tmpArray.reverse());
          }
          that.setData({
            "cylinderTypeItems": cylinderTypeItems,
            "gasItems": util.putElementToFirst(gasItemsArray[0],'氢气'),
            "gasArray": gasArray,
            "cylinderTypeArray": cylinderTypeArray,
            "gasItemsArray": gasItemsArray
          });
        }
      }
    });

    //获取气瓶制造单位信息
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
          for (var i = 0; i < res.data.data.length; i++) {
            if(i == 0) {
              that.setData({ cylinderManufacturerName: res.data.data[0].name });
              that.setData({ cylinderManufacturerId: res.data.data[0].id });
            }
            manuCodes.push(res.data.data[i].code);
          }
          that.setData({ manuCodes: manuCodes});
        }
      }
    });

    //获取集格信息
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
          for (var i = 0; i < res.data.data.length; i++) {
            adapterSource.push(res.data.data[i].setNumber + "-" + res.data.data[i].name);
          }
          that.setData({ adapterSource: adapterSource });
        }
      }
    });
  },

  onReady: function () {
  },

  onTypeChange: function (e) {
    var cylinderTypeArray = this.data.cylinderTypeArray;
    let cylinderType = cylinderTypeArray[e.detail.value];

    this.setData({ "cylinderTypeId": cylinderType.id, "cylinderTypeIndex": e.detail.value, "cylinderTypeName": cylinderType.name })
    //气瓶类型是与气瓶介质关联的
    var gasItemsArray = this.data.gasItemsArray
    this.setData({ typeId: e.detail.value});
    this.setData({ gasItems: gasItemsArray[e.detail.value]})
    //如果不选充装介质的话，需要给一个充装介质一个默认值
    if(e.detail.value == 5) {
      this.setData({ gasMediumId: 2 })
      this.setData({gasMediumName: "二氧化碳" })
    } else if (e.detail.value == 4) {
      this.setData({ gasMediumId: 20 })
      this.setData({ gasMediumName: "液氮" })
    } else if (e.detail.value == 3) {
      this.setData({ gasMediumId: 19 })
      this.setData({ gasMediumName: "液氧" })
    } else if (e.detail.value == 2) {
      this.setData({ gasMediumId: 27 })
      this.setData({ gasMediumName: "标准气" })
    } else if (e.detail.value == 1) {
      this.setData({ gasMediumId: 12 })
      this.setData({ gasMediumName: "氯气" })
    } else if (e.detail.value == 0) {
      this.setData({ gasMediumId: 3 })
      this.setData({ gasMediumName: "氢气" })
    }
    //默认值结束赋值
  },

  onGasChange: function (e) {
    var that = this;
    var gasArray = this.data.gasArray;
    var gasItemsArray = this.data.gasItemsArray;
    var gasMediumName = gasItemsArray[that.data.typeId][e.detail.value]
    that.setData({ gasIndex: e.detail.value });
    var gasMediumId;
    for(var i=0;i<gasArray.length;i++) {
      if (gasMediumName == gasArray[i].name) {
        gasMediumId = gasArray[i].id;
        
      }
    };
    this.setData({ gasMediumId: gasMediumId });
    this.setData({ gasMediumName: gasMediumName });
  },

  onManuCodeChange: function(e) {
    var that = this;
    let code = that.data.manuCodes[e.detail.value]

    that.setData({codeIndex:e.detail.value});
    wx.request({
      url: app.globalData.apiUrl +'/getCylinderManufacturer',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": app.globalData.qcmappversion
      },
      data: { unitId: 1, code: code },
      success: res => {
        if (res.data.data.length > 0) {
          that.setData({ cylinderManufacturerName: res.data.data[0].name });
          that.setData({ cylinderManufacturerId: res.data.data[0].id });
        } 
      }
    });
  },

  bindManufacturingDateChange: function (e) {
    this.setData({
      manufacturingDate: e.detail.value
    })
  },

  bindInspectionDateChange: function (e) {
    this.setData({
      regularInspectionDate: e.detail.value
    })
  },

  onPressureChange: function(e) {
    var that = this
    if (e.detail.value.length > 0) {
      that.setData({ nominalTestPressure: e.detail.value });
    }
  },

  onWeightChange: function (e) {
    var that = this
    if (e.detail.value.length > 0) {
      that.setData({ weight: e.detail.value });
    }
  },

  onVolumeChange: function (e) {
    var that = this
    if (e.detail.value.length > 0) {
      that.setData({ volume: e.detail.value });
    }
  },

  onNessChange: function (e) {
    var that = this
    if (e.detail.value.length > 0) {
      that.setData({ wallThickness: e.detail.value });
    }
  },

  onScan() {
    var that = this;
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
              title: "该气瓶编码有问题",
              icon: 'none',
              duration: 2000
            });
          } else {
            that.setData({cylinderNumber:code})
          }

        }
      }
    })
  },

  onChangeCode: function(e) {
    var that = this
    if(e.detail.value.length>0){
      that.setData({cylinderCode: e.detail.value});
    }
  },

  onInput: function (e) {
  },

  onSend: function () {

  },


  onSubmit: function () {
    if (this.data.cylinderNumber == "") {
      wx.showToast({
        title: "数据不全",
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    if (this.data.disabled == true) {
      wx.showToast({
        title: "禁止重复提交",
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    //不让重复提交
    this.setData({
      disabled: true,
      opacity: 0.3
    });
    console.log({ unitId: 1, cylinderCode: this.data.cylinderCode, cylinderTypeId: this.data.cylinderTypeId, gasMediumId: this.data.gasMediumId, manufacturingDate: this.data.manufacturingDate, cylinderTypeName: this.data.cylinderTypeName, gasMediumName: this.data.gasMediumName, regularInspectionDate: this.data.regularInspectionDate, setId: this.data.setId, setNumber: this.data.setNumber, nominalTestPressure: this.data.nominalTestPressure, weight: this.data.weight, volume: this.data.volume, wallThickness: this.data.wallThickness, cylinderNumber: this.data.cylinderNumber, "cylinderManufacturerName": this.data.cylinderManufacturerName, "cylinderManufacturerId": this.data.cylinderManufacturerId, "employeeId": wx.getStorageSync('pj_employee_id'), "employeeName": wx.getStorageSync('pj_employee_name') });
    wx.request({
      url: app.globalData.apiUrl +'/addCylinder',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": app.globalData.qcmappversion
      },
      data: { unitId: 1, cylinderCode: this.data.cylinderCode, cylinderTypeId: this.data.cylinderTypeId, gasMediumId: this.data.gasMediumId, manufacturingDate: this.data.manufacturingDate, cylinderTypeName: this.data.cylinderTypeName, gasMediumName: this.data.gasMediumName, regularInspectionDate: this.data.regularInspectionDate, setId: this.data.setId, setNumber: this.data.setNumber, nominalTestPressure: this.data.nominalTestPressure, weight: this.data.weight, volume: this.data.volume, wallThickness: this.data.wallThickness, cylinderNumber: this.data.cylinderNumber, "cylinderManufacturerName": this.data.cylinderManufacturerName, "cylinderManufacturerId": this.data.cylinderManufacturerId, "employeeId": wx.getStorageSync('pj_employee_id'), "employeeName": wx.getStorageSync('pj_employee_name') },
      success: res => {
        console.log(res);
        if (res.data.msg == "成功" && res.data.code == 200) {
          var redirectStatus = 0;
          wx.showModal({
            title: '提示',
            content: "添加气瓶成功,是否继续?",
            success: function (res) {
              if (res.confirm) {
                redirectStatus = 1;
              }
              if(redirectStatus == 1) {
                wx.redirectTo({
                  url: '/pages/bind/bind'
                });
              } else {
                wx.redirectTo({
                  url: '/pages/index/index'
                });
                /*wx.navigateBack({
                  delta: 1
                });*/
              }

            }
          });
        } else {
          wx.showToast({
            title: "添加气瓶失败，请检查信息内容",
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

  //当键盘输入时，触发input事件
  bindinput: function (e) {
    if(e.detail.value.length<5)  return;
    //用户实时输入值
    var prefix = e.detail.value
    //匹配的结果
    var newSource = []
    if (prefix != "") {
      // 对于数组array进行遍历，功能函数中的参数 `e`就是遍历时的数组元素值。
      this.data.adapterSource.forEach(function (e) {
        var word = new String(e);
        // 用户输入的字符串如果在数组中某个元素中出现，将该元素存到newSource中
        if (word.search(prefix) != -1){
          newSource.push(e)
        } 
      })
    };

    // 如果匹配结果存在，那么将其返回，相反则返回空数组
    if (newSource.length != 0) {
      this.setData({
        // 匹配结果存在，显示自动联想词下拉列表
        hideScroll: false,
        bindSource: newSource,
        arrayHeight: newSource.length * 71
      })
    } else {
      this.setData({
        // 匹配无结果，不现实下拉列表
        hideScroll: true,
        bindSource: []
      })
    }
  },

  // 用户点击选择某个联想字符串时，获取该联想词，并清空提醒联想词数组
  itemtap: function (e) {
    var that = this;
    var originInputValue = e.target.id
    var inputValueArrray = originInputValue.split("-")
    this.setData({
      inputValue: inputValueArrray[0],
      // 当用户选择某个联想词，隐藏下拉列表
      hideScroll: true,
      bindSource: []
    })
      
    //var setNumber = e.detail.value
    var setNumber = inputValueArrray[0]
    if (setNumber.length > 0) {
      //获取集格信息进行比较，拿到setId
      wx.request({
        url: app.globalData.apiUrl + '/getSetInfoByUnitId',
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "qcmappversion": app.globalData.qcmappversion
        },
        data: { unitId: 1, setNumber: setNumber },
        success: res => {
          if (res.data.data.length > 0) {
            that.setData({ setNumber: setNumber });
            that.setData({ setId: res.data.data[0].id });
          } else {
            that.setData({ setNumber: "" });
            that.setData({ setId: 0 });
            wx.showToast({
              title: "您输入的集格编号不存在",
              icon: 'none',
              duration: 2000
            });
          }
        }
      });
    }
  },

})
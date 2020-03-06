Page({
  onShareAppMessage() {
    return {
      title: 'scroll-view',
      path: 'page/component/pages/scroll-view/scroll-view'
    }
  },
  data: {
    cylinderTypeItems: ["钢制无缝气瓶" , "钢制焊接气瓶", "铝合金无缝气瓶","绝热焊接瓶" ,"液氮生物容器","钢制无缝气瓶 - 大容积"],
    cylinderTypeIndex: 0,
    gasItems: ["氢气", "氧气", "二氧化碳", "七氟丙烷", "氮气", "氩气", "六氟化硫", "甲烷", "二氧化硫", "硫化氢", "二氧化氮", "氦气", "一氧化碳", "高纯空气", "混合气-腐蚀性", "混合气-非腐蚀性"],
    gasIndex: 0,
    typeId: 0,
    cylinderTypeId: 1,
    cylinderTypeName: "钢制无缝气瓶",
    gasMediumName: "氢气",
    gasMediumId: 3,
    manuCodes: ["sg", "jp", "YA", "YF", "RL", "NCTE", "SZ", "FL", "KC", "ZJD"],
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
  },

  onLoad: function (options) {
    var that = this
    let manuCodes = []
    let adapterSource = []
    //获取气瓶制造单位信息
    wx.request({
      url: 'http://localhost:18090/api/getCylinderManufacturer',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": "1.0.5"
      },
      data: { unitId: 1 },
      success: res => {
        console.log(res);
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
      url: 'http://localhost:18090/api/getSetInfoByUnitId',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": "1.0.5"
      },
      data: { unitId: 1 },
      success: res => {
        console.log(res);
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
    var cylinderTypeArray = [{ id: 1, name: "钢制无缝气瓶" }, { id: 2, name: "钢制焊接气瓶" }, { id: 3, name: "铝合金无缝气瓶" }, { id: 4, name: "绝热焊接瓶" }, { id: 5, name: "液氮生物容器" }, { id: 7, name: "钢制无缝气瓶 - 大容积" }];
    let cylinderType = cylinderTypeArray[e.detail.value];
    this.setData({ cylinderTypeId: cylinderType.id })
    this.setData({ cylinderTypeName: cylinderType.name })
    //气瓶类型是与气瓶介质关联的
    var gasItemsArray = [["氢气", "氧气", "二氧化碳", "七氟丙烷", "氮气", "氩气", "六氟化硫", "甲烷", "二氧化硫", "硫化氢", "二氧化氮", "氦气", "一氧化碳", "高纯空气", "混合气-腐蚀性", "混合气-非腐蚀性"],["氯气", "液氨", "溶解乙炔", "丙烷", "液化石油气", "液化天然气"],["标准气", "氦气", "一氧化碳", "高纯空气"],["液氧", "液氮", "液氩"],["液氮"],["二氧化碳"]];
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
    console.log(e.detail.value);
    var that = this;
    var gasArray = [{ id: 1, name: "氧气" }, { id: 2, name: "二氧化碳" }, { id: 3, name: "氢气" }, { id: 4, name: "七氟丙烷" }, { id: 5, name: "氮气" }, { id: 6, name: "氩气" }, { id: 7, name: "六氟化硫" }, { id: 8, name: "甲烷" }, { id: 9, name: "二氧化硫" }, { id: 10, name: "硫化氢" }, { id: 11, name: "二氧化氮" }, { id: 12, name: "氯气" }, { id: 13, name: "液氨" }, { id: 14, name: "溶解乙炔" }, { id: 15, name: "丙烷" }, { id: 16, name: "液化石油气" }, { id: 17, name: "液化天然气" }, { id: 18, name: "标准气" }, { id: 19, name: "液氧" }, { id: 20, name: "液氮" }, { id: 21, name: "液氩" }, { id: 22, name: "氦气" }, { id: 23, name: "一氧化碳" }, { id: 24, name: "高纯空气" }, { id: 25, name: "混合气-腐蚀性" }, { id: 26, name: "混合气-非腐蚀性" }, { id: 27, name: "标准气" }];
    var gasItemsArray = [["氢气", "氧气", "二氧化碳", "七氟丙烷", "氮气", "氩气", "六氟化硫", "甲烷", "二氧化硫", "硫化氢", "二氧化氮", "氦气", "一氧化碳", "高纯空气", "混合气-腐蚀性", "混合气-非腐蚀性"], ["氯气", "液氨", "溶解乙炔", "丙烷", "液化石油气", "液化天然气"], ["标准气", "氦气", "一氧化碳", "高纯空气"], ["液氧", "液氮", "液氩"], ["液氮"], ["二氧化碳"]];
    var gasMediumName = gasItemsArray[that.data.typeId][e.detail.value]
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
    console.log(e);
    var that = this;
    let code = that.data.manuCodes[e.detail.value]

    that.setData({codeIndex:e.detail.value});
    wx.request({
      url: 'http://localhost:18090/api/getCylinderManufacturer',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": "1.0.5"
      },
      data: { unitId: 1, code: code },
      success: res => {
        console.log(res);
        console.log(res.data.data[0].id);
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
        console.log(res);
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
          console.log(shortArr.length);
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
    console.log({ unitId: 1, cylinderCode: this.data.cylinderCode, cylinderTypeId: this.data.cylinderTypeId, gasMediumId: this.data.gasMediumId, manufacturingDate: this.data.manufacturingDate, cylinderTypeName: this.data.cylinderTypeName, gasMediumName: this.data.gasMediumName, regularInspectionDate: this.data.regularInspectionDate, setId: this.data.setId, setNumber: this.data.setNumber, nominalTestPressure: this.data.nominalTestPressure, weight: this.data.weight, volume: this.data.volume, wallThickness: this.data.wallThickness, cylinderNumber: this.data.cylinderNumber, "cylinderManufacturerName": this.data.cylinderManufacturerName, "cylinderManufacturerId": this.data.cylinderManufacturerId, "employeeId": wx.getStorageSync('pj_employee_id'), "employeeName": wx.getStorageSync('pj_employee_name') });
    wx.request({
      url: 'http://localhost:18090/api/addCylinder',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion":"1.0.5"
      },
      data: { unitId: 1, cylinderCode: this.data.cylinderCode, cylinderTypeId: this.data.cylinderTypeId, gasMediumId: this.data.gasMediumId, manufacturingDate: this.data.manufacturingDate, cylinderTypeName: this.data.cylinderTypeName, gasMediumName: this.data.gasMediumName, regularInspectionDate: this.data.regularInspectionDate, setId: this.data.setId, setNumber: this.data.setNumber, nominalTestPressure: this.data.nominalTestPressure, weight: this.data.weight, volume: this.data.volume, wallThickness: this.data.wallThickness, cylinderNumber: this.data.cylinderNumber, "cylinderManufacturerName": this.data.cylinderManufacturerName, "cylinderManufacturerId": this.data.cylinderManufacturerId, "employeeId": wx.getStorageSync('pj_employee_id'), "employeeName": wx.getStorageSync('pj_employee_name') },
      success: res => {
        console.log(res);
        if(res.data.msg = "成功") {
          wx.showToast({
            title: "添加气瓶成功",
            icon: 'none',
            duration: 2000
          });
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            });
          }, 1000);

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
    console.log(inputValueArrray[0]);
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
        url: 'http://localhost:18090/api/getSetInfoByUnitId',
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "qcmappversion": "1.0.5"
        },
        data: { unitId: 1, setNumber: setNumber },
        success: res => {
          if (res.data.data.length > 0) {
            that.setData({ setNumber: setNumber });
            that.setData({ setId: res.data.data[0].id });
          } else {
            that.setData({ setNumber: null });
            that.setData({ setId: null });
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
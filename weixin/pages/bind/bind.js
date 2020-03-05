Page({
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
    cylinderManufacturingDate: new Date().getFullYear() + "-" + ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + "-" + ((new Date().getDate() < 10) ? ("0" + new Date().getDate()): (new Date().getDate())),
    regularInspectionDate: new Date().getFullYear() + "-" + ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + "-" + ((new Date().getDate() < 10) ? ("0" + new Date().getDate()) : (new Date().getDate())),
    phone: '',
    vrcode: ''
  },

  onLoad: function (options) {
    
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

  bindManufacturingDateChange: function (e) {
    this.setData({
      cylinderManufacturingDate: e.detail.value
    })
  },

  bindInspectionDateChange: function (e) {
    this.setData({
      regularInspectionDate: e.detail.value
    })
  },

  onScan() {
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
          wx.showToast({
            title: res.result,
            icon: 'none',
            duration: 2000
          });
        }
      }
    })
  },

  onInput: function (e) {
  },

  onSend: function () {

  },


  onSubmit: function () {
    wx.request({
      url: 'http://localhost:18090/api/addCylinder',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion":"1.0.5"
      },
      data: { unitId: 1, cylinderCode: "5456777660000", ownCode: "123211", cylinderTypeId: "1", gasMediumId: "22", manufacturingDate: "2019-08-08", cylinderTypeName: "钢制无缝气瓶", gasMediumName: "氦气", regularInspectionDate: "2019-11-08", setId: "2", setNumber: "pj12001", nominalTestPressure: "11", weight: "11", volume: "11", wallThickness: "11", cylinderNumber: "00010005915", "cylinderManufacturerName": "北京天海工业有限公司","cylinderManufacturerId":"2" },
      success: res => {
        console.log(res)
      }
    });
  }
})
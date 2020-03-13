const sliderWidth = 96;

Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    saomao: 0,
    sanping: 0,
    jige: 0,
    zongqiping: 0,
    beginTime: "",
    list: [],
    cylinderIdList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //获取充装任务ID
    let missionId = options.id;
    
    var promise = new Promise((resolve, reject) => {
      wx.request({
        url: 'http://localhost:18090/api/getCompanyProjectByCompanyId',
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "qcmappversion": "1.0.5"
        },
        data: { unitId: 1 },
        success: res => {
          console.log(res);
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
      if (res.length > 0) {
        for (var i = 0; i < res.length; i++) {
          if (res[i].projectName == "充装") {
            console.log(res[i]);
            wx.request({
              url: 'http://localhost:18090/api/getCompanyProjectAreaByCompanyProjectId',
              method: "POST",
              header: {
                "Content-Type": "application/x-www-form-urlencoded",
                "qcmappversion": "1.0.5"
              },
              data: { unitId: 1, companyProjectId: res[i].id, projectId: res[i].projectId },
              success: res2 => {
                var returnData = res2.data.data;
                let areaItems = [];
                let areaValues = [];
                if (returnData.length > 0) {
                  for (var j = 0; j < returnData.length; j++) {
                    areaItems.push(returnData[j].companyAreaName);
                    areaValues.push(returnData[j].companyAreaId);
                  }
                  console.log(areaItems);
                  console.log(areaValues);
                  that.setData({ "areaItems": areaItems }, { "areaValues": areaValues });
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

  setBeginTime: function (e) {
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
    this.setData({ "beginTime": now_hour + ":" + now_minute + ":" + now_second });
  },

  setEndTime: function (e) {
    wx.showToast({
      title: "请先创建任务再设定结束时间",
      icon: 'none',
      duration: 3600
    });
  },

  onChangeProductionBatch: function (e) {
    this.setData({ "productionBatch": e.detail.value });
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

  onAddCylinder: function (e) {
    var that = this
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
          if (shortArr.length == 4) {
            code = shortArr[3]
          } else {
            var longArr = url.split("=")
            if (longArr.length > 0) {
              code = longArr[1]
            }
          }
          if (code.length != 11) {
            wx.showToast({
              title: "该气瓶编码有问题",
              icon: 'none',
              duration: 2000
            });
          } else {
            console.log(this.data.list.indexOf(code));
            if (this.data.list.indexOf(code) < 0) {
              wx.request({
                url: 'http://localhost:18090/api/getCylinderByNumber',
                method: "POST",
                header: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  "qcmappversion": "1.0.5"
                },
                data: { cylinderNumber: code },
                success: res => {
                  if (res.data.code == 200) {
                    if (this.data.gasMediumName == "") {
                      that.setData({ "gasMediumName": res.data.data.gasMediumName });
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
                    if (res.data.data.setId > 0) {
                      that.setData({ "saomao": that.data.saomao + 1, "jige": that.data.jige + 1, "zongqiping": that.data.zongqiping + 1 })
                    } else {
                      that.setData({ "saomao": that.data.saomao + 1, "sanping": that.data.sanping + 1, "zongqiping": that.data.zongqiping + 1 })
                    }
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

  onSubmitMission: function (e) {
    var that = this
    if (this.data.beginTime == "") {
      wx.showToast({
        title: "请添加开始时间",
        icon: 'none',
        duration: 3000
      });
      return;
    }
    if (this.data.cylinderIdList.length == 0) {
      wx.showToast({
        title: "请添加气瓶",
        icon: 'none',
        duration: 3000
      });
      return false;
    } else {
      wx.request({
        url: 'http://localhost:18090/api/addDetection',
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "qcmappversion": "1.0.5"
        },
        data: { unitId: 1, employeeId: wx.getStorageSync('pj_employee_id'), beginDate: new Date().getFullYear() + "-" + ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + "-" + ((new Date().getDate() < 10) ? ("0" + new Date().getDate()) : (new Date().getDate())) + " " + that.data.beginTime, productionBatch: that.data.productionBatch, pureness: parseInt(that.data.purenessIndex) + 1, companyAreaId: that.data.areaValues[that.data.areaIndex], cylinderIdList: that.data.cylinderIdList, remark: that.data.remark, creator: wx.getStorageSync('pj_employee_name') },
        success: res => {
          if (res.data.code == 200) {
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
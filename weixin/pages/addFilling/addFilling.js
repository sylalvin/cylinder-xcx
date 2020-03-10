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
    purenessItems: ["普", "2N", "3N", "4N", "5N", "6N"],
    purenessIndex: 0,
    areaItems: ["满瓶仓", "维修仓"],
    areaIndex: 0,
    saomao: 0,
    sanping: 0,
    jige: 0,
    zongqiping: 0,
    beginTime:"",
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    let day = new Date();
    var now_hour, now_minute, now_second;
    if (day.getHours()<9) {
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
    this.setData({ "beginTime": now_hour + ":" + now_minute + ":" + now_second});
  },

  setEndTime: function(e) {
    wx.showToast({
      title: "请先创建任务再设定结束时间",
      icon: 'none',
      duration: 3600
    });
  },

  onChangePureness: function(e) {
    var value = e.detail.value
    this.setData({ "purenessIndex": value})
    
  },

  onChangeArea: function (e) {
    this.setData({ "areaIndex": e.detail.value })
  },

  onAddCylinder: function(e) {
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
            if (this.data.list.indexOf(code)<0) {
              wx.request({
                url: 'http://localhost:18090/api/getCylinderByNumber',
                method: "POST",
                header: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  "qcmappversion": "1.0.5"
                },
                data: { cylinderNumber: code},
                success: res => {
                  console.log(res.data.data.id);
                  console.log(res.data.data.gasMediumName);
                  console.log(res.data.data.gasMediumId);
                  console.log(res.data.data.setId);
                  console.log(res);
                  that.setData({ gasMediumName: res.data.data.gasMediumName});
                  //增加对气瓶的判断
                  if (this.data.gasMediumName != "" && this.data.gasMediumName != res.data.data.gasMediumName) {
                    wx.showToast({
                      title: "您扫码气瓶所属介质与第一次扫码介质不同",
                      icon: 'none',
                      duration: 2000
                    });
                    return false;
                  }
                  if (res.data.data.setId>0) {
                    that.setData({ "saomao": that.data.saomao + 1, "jige": that.data.jige + 1, "zongqiping": that.data.zongqiping + 1 })
                  } else {
                    that.setData({ "saomao": that.data.saomao + 1, "sanping": that.data.sanping + 1, "zongqiping": that.data.zongqiping + 1 })
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
                duration: 2000
              });
            }

          }

        }
      }
    })
  },

  onSubmitMission: function(e) {
    console.log(this.data.list.length);
    if(this.data.list.length == 0){
      wx.showToast({
        title: "请添加气瓶",
        icon: 'none',
        duration: 3000
      });
    } else {
      wx.request({
        url: 'http://localhost:18090/api/addDetection',
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "qcmappversion": "1.0.5"
        },
        data: { unitId: 1, employeeId: wx.getStorageSync('pj_employee_id'), beginDate: "2020-03-09 20:20:20", productionBatch: "29889900",pureness: 2, cylinderIdList: [1, 2, 12], remark: "测试添加 2020-03-10 18：31：39", creator: wx.getStorageSync('pj_employee_name') },
        success: res => {
          console.log(res);
        }
      });
    }
  },


})
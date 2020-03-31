var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scan_number: 0,
    scan_bulk: 0,
    scan_set: 0,
    scan_sum: 0,
    cylinderList: [],
    setList: [],
    setCylinderList: [],
    allCylinderList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onShow: function () {
    var that = this;
    // 执行删除后的初始化气瓶数据
    var setList = app.globalData.backSetList;
    var cylinderList = app.globalData.backCylinderList;
    var setCylinderList = app.globalData.backSetCylinderList;
    var allCylinderList = app.globalData.backAllCylinderList;
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
    app.globalData.backCylinderList = that.data.cylinderList;
    app.globalData.backSetCylinderList = that.data.setCylinderList;
    app.globalData.backSetList = that.data.setList;
    app.globalData.backAllCylinderList = that.data.allCylinderList;
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

    // app.globalData.backCylinderList = that.data.cylinderList;
    // app.globalData.backSetCylinderList = that.data.setCylinderList;
    // app.globalData.backSetList = that.data.setList;
    // app.globalData.backAllCylinderList = that.data.allCylinderList;
  },

  // 删除逻辑
  deleteCylinder: function(e) {
    var that = this;
    var setList = that.data.setList;
    var cylinderList = that.data.cylinderList;
    var setCylinderList = that.data.setCylinderList;
    var allCylinderList = that.data.allCylinderList;

    var setId = e.currentTarget.dataset.setId;
    var cylinderNumber = e.currentTarget.dataset.cylinderNumber;

    var modalContent = "";

    if(setId == null) { // 散瓶删除逻辑
      modalContent = "确定删除编号为：" + cylinderNumber + "的气瓶？"
      wx.showModal({
        title: '删除',
        content: modalContent,
        success(res) {
          if (res.confirm) {
            // cylinderList
            let index1 = cylinderList.indexOf(cylinderNumber);
            if (index1 > -1) {
              cylinderList.splice(index1, 1);
              that.setData({
                cylinderList: cylinderList
              })
            }

            // allCylinderList
            for (let i = 0; i < allCylinderList.length; i++) {
              if (allCylinderList[i].cylinderNumber == cylinderNumber) {
                let index2 = allCylinderList.indexOf(allCylinderList[i]);
                if (index2 > -1) {
                  allCylinderList.splice(index2, 1);
                }
              }
            }
            that.setData({
              allCylinderList: allCylinderList
            })

            that.countData();
          } else if (res.cancel) {
            console.log('删除取消');
          }
        }
      })
    } else { // 集格删除逻辑
      modalContent = "确定删除编号为：" + setId + "的集格？"
      wx.showModal({
        title: '删除',
        content: modalContent,
        success(res) {
          if (res.confirm) {
            // setList
            let index3 = setList.indexOf(setId);
            if (index3 > -1) {
              setList.splice(index3, 1);
              that.setData({
                setList: setList
              })
            }
            // setCylinderList
            for (let i = setCylinderList.length - 1; i >= 0; i--) {
              if (setCylinderList[i].setId == setId) {
                let index4 = setCylinderList.indexOf(setCylinderList[i]);
                if (index4 > -1) {
                  setCylinderList.splice(index4, 1);
                }
              }
            }
            that.setData({
              setCylinderList: setCylinderList
            })
            // allCylinderList
            for (let i = allCylinderList.length - 1; i >= 0; i--) {
              if (allCylinderList[i].setId == setId) {
                let index5 = allCylinderList.indexOf(allCylinderList[i]);
                if (index5 > -1) {
                  allCylinderList.splice(index5, 1);
                }
              }
            }
            that.setData({
              allCylinderList: allCylinderList
            })

            that.countData();
          } else if (res.cancel) {
            console.log('删除取消');
          }
        }
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }

})
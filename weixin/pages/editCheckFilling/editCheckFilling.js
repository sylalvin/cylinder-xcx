var app = getApp();
Page({

  /**
   * 充装任务列表删除 js 逻辑；
   * 数据对象
   * { 
   *    scan_sum, --气瓶总数
   *    detectionMissionId, --充装任务ID
   *    status, --充装任务状态
   *    cylinderFillList, --充装气瓶信息集格列表
   * }
   */
  data: {
    scan_sum: 0,
    detectionMissionId: 0,
    status: 1,
    fillList: [],
    cylinderFillList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var detectionMissionId = options.detectionMissionId;
    var status = options.status;
    that.setData({
      detectionMissionId: detectionMissionId,
      status: status
    })

    that.getGlobal();

    that.setData({
      scan_sum: that.data.cylinderFillList.length
    })

    //获取充装任务并填充内容
    // wx.request({
    //   url: app.globalData.apiUrl + '/getDetectionMissionVoById',
    //   method: "POST",
    //   header: {
    //     "Content-Type": "application/x-www-form-urlencoded",
    //     "qcmappversion": app.globalData.qcmappversion
    //   },
    //   data: {
    //     detectionMissionId: detectionMissionId
    //   },
    //   success: res => {
    //     if (that.judge(res.data.data.yqDetectionVoList)) {
    //       that.setData({
    //         cylinderFillList: res.data.data.yqDetectionVoList,
    //         scan_sum: res.data.data.yqDetectionVoList.length,
    //         status: res.data.data.status
    //       })
    //     }
    //   }
    // })
  },

  onShow: function() {
    var that = this;
    that.getGlobal();
  },

  onHide: function() {
    var that = this;
    that.setGlobal();
  },

  // 获取全局变量
  getGlobal: function () {
    var that = this;
    var fillList = app.globalData.fillList;
    var cylinderFillList = app.globalData.cylinderFillList;
    that.setData({
      fillList: fillList,
      cylinderFillList: cylinderFillList
    })
  },

  // 设置全局变量
  setGlobal: function () {
    var that = this;
    app.globalData.fillList = that.data.fillList;
    app.globalData.cylinderFillList = that.data.cylinderFillList;
  },

  judge: function (x) {
    if ((x == "") || (x == null)) {
      return false;
    } else {
      return true;
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }

})
var util = require("../../utils/util.js")
const sliderWidth = 96;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    saomiaoValue: 0,
    sanpingValue: 0,
    jigeValue: 0,
    zongqipingValue: 0,
    beginTime: "",
    cylinderIds: [],
    cylinderIdList: [],
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.ids);
    var that = this;
    var ids = options.ids;
    var app = getApp();
    
    wx.request({
      url: 'http://localhost:18090/api/getCylinderByIds',
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "qcmappversion": "1.0.7"
      },
      data: { "ids": ids },
      success: res => {
        var cylinderList = res.data.data;
        console.log(cylinderList[0]);
        if(cylinderList.length>0) {
          var cylinderIdList = [];
          var cylinderIds = [];
          var list = []
          for (var i = 0; i < cylinderList.length; i++) {
            cylinderIdList.push({ "cylinderId": cylinderList[i].id, "cylinderNumber": cylinderList[i].cylinderNumber, "cylinderCode": cylinderList[i].cylinderCode, "gasMediumName": cylinderList[i].gasMediumName, "cylinderTypeName": cylinderList[i].cylinderTypeName, "regularInspectionDate": cylinderList[i].regularInspectionDate, "cylinderScrapDate": cylinderList[i].cylinderScrapDate, "setId": cylinderList[i].setId});
            cylinderIds.push(cylinderList[i].id);
            list.push(cylinderList[i].cylinderNumber);
          }
          console.log(cylinderIdList);
          that.setData({ "cylinderIdList": cylinderIdList,"cylinderIds": cylinderIds, "list": list });
        } else {
          wx.showToast({
            title: "当前列表不存在气瓶",
            icon: 'none',
            duration: 3600
          });
        }
        console.log(res);
      },
      fail: function (res) {
        // fail调用接口失败
        console.log({ error: '网络错误', code: 0 });
      },
      complete: function (res) {
        // complete
      }
    });
    var newJigeKeys = util.getObjectKeys(app.globalData.jige);
    that.setData({
      saomiaoValue: app.globalData.saomiao.length,
      sanpingValue: app.globalData.sanping.length,
      jigeValue: newJigeKeys.length,
      zongqipingValue: app.globalData.zongqiping.length
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
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    console.log(this.data.cylinderIds);
    prevPage.setData({
      "cylinderIdList": this.data.cylinderIds,
      "list": this.data.list,
      "reLoadPage": true
    }, function () {
      wx.navigateBack();
      prevPage.onLoad();
    });
    /*wx.navigateTo({
      url: '/pages/filling/filling'
    })*/
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

  onDeleteCylinder: function (e) {
    var that = this;
    var app = getApp();
    var warnContent = ""
    console.log(e.currentTarget.dataset);
    console.log(e.currentTarget.dataset.setid);
    if (parseInt(e.currentTarget.dataset.setid)>0) {
      warnContent = '删除标签为' + e.currentTarget.dataset.number + "的气瓶后，该所属集格下的所有气瓶都会被删除";
    } else {
      warnContent = '您确定要删除标签为' + e.currentTarget.dataset.number + "的气瓶吗？";
    }

    wx.showModal({
      title: '提示',
      content: warnContent,
      success: function (res) {
        if (res.confirm) {
          //同步更新扫描、散瓶、集格、总气瓶
          //如果删除的是集格中的某个气瓶，则删除该集格下所有气瓶
          //先检验该气瓶是否再某集格中
          var jige = app.globalData.jige;
          var jigeDelete = false;
          var jegeDeleteName = "";
          var jigeDeleteArr = [];
          console.log(jige.length);
          //if(jige.length > 0) {
            for(var jigeName in jige) {
              console.log(jigeName);
              var jigeQiping = jige[jigeName];
              console.log(jigeQiping);
              console.log(e.currentTarget.dataset.id);
              var jigeIndex = jigeQiping.indexOf(e.currentTarget.dataset.id);
              console.log(jigeIndex);
              if (jigeIndex > -1) {
                jigeDeleteArr = jige[jigeName];
                jegeDeleteName = jigeName;
                delete jige[jigeName];
                jigeDelete = true;
                app.globalData.jige = jige;
                var newJigeKeys = util.getObjectKeys(jige);
                that.setData({ jigeValue: newJigeKeys.length});
              }
            }
          //}
          
          //检验完毕
          var saomiao = app.globalData.saomiao;
          var cylinderIds = that.data.cylinderIds;
          var list = that.data.list;
          var cylinderIdList = that.data.cylinderIdList;
          var zongqiping = app.globalData.zongqiping;
          var sanping = app.globalData.sanping;
          
          if (jigeDelete == true) {
            //如果是集格，单独处理扫码，扫码与总气瓶处理逻辑不同
            var saomiaoDIndex = saomiao.indexOf("J" + e.currentTarget.dataset.setid);
            if (saomiaoDIndex > -1) {
              saomiao.splice(saomiaoDIndex, 1);
            };
            that.setData({saomiaoValue: saomiao.length});
            app.globalData.saomiao = saomiao;

            for (var ii = 0; ii < jigeDeleteArr.length; ii++) {
              //删除气瓶数组,list对应的气瓶二维码和cylinderIds对应的气瓶ID其索引是一致的
              let dIndex = cylinderIds.indexOf(jigeDeleteArr[ii]);
              cylinderIds.splice(dIndex, 1);
              list.splice(dIndex, 1);
              
              //删除气瓶数组数据
              var searchDIndex;
              for (var i = 0; i < cylinderIdList.length; i++) {
                if (cylinderIdList[i].cylinderId == jigeDeleteArr[ii]) {
                  searchDIndex = i;
                }
              }
              cylinderIdList.splice(searchDIndex, 1);
             
              var zongqipingDIndex = zongqiping.indexOf(jigeDeleteArr[ii]);
              if (zongqipingDIndex > -1) {
                zongqiping.splice(zongqipingDIndex, 1);
              };
            }
            that.setData({
              zongqipingValue: zongqiping.length
            });
            that.setData({ "cylinderIds": cylinderIds, "list": list });
            that.setData({ "cylinderIdList": cylinderIdList });
            app.globalData.zongqiping = zongqiping;
          } else {
            //删除气瓶数组,list对应的气瓶二维码和cylinderIds对应的气瓶ID其索引是一致的
            let index = cylinderIds.indexOf(e.currentTarget.dataset.id);
            cylinderIds.splice(index, 1);
            list.splice(index, 1);
            that.setData({ "cylinderIds": cylinderIds, "list": list });
            //删除气瓶数组数据
            var searchIndex;
            for (var i = 0; i < cylinderIdList.length; i++) {
              if (cylinderIdList[i].cylinderId == e.currentTarget.dataset.id) {
                searchIndex = i;
              }
            }
            cylinderIdList.splice(searchIndex, 1);
            that.setData({ "cylinderIdList": cylinderIdList });

            var saomiaoIndex = saomiao.indexOf(e.currentTarget.dataset.id);
            if (saomiaoIndex > -1) {
              saomiao.splice(saomiaoIndex, 1);
              app.globalData.saomiao = saomiao;
            };

            var sanpingIndex = sanping.indexOf(e.currentTarget.dataset.id);
            if (sanpingIndex > -1) {
              sanping.splice(sanpingIndex, 1);
              app.globalData.sanping = sanping;
            };

            var zongqipingIndex = zongqiping.indexOf(e.currentTarget.dataset.id);
            if (zongqipingIndex > -1) {
              zongqiping.splice(zongqipingIndex, 1);
              app.globalData.zongqiping = zongqiping;
            };
            that.setData({
              saomiaoValue: saomiao.length,
              sanpingValue: sanping.length,
              zongqipingValue: zongqiping.length
            });
          }
          //处理完毕

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    });
  },

})
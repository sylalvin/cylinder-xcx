// pages/common/mmodal/mmodal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    width: {
      type: Boolean,
      value: '80%'
    },
    height: {
      type: String,
      value: '60%'
    },
    showCancel: {
      type: Boolean,
      value: false
    },
    headerText: {
      type: String,
      value: "错误提醒"
    },
    cancelText: {
      type: String,
      value: "取 消"
    },
    confirmText: {
      type: String,
      value: "确 定"
    },
    nostart: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    cancel () {
      console.log('cancel');
      this.setData({
        show: false
      })
    },
    confirm () {
      console.log('confirm');
      this.setData({
        show: false
      })
      if(!this.nostart) {
        this.triggerEvent('start');
      }
    }
  }
})

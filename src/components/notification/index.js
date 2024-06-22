import './index.scss'
import { v4 as uuidv4 } from 'uuid'
// import message from '../message'

class Notification {
  /* 用于记录callback被触发 */
  isClick = false
  constructor () {
    // 如果已经创建，则直接退出
    if (document.getElementById('notificationBasicBox-left-top')) return
    // 创建四个角落的 Notification 包裹盒子
    const notificationBasicBoxLeftTop = document.createElement('div')
    notificationBasicBoxLeftTop.id = 'notificationBasicBox-left-top'
    notificationBasicBoxLeftTop.classList.add('notificationBasicBox')
    const notificationBasicBoxLeftBottom = document.createElement('div')
    notificationBasicBoxLeftBottom.id = 'notificationBasicBox-left-bottom'
    notificationBasicBoxLeftBottom.classList.add('notificationBasicBox')
    const notificationBasicBoxRightTop = document.createElement('div')
    notificationBasicBoxRightTop.id = 'notificationBasicBox-right-top'
    notificationBasicBoxRightTop.classList.add('notificationBasicBox')
    const notificationBasicBoxRightBottom = document.createElement('div')
    notificationBasicBoxRightBottom.id = 'notificationBasicBox-right-bottom'
    notificationBasicBoxRightBottom.classList.add('notificationBasicBox')
    const body = document.getElementsByTagName('body')[0]
    body.appendChild(notificationBasicBoxLeftTop)
    body.appendChild(notificationBasicBoxLeftBottom)
    body.appendChild(notificationBasicBoxRightTop)
    body.appendChild(notificationBasicBoxRightBottom)
  }

  /**
   * 自动消失动画
   * @param {HTMLDivElement} newDiv 关闭的信息
   * @param {String} location 位置 left right
   * @param {Number} duration 自动关闭时间
   * @param {String} countdownId newDiv 唯一标识
   * @param {Function | Null} resolve 用于完成 Promise
   */
  _closeTransition (newDiv, location, duration, countdownId, resolve = null) {
    if (duration !== 0) {
      const countdownDiv = newDiv.getElementsByClassName(countdownId)[0]
      // countdownDiv.style.opacity = '1'
      countdownDiv.style.transition =  `all ${duration/1000}s linear`
      countdownDiv.style.width = '100%'
    }
    return setTimeout(() => {
      newDiv.classList.add(`ui-notification-${location.split('-')[0]}-disappear`)
      // 删除元素
      setTimeout(() => {
        newDiv.remove()
        resolve && resolve('Close')
      }, 400)
    }, duration)
  }

  /**
   * notification 通知弹窗
   * @param param0 
   * @param {String} title 标题 选填
   * @param {String} message 信息 必填
   * @param {String} type 类型 选填 默认normal   success warning error
   * @param {String} location 位置 选填 默认left-bottom   left-top right-top right-bottom
   * @param {Number} duration 持续时间 如果是0 则不会自动关闭 除 0 外 最小值为 1000，小于1000会被强制转成1000
   * @param {Boolean} showClose 是否可以手动关闭 默认可以 开启时，鼠标移入会停止自动关闭计时
   * @param {Boolean} userSelect 是否限制文本选中 默认 true 禁止选中文本
   * @param {Function} callback 点击通知框时运行的回调函数，默认为null
   * @returns {Promise} 自调用异步函数 返回Promise,then 成功函数的参数为 callback函数 的返回值（如果有）
   */
  notification ({title, message, type = 'normal' , location = 'left-bottom', duration = 3000, showClose = true, userSelect = true, callback = null}) {
    return new Promise(resolve => {
      // 如果 duration 为0  则无视传入的 showClose 强制可以手动关闭
      if (duration === 0) {
        showClose = true
      } else if (duration < 1000) {
        duration = 1000
      }
      const notificationBasicBox = document.getElementsByClassName('notificationBasicBox')
      // 创建 notification 盒子
      const uuid = uuidv4()
      const newDiv = document.createElement('div')
      newDiv.id = uuid
      newDiv.classList.add('ui-notification')
      newDiv.classList.add(`ui-notification-${location.split('-')[1]}`)
      newDiv.style.transformOrigin = 'center center'
      userSelect && (newDiv.style.cursor = 'default')
      userSelect && (newDiv.style.userSelect = 'none')
      // 创建倒计时
      // let countdownDiv: HTMLDivElement
      let countdownId = uuidv4()
      if (duration !== 0) {
        const colorData= {
          success: 'rgba(153, 230, 115, .7)',
          warning: 'rgba(255, 203, 125, .7)',
          error: 'rgba(245, 108, 108, .7)',
          normal: 'rgba(0, 0, 0, .5)'
        }
        const countdownDiv = document.createElement('div')
        countdownDiv.classList.add('ui-countdown')
        countdownDiv.classList.add(countdownId)
        countdownDiv.style.backgroundColor = colorData[type] || colorData['normal']
        countdownDiv.style.transition =  `all ${duration/1000}s linear`
        newDiv.appendChild(countdownDiv)
      }
      if (title) {
        // 创建标题节点
        const newTitle = document.createElement('div')
        newTitle.classList.add('ui-notification-title')
        const titleText = document.createTextNode(title)
        newTitle.appendChild(titleText)
        newDiv.appendChild(newTitle)
      }
      // 创建信息节点
      const newMessage = document.createElement('div')
      if (title) newMessage.classList.add('ui-notification-message')
      else newMessage.classList.add('ui-notification-title')
      const messageText = document.createTextNode(message)
      newMessage.appendChild(messageText)
      newDiv.appendChild(newMessage)
      switch (type) {
        case 'success':
        case 'warning':
        case 'error':
        case 'normal':
          newDiv.classList.add(`ui-notification-${type}`)
          break
        default:
          newDiv.classList.add('ui-notification-normal')
          break
      }
      // 创建计时器保存位置
      let timeout
      // 创建关闭节点
      if (showClose) {
        const closeSvg = document.createElement('svg')
        closeSvg.classList.add('notification-close')
        closeSvg.classList.add('icon')
        closeSvg.classList.add('ui-icon-close')
        closeSvg.classList.add('svg-icon')
        closeSvg.setAttribute('aria-hidden', 'true')
        const closeUse = document.createElement('use')
        closeUse.setAttribute('xlink:href', '#icon-close')
        // closeSvg.innerHTML = '<use xlink:href="#icon-close"></use>'
        // const closeText = document.createTextNode('<use xlink:href="#icon-close"></use>')
        closeSvg.appendChild(closeUse)
        newDiv.appendChild(closeSvg)
        newDiv.innerHTML += ''
      }
      let _f = null
      // 用于保存 callback 返回值
      // let _fR = null
      if (callback) {
        /* 创建通知点击触发的函数
         *阻止close关闭按钮关闭事件冒泡
         */
        _f = async (e) => {
          this.isClick = true
          /*
           * 判断点击事件出发位置
           * 若为 notification-close 关闭按钮 则不触发 callback
           */
          if (!e.target.classList.contains('notification-close')) {
            newDiv.style.transitionDuration = '.1s'
            // newDiv.style.transform = 'scale(85%)'
            setTimeout(() => {
              newDiv.style.transitionDuration = '.3s'
              this._closeTransition(newDiv, location, 0, countdownId)
            }, 180)
            resolve(callback())
          }
        }
        /* 绑定通知点击事件 */
        newDiv.addEventListener('click', _f)
      }
      let oldDivLeftBottom
      let oldDivRightBottom
      // 插入到页面
      switch (location) {
        case 'left-top':
          newDiv.classList.add('ui-notification-left')
          notificationBasicBox[0].appendChild(newDiv)
          break
        case 'right-top':
          newDiv.classList.add('ui-notification-right')
          notificationBasicBox[2].appendChild(newDiv)
          break
        case 'right-bottom':
          newDiv.classList.add('ui-notification-right')
          oldDivRightBottom = notificationBasicBox[3].getElementsByClassName('ui-notification')[0]
          if (oldDivRightBottom) notificationBasicBox[3].insertBefore(newDiv, oldDivRightBottom)
          else notificationBasicBox[3].appendChild(newDiv)
          break
        case 'left-bottom':
        default:
          newDiv.classList.add('ui-notification-left')
          oldDivLeftBottom = notificationBasicBox[1].getElementsByClassName('ui-notification')[0]
          if (oldDivLeftBottom) notificationBasicBox[1].insertBefore(newDiv, oldDivLeftBottom)
          else notificationBasicBox[1].appendChild(newDiv)
          break
      }
      // 页面强制重载
      newDiv.offsetHeight
      // 运行出现动画
      // setTimeout(() => {
      newDiv.classList.add(`ui-notification-${location.split('-')[0]}-appear`)
      // }, 10)
      // 鼠标mousedown时，触发点击动画
      newDiv.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('notification-close')) return
        newDiv.style.transitionDuration = '.1s'
        newDiv.style.transform = 'scale(95%)'
      })
      // 鼠标mouseup时，触发点击后的反弹动画
      newDiv.addEventListener('mouseup', () => {
        newDiv.style.transitionDuration = '.3s'
        !callback && (newDiv.style.transform = 'scale(100%)')
      })
      // 鼠标mouseleave时，触发点击后的反弹动画
      newDiv.addEventListener('mouseleave', () => {
        newDiv.style.transitionDuration = '.3s'
        !this.isClick && (newDiv.style.transform = 'scale(100%)')
      })
      // 运行消失动画
      if (duration !== 0) {
        let interval_close
        let intervalNum_close = 300
        // let timeout_close = null
        // 当鼠标移入时，停止消失倒计时
        newDiv.addEventListener('mouseenter', () => {
          clearTimeout(timeout)
          const countdownDiv = newDiv.getElementsByClassName(countdownId)[0]
          countdownDiv.style.transition =  `all .3s cubic-bezier(.26,.63,.74,1.02)`
          // countdownDiv.style.opacity = '0'
          countdownDiv.style.width = '0%'
          intervalNum_close = 300
          interval_close = setInterval(() => {
            if (intervalNum_close > 0) intervalNum_close -= 50
            else clearInterval(interval_close)
          }, 50)
        })
        // 鼠标移出时，恢复消失倒计时
        newDiv.addEventListener('mouseleave', () => {
          // timeout_close =
            setTimeout(() => {
            timeout = this._closeTransition(newDiv, location, duration, countdownId, resolve)
          }, intervalNum_close)
        })
        // setTimeout(() => {
        timeout = this._closeTransition(newDiv, location, duration, countdownId)
        // }, 10)
      }
      // 为关闭按钮添加关闭事件
      if (showClose) {
        newDiv.getElementsByTagName('svg')[0].addEventListener('click', () => {
          timeout = this._closeTransition(newDiv, location, 0, countdownId, resolve)
        })
      }
    })
  }
}

export default new Notification()

// export default Notification

// 测试
document.addEventListener('keyup', (e) => {
  const test = new Notification()
  switch (e.key) {
    case '1':
      test.notification({
        title: 'notification title测试-1',
        message: 'notification message测试-1',
        type: 'success',
        location: 'left-top',
        duration: Math.floor(Math.random() * 6000)
      })
      break
    case '2':
      test.notification({
        title: 'notification title测试-2',
        message: 'notification message测试-2',
        type: 'normal',
        location: 'left-bottom',
        showClose: false
      })
      break
    case '3':
      test.notification({
        title: 'notification title测试-3',
        message: 'notification message测试-3',
        type: 'warning',
        location: 'right-top',
        duration: 0,
        userSelect: false,
        async callback () {
          console.log('@3 async callback 运行了')
          await new Promise(resolve => {
            setTimeout(() => {
              resolve()
            }, 3000)
          })
          return '@3 callback 运行 的返回值'
        }
      }).then(v => {
        console.log('@3.then', v)
      })
      break
    case '4':
      test.notification({
        title: 'notification title测试-4',
        message: 'notification message测试-4',
        type: 'error',
        location: 'right-bottom',
        callback () {
          console.log('@4 callback 运行了')
          return '@4 callback 运行 的返回值'
        }
      }).then(v => {
        console.log('@4.then', v)
      })
      break
  }
})
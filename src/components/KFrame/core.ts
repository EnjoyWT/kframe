interface IframeOptions {
  uid: string
  src?: string
  srcdoc?: string
  name?: string
  width?: string
  height?: string
  className?: string
  style?: string
  allow?: string
  sandbox?: string
  container?: HTMLElement // 新增：允许指定容器
  onLoad?: (e: Event) => void
  onError?: (e: string | Event) => void
}

type IframeRect = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'> & { zIndex?: number | string }

class Iframe {
  instance: HTMLIFrameElement | null = null
  constructor(private ops: IframeOptions) {
    this.init()
  }
  init() {
    const {
      src,
      srcdoc,
      name = `Iframe-${Date.now()}`,
      className = '',
      style = '',
      allow,
      sandbox,
      container = document.body,
      onLoad = () => {},
      onError = () => {},
    } = this.ops

    this.instance = document.createElement('iframe')
    this.instance.name = name
    this.instance.className = className
    this.instance.style.cssText = style
    this.instance.onload = onLoad
    this.instance.onerror = onError
    if (allow) this.instance.allow = allow
    if (sandbox) this.instance.sandbox = sandbox

    this.hide()
    if (srcdoc) {
      this.instance.srcdoc = srcdoc
    } else if (src) {
      this.instance.src = src
    }
    container.appendChild(this.instance)
  }
  setElementStyle(style: Record<string, string>) {
    if (this.instance) {
      Object.entries(style).forEach(([key, value]) => {
        this.instance!.style.setProperty(key, value)
      })
    }
  }
  hide() {
    // 新方案：使用 opacity + visibility，避免 display:none 导致的白屏问题
    // iframe 保持渲染状态，切换更流畅
    this.setElementStyle({
      opacity: '0',
      'pointer-events': 'none',
      visibility: 'hidden',
      position: 'absolute',
      left: '0',
      top: '0',
      width: '0',
      height: '0',
    })

    // 旧方案（如需恢复请使用以下代码）：
    // this.setElementStyle({
    //   display: 'none',
    //   position: 'absolute',
    //   left: '0px',
    //   top: '0px',
    //   width: '0px',
    //   height: '0px',
    // })
  }
  show(rect: IframeRect) {
    // 新方案：使用 opacity + visibility，保持渲染状态
    this.setElementStyle({
      opacity: '1',
      'pointer-events': 'auto',
      visibility: 'visible',
      position: 'absolute',
      left: rect.left + 'px',
      top: rect.top + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px',
      border: '0',
      'z-index': String(rect.zIndex) || 'auto',
    })

    // 旧方案（如需恢复请使用以下代码）：
    // this.setElementStyle({
    //   display: 'block',
    //   position: 'absolute',
    //   left: rect.left + 'px',
    //   top: rect.top + 'px',
    //   width: rect.width + 'px',
    //   height: rect.height + 'px',
    //   border: '0',
    //   'z-index': String(rect.zIndex) || 'auto',
    // })
  }
  resize(rect: IframeRect) {
    this.show(rect)
  }
  destroy() {
    if (this.instance) {
      this.instance.onload = null
      this.instance.onerror = null
      this.instance.remove()
      this.instance = null
    }
  }
  updateSrcDoc(srcdoc: string) {
    if (this.instance) {
      this.instance.srcdoc = srcdoc
    }
  }
  updateSrc(src: string) {
    if (this.instance) {
      this.instance.src = src
    }
  }
}

export class IFrameManager {
  static frames = new Map<string, Iframe>()
  static createFrame(ops: IframeOptions, rect: IframeRect): Iframe {
    const existFrame = this.frames.get(ops.uid)
    if (existFrame) {
      // If srcdoc changed, update it instead of destroying
      if (ops.srcdoc && existFrame.instance && existFrame.instance.srcdoc !== ops.srcdoc) {
        existFrame.updateSrcDoc(ops.srcdoc)
      } else if (ops.src && existFrame.instance && existFrame.instance.src !== ops.src) {
        existFrame.updateSrc(ops.src)
      }
      existFrame.show(rect)
      return existFrame
    }
    const frame = new Iframe(ops)
    this.frames.set(ops.uid, frame)
    frame.show(rect)
    return frame
  }
  static showFrame(uid: string, rect: IframeRect): void {
    const frame = this.frames.get(uid)
    if (frame) {
      frame.show(rect)
    }
  }
  static hideFrame(uid: string): void {
    const frame = this.frames.get(uid)
    if (frame) {
      frame.hide()
    }
  }
  static destroyFrame(uid: string): void {
    const frame = this.frames.get(uid)
    if (frame) {
      frame.destroy()
      this.frames.delete(uid)
    }
  }
  static resizeFrame(uid: string, rect: IframeRect): void {
    const frame = this.frames.get(uid)
    if (frame) {
      frame.resize(rect)
    }
  }
  static getFrame(uid: string): Iframe | undefined {
    return this.frames.get(uid)
  }
}

export const getIncreaseId = (() => {
  let id = 0
  return () => {
    id++
    return id
  }
})()

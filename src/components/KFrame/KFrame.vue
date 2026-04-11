<template>
  <div ref="frameContainer" class="k-frame">
    <span v-if="!src && !srcdoc" class="k-frame-tips">
      <slot name="placeholder">暂无数据</slot>
    </span>
    <span v-else-if="isLoading" class="k-frame-tips">
      <slot name="loading">加载中... </slot>
    </span>
    <span v-else-if="isError" class="k-frame-tips"> <slot name="error">加载失败 </slot></span>
  </div>
</template>
<script setup lang="ts">
import { onActivated, onBeforeUnmount, onDeactivated, ref, watch, computed, onMounted } from 'vue'
import { IFrameManager, getIncreaseId } from './core'
import { useResizeObserver } from '@vueuse/core'

defineOptions({
  name: 'KFrame',
})

const props = withDefaults(
  defineProps<{
    uid?: string
    src?: string
    srcdoc?: string
    zIndex?: string | number
    keepAlive?: boolean
    sandbox?: string
    container?: HTMLElement | string
    renderMode?: 'portal' | 'inline'
  }>(),
  {
    src: '',
    keepAlive: true,
    sandbox: 'allow-scripts',
    renderMode: 'portal'
  },
)

const emits = defineEmits(['loaded', 'error'])

const internalUid = `kFrame-${getIncreaseId()}`
const isInlineMode = computed(() => props.renderMode === 'inline')
const uid = computed(() => props.uid || internalUid)
const frameContainer = ref()
const isLoading = ref(false)
const isError = ref(false)
let readyFlag = false

const getFrameContainerRect = () => {
  const el = frameContainer.value
  const rect = el?.getBoundingClientRect()

  // 如果容器不存在，返回默认值
  if (!rect || !el) {
    return {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      zIndex: props.zIndex ?? 'auto',
    }
  }

  const containerElement = (typeof props.container === 'string' ? document.querySelector(props.container) : props.container) as HTMLElement || document.body
  
  if (containerElement === document.body) {
    // 默认行为：挂载到 body，使用文档坐标
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
      zIndex: props.zIndex ?? 'auto',
    }
  } else {
    // 局部挂载：使用相对于容器的坐标
    const containerRect = containerElement.getBoundingClientRect()
    // 获取容器的计算样式，以扣除边框的影响
    const computedStyle = window.getComputedStyle(containerElement)
    const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0
    const borderTop = parseFloat(computedStyle.borderTopWidth) || 0

    return {
      // 绝对定位的 origin 是 padding-box 的左上角，即需扣除 border
      left: rect.left - containerRect.left - borderLeft + containerElement.scrollLeft,
      top: rect.top - containerRect.top - borderTop + containerElement.scrollTop,
      // 使用 Math.ceil 避免亚像素导致的切边
      width: Math.ceil(rect.width),
      height: Math.ceil(rect.height),
      zIndex: props.zIndex ?? 'auto',
    }
  }
}

const createFrame = () => {
  isError.value = false
  isLoading.value = true

  const resolvedContainer = ((typeof props.container === 'string' ? document.querySelector(props.container) : props.container) as HTMLElement) || document.body
  const containerElement = (isInlineMode.value ? frameContainer.value : resolvedContainer) as HTMLElement | undefined
  if (!containerElement) return

  IFrameManager.createFrame(
    {
      uid: uid.value,
      name: uid.value,
      src: props.src,
      srcdoc: props.srcdoc,
      onLoad: handleLoaded,
      onError: handleError,
      allow: 'fullscreen;autoplay',
      sandbox: props.sandbox,
      container: containerElement,
      renderMode: props.renderMode,
    },
    getFrameContainerRect(),
  )
}
const handleLoaded = (e: Event) => {
  isLoading.value = false
  emits('loaded', e)
}
const handleError = (e: string | Event) => {
  isLoading.value = false
  isError.value = true
  emits('error', e)
}

const showFrame = () => {
  IFrameManager.showFrame(uid.value, getFrameContainerRect())
}
const hideFrame = () => {
  IFrameManager.hideFrame(uid.value)
}
// 去掉节流/防抖，实时更新坐标，让 iframe 跟随动画
// resize 操作很轻量（只设置CSS属性），不需要节流
const resizeFrame = () => {
  IFrameManager.resizeFrame(uid.value, getFrameContainerRect())
}

const destroyFrame = () => {
  IFrameManager.destroyFrame(uid.value)
}

const getFrame = () => {
  return IFrameManager.getFrame(uid.value)
}

// 监听滚动事件，确保在嵌套滚动容器中也能正确跟随
const handleScroll = () => {
  if (isInlineMode.value) return
  resizeFrame()
}

onMounted(() => {
  if (!isInlineMode.value) {
    window.addEventListener('scroll', handleScroll, true)
  }
})

useResizeObserver(frameContainer, () => {
  resizeFrame()
})

watch(isInlineMode, (inline) => {
  if (inline) {
    window.removeEventListener('scroll', handleScroll, true)
    resizeFrame()
    return
  }
  window.addEventListener('scroll', handleScroll, true)
  resizeFrame()
}, { immediate: false })

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll, true)
  destroyFrame()
  readyFlag = false
})

onDeactivated(() => {
  if (props.keepAlive) {
    hideFrame()
  } else {
    destroyFrame()
  }
})

onActivated(() => {
  if (props.keepAlive) {
    showFrame()
    return
  }
  if (readyFlag) {
    createFrame()
  }
})

watch(
  () => [frameContainer.value, props.src, props.srcdoc, props.container, props.renderMode],
  () => {
    if (frameContainer.value && (props.src || props.srcdoc)) {
      createFrame()
      readyFlag = true
    } else {
      destroyFrame()
      readyFlag = false
    }
  },
  {
    immediate: true,
  },
)

defineExpose({
  getRef: () => getFrame()?.instance,
})
</script>

<style lang="scss" scoped>
.k-frame {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  &-tips {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>

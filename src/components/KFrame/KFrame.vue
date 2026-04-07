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
  }>(),
  {
    src: '',
    keepAlive: true,
    sandbox: 'allow-scripts'
  },
)

const emits = defineEmits(['loaded', 'error'])

const internalUid = `kFrame-${getIncreaseId()}`
const uid = computed(() => props.uid || internalUid)
const frameContainer = ref()
const isLoading = ref(false)
const isError = ref(false)
let readyFlag = false

const getFrameContainerRect = () => {
  const rect = frameContainer.value?.getBoundingClientRect()

  // 如果容器不存在，返回默认值
  if (!rect) {
    return {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      zIndex: props.zIndex ?? 'auto',
    }
  }

  // 修复：将视口坐标转换为文档坐标
  // getBoundingClientRect() 返回相对于视口的坐标
  // 但 iframe 使用 position:absolute 相对于文档定位
  // 所以需要加上页面滚动距离
  return {
    left: rect.left + window.scrollX, // 视口X + 水平滚动 = 文档X
    top: rect.top + window.scrollY, // 视口Y + 垂直滚动 = 文档Y
    width: rect.width,
    height: rect.height,
    zIndex: props.zIndex ?? 'auto',
  }
}

const createFrame = () => {
  isError.value = false
  isLoading.value = true

  IFrameManager.createFrame(
    {
      uid: uid.value,
      name: uid.value,
      src: props.src,
      srcdoc: props.srcdoc,
      onLoad: handleLoaded,
      onError: handleError,
      allow: 'fullscreen;autoplay',
      sandbox: props.sandbox
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
  resizeFrame()
}

onMounted(() => {
  // 使用 capture: true 确保能捕获所有层级的滚动事件
  window.addEventListener('scroll', handleScroll, true)
})

useResizeObserver(frameContainer, () => {
  resizeFrame()
})

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
  () => [frameContainer.value, props.src, props.srcdoc],
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

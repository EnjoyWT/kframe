<template>
  <div ref="frameContainer" class="k-frame">
    <span v-if="!src" class="k-frame-tips">
      <slot name="placeholder">暂无数据</slot>
    </span>
    <span v-else-if="isLoading" class="k-frame-tips">
      <slot name="loading">加载中... </slot>
    </span>
    <span v-else-if="isError" class="k-frame-tips"> <slot name="error">加载失败 </slot></span>
  </div>
</template>
<script setup lang="ts">
import { onActivated, onBeforeUnmount, onDeactivated, ref, watch } from 'vue'
import { IFrameManager, getIncreaseId } from './core'
import { useResizeObserver, useThrottleFn } from '@vueuse/core'

defineOptions({
  name: 'KFrame',
})

const props = withDefaults(
  defineProps<{
    src: string
    zIndex?: string | number
    keepAlive?: boolean
  }>(),
  {
    src: '',
    keepAlive: true,
  },
)

const emits = defineEmits(['loaded', 'error'])

const uid = `kFrame-${getIncreaseId()}`
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
    left: rect.left + window.scrollX,   // 视口X + 水平滚动 = 文档X
    top: rect.top + window.scrollY,     // 视口Y + 垂直滚动 = 文档Y
    width: rect.width,
    height: rect.height,
    zIndex: props.zIndex ?? 'auto',
  }

  // 旧实现（有 bug，滚动时定位错误）：
  // return {
  //   left: x || 0,
  //   top: y || 0,
  //   width: width || 0,
  //   height: height || 0,
  //   zIndex: props.zIndex ?? 'auto',
  // }
}

const createFrame = () => {
  isError.value = false
  isLoading.value = true

  IFrameManager.createFame(
    {
      uid,
      name: uid,
      src: props.src,
      onLoad: handleLoaded,
      onError: handleError,
      allow: 'fullscreen;autoplay',
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
  IFrameManager.showFrame(uid, getFrameContainerRect())
}
const hideFrame = () => {
  IFrameManager.hideFrame(uid)
}
const resizeFrame = useThrottleFn(() => {
  IFrameManager.resizeFrame(uid, getFrameContainerRect())
})

const destroyFrame = () => {
  IFrameManager.destroyFrame(uid)
}

const getFrame = () => {
  return IFrameManager.getFrame(uid)
}

useResizeObserver(frameContainer, () => {
  resizeFrame()
})

onBeforeUnmount(() => {
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
  () => [frameContainer.value, props.src],
  (el, src) => {
    if (el && src) {
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

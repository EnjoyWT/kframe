English | [简体中文](./README.md)

# kframe

Component of iframe to support Vue KeepAlive

> **Note:** This repository is based on [canmick/kframe](https://github.com/canmick/kframe) with additional build configuration for npm package distribution.

## 📦 Installation

### From GitHub

```sh
# Using npm
npm install git+https://github.com/EnjoyWT/kframe.git

# Using pnpm
pnpm add git+https://github.com/EnjoyWT/kframe.git

# Using yarn
yarn add git+https://github.com/EnjoyWT/kframe.git
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "kframe": "github:EnjoyWT/kframe"
  }
}
```

## 🚀 Usage

### Import in your Vue 3 project

```typescript
// Import the component
import { KFrame, IFrameManager } from 'kframe'
import 'kframe/dist/kframe.css'

// Register the component
app.component('KFrame', KFrame)

// Or use in your component
import { KFrame } from 'kframe'

export default {
  components: {
    KFrame,
  },
}
```

### Using IFrameManager

```typescript
import { IFrameManager } from 'kframe'

// Create an iframe
IFrameManager.createFame(
  {
    uid: 'unique-id',
    src: 'https://example.com',
    name: 'MyFrame',
    onLoad: (e) => console.log('Loaded'),
    onError: (e) => console.error('Error', e),
  },
  {
    left: 0,
    top: 0,
    width: 800,
    height: 600,
    zIndex: 100,
  },
)

// Show/Hide iframe
IFrameManager.showFrame('unique-id', { left: 0, top: 0, width: 800, height: 600 })
IFrameManager.hideFrame('unique-id')

// Destroy iframe
IFrameManager.destroyFrame('unique-id')
```

### Using KFrame Component with Template Ref

```vue
<template>
  <div>
    <KFrame
      ref="kframeRef"
      src="https://example.com"
      :keep-alive="true"
      :z-index="100"
      style="width: 100%; height: 100%"
      @loaded="onLoaded"
      @error="onError"
    />
    <button @click="sendMessage">Send Message to iframe</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { KFrame } from 'kframe'

const kframeRef = ref()

// Event: iframe loaded successfully
const onLoaded = (e: Event) => {
  console.log('iframe loaded successfully', e)

  // Now you can safely send messages to iframe
  const iframeElement = kframeRef.value?.getRef()
  if (iframeElement?.contentWindow) {
    iframeElement.contentWindow.postMessage(
      { type: 'init', data: 'ready' },
      'https://example.com'
    )
  }
}

// Event: iframe load failed
const onError = (e: string | Event) => {
  console.error('iframe load error', e)
  // Handle error, e.g., show error message, retry loading, etc.
}

// Send message to iframe
const sendMessage = () => {
  // Get iframe element reference
  const iframeElement = kframeRef.value?.getRef()

  if (iframeElement?.contentWindow) {
    iframeElement.contentWindow.postMessage(
      { type: 'hello', data: 'world' },
      '*' // or specify origin like 'https://example.com' for security
    )
  }
}

// Optional: Listen to messages from iframe
onMounted(() => {
  window.addEventListener('message', (event) => {
    // Verify origin for security
    if (event.origin !== 'https://example.com') return

    console.log('Received message from iframe:', event.data)
  })
})
</script>
```

### KFrame Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | `''` | iframe source URL. The URL to load in the iframe. |
| `zIndex` | `string \| number` | `'auto'` | iframe z-index. Controls the stacking order of the iframe element. |
| `keepAlive` | `boolean` | `true` | Keep iframe alive when component is deactivated (with Vue `<KeepAlive>`). When `true`, iframe is hidden but not destroyed; when `false`, iframe is destroyed on deactivation. |

### KFrame Component Events

| Event | Parameters | Description |
|-------|-----------|-------------|
| `loaded` | `(e: Event)` | Fired when iframe successfully loaded. Use this event to safely send initial messages to iframe. |
| `error` | `(e: string \| Event)` | Fired when iframe fails to load. Use this event to handle errors, show error messages, or retry loading. |

### KFrame Component Slots

| Slot | Description | Default Content |
|------|-------------|-----------------|
| `placeholder` | Content shown when `src` is empty | "暂无数据" |
| `loading` | Content shown while iframe is loading | "加载中..." |
| `error` | Content shown when iframe fails to load | "加载失败" |

**Example with custom slots:**

```vue
<KFrame src="https://example.com">
  <template #placeholder>
    <div>No URL provided</div>
  </template>
  <template #loading>
    <div class="spinner">Loading iframe...</div>
  </template>
  <template #error>
    <div class="error-message">Failed to load iframe. Please try again.</div>
  </template>
</KFrame>
```

### KFrame Component Exposed Methods

| Method | Return Type | Description |
|--------|------------|-------------|
| `getRef()` | `HTMLIFrameElement \| null` | Get iframe element reference |


---

## 🛠️ Development

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for npm package

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```

---

## 📄 Credits

This repository is based on [canmick/kframe](https://github.com/canmick/kframe) with additional build configuration for npm package distribution.

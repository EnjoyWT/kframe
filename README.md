简体中文 | [English](./README.en.md)

# kframe

支持 Vue KeepAlive 的 iframe 管理组件

## 📦 安装

### 从 GitHub 安装

#### 安装最新版本（默认）

```sh
# 使用 npm
npm install git+https://github.com/EnjoyWT/kframe.git

# 使用 pnpm
pnpm add git+https://github.com/EnjoyWT/kframe.git

# 使用 yarn
yarn add git+https://github.com/EnjoyWT/kframe.git
```

或者在 `package.json` 中添加：

```json
{
  "dependencies": {
    "kframe": "github:EnjoyWT/kframe"
  }
}
```

#### 指定版本安装

从 GitHub 安装时，可以通过以下方式指定版本：

**1. 使用 Git 标签（Tag）**（推荐）

```sh
# 安装特定标签版本
npm install git+https://github.com/EnjoyWT/kframe.git#v1.0.0
pnpm add git+https://github.com/EnjoyWT/kframe.git#v1.0.0
yarn add git+https://github.com/EnjoyWT/kframe.git#v1.0.0
```

在 `package.json` 中：

```json
{
  "dependencies": {
    "kframe": "github:EnjoyWT/kframe#v1.0.0"
  }
}
```

**2. 使用提交 SHA（Commit Hash）**

```sh
# 安装特定提交版本
npm install git+https://github.com/EnjoyWT/kframe.git#abc123def456
pnpm add git+https://github.com/EnjoyWT/kframe.git#abc123def456
yarn add git+https://github.com/EnjoyWT/kframe.git#abc123def456
```

在 `package.json` 中：

```json
{
  "dependencies": {
    "kframe": "github:EnjoyWT/kframe#abc123def456"
  }
}
```

**3. 使用分支名**

```sh
# 安装特定分支
npm install git+https://github.com/EnjoyWT/kframe.git#develop
pnpm add git+https://github.com/EnjoyWT/kframe.git#develop
yarn add git+https://github.com/EnjoyWT/kframe.git#develop
```

在 `package.json` 中：

```json
{
  "dependencies": {
    "kframe": "github:EnjoyWT/kframe#develop"
  }
}
```

**4. 使用 SSH 协议**

```sh
# 使用 SSH（需要配置 SSH 密钥）
npm install git+ssh://git@github.com/EnjoyWT/kframe.git#v1.0.0
pnpm add git+ssh://git@github.com/EnjoyWT/kframe.git#v1.0.0
yarn add git+ssh://git@github.com/EnjoyWT/kframe.git#v1.0.0
```

在 `package.json` 中：

```json
{
  "dependencies": {
    "kframe": "git+ssh://git@github.com/EnjoyWT/kframe.git#v1.0.0"
  }
}
```

> **提示**：推荐使用 Git 标签来管理版本。创建标签的命令：
>
> ```sh
> git tag -a v1.0.0 -m "Release version 1.0.0"
> git push origin v1.0.0
> ```

## 🚀 使用

### 在 Vue 3 项目中引入

```typescript
// 引入组件
import { KFrame, IFrameManager } from 'kframe'
import 'kframe/dist/kframe.css'

// 全局注册组件
app.component('KFrame', KFrame)

// 或在组件中使用
import { KFrame } from 'kframe'

export default {
  components: {
    KFrame,
  },
}
```

### 使用 IFrameManager

#### 在 Vue 3 项目中使用

```typescript
import { IFrameManager } from 'kframe'

// 创建 iframe
IFrameManager.createFrame(
  {
    uid: 'unique-id',
    src: 'https://example.com',
    name: 'MyFrame',
    onLoad: (e) => console.log('已加载'),
    onError: (e) => console.error('错误', e),
  },
  {
    left: 0,
    top: 0,
    width: 800,
    height: 600,
    zIndex: 100,
  },
)

// 显示/隐藏 iframe
IFrameManager.showFrame('unique-id', { left: 0, top: 0, width: 800, height: 600 })
IFrameManager.hideFrame('unique-id')

// 销毁 iframe
IFrameManager.destroyFrame('unique-id')
```

#### 在纯 JavaScript 项目中使用

虽然 `IFrameManager` 的核心逻辑不依赖 Vue，但由于构建配置，UMD 版本仍需要 Vue 作为依赖。你可以通过以下方式使用：

**方式 1：使用 UMD 构建（需要 Vue）**

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="./dist/kframe.umd.js"></script>
  </head>
  <body>
    <script>
      // 使用全局变量
      const { IFrameManager } = window.KFrame

      // 创建 iframe
      IFrameManager.createFrame(
        {
          uid: 'my-iframe',
          src: 'https://example.com',
          onLoad: (e) => console.log('已加载'),
          onError: (e) => console.error('错误', e),
        },
        {
          left: 100,
          top: 100,
          width: 800,
          height: 600,
          zIndex: 100,
        },
      )

      // 显示/隐藏 iframe
      IFrameManager.showFrame('my-iframe', { left: 100, top: 100, width: 800, height: 600 })
      IFrameManager.hideFrame('my-iframe')

      // 销毁 iframe
      IFrameManager.destroyFrame('my-iframe')
    </script>
  </body>
</html>
```

**方式 2：使用 ES 模块（需要 Vue）**

```javascript
import { IFrameManager } from 'kframe'

// 使用方式与 TypeScript 相同
IFrameManager.createFrame(
  {
    uid: 'unique-id',
    src: 'https://example.com',
    onLoad: (e) => console.log('已加载'),
    onError: (e) => console.error('错误', e),
  },
  {
    left: 0,
    top: 0,
    width: 800,
    height: 600,
    zIndex: 100,
  },
)
```

> **注意**：`KFrame` 组件必须在 Vue 3 项目中使用，因为它是一个 Vue 组件。

### 使用 KFrame 组件并获取引用

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
    <button @click="sendMessage">向 iframe 发送消息</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { KFrame } from 'kframe'

const kframeRef = ref()

// 事件：iframe 加载成功
const onLoaded = (e: Event) => {
  console.log('iframe 加载成功', e)

  // 现在可以安全地向 iframe 发送消息
  const iframeElement = kframeRef.value?.getRef()
  if (iframeElement?.contentWindow) {
    iframeElement.contentWindow.postMessage({ type: 'init', data: 'ready' }, 'https://example.com')
  }
}

// 事件：iframe 加载失败
const onError = (e: string | Event) => {
  console.error('iframe 加载失败', e)
  // 处理错误，例如显示错误信息、重试加载等
}

// 向 iframe 发送消息
const sendMessage = () => {
  // 获取 iframe 元素引用
  const iframeElement = kframeRef.value?.getRef()

  if (iframeElement?.contentWindow) {
    iframeElement.contentWindow.postMessage(
      { type: 'hello', data: 'world' },
      '*', // 或指定具体的 origin，例如 'https://example.com' 以提高安全性
    )
  }
}

// 可选：监听来自 iframe 的消息
onMounted(() => {
  window.addEventListener('message', (event) => {
    // 验证来源以确保安全
    if (event.origin !== 'https://example.com') return

    console.log('收到来自 iframe 的消息:', event.data)
  })
})
</script>
```

### KFrame 组件属性 (Props)

| 属性        | 类型               | 默认值   | 描述                                                                                                                                               |
| ----------- | ------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src`       | `string`           | `''`     | iframe 源地址。要在 iframe 中加载的 URL。                                                                                                          |
| `zIndex`    | `string \| number` | `'auto'` | iframe 的 z-index。控制 iframe 元素的堆叠顺序。                                                                                                    |
| `keepAlive` | `boolean`          | `true`   | 当组件失活时是否保持 iframe 存活（配合 Vue `<KeepAlive>` 使用）。为 `true` 时，iframe 会被隐藏但不会销毁；为 `false` 时，iframe 会在失活时被销毁。 |

### KFrame 组件事件 (Events)

| 事件     | 参数                   | 描述                                                                       |
| -------- | ---------------------- | -------------------------------------------------------------------------- |
| `loaded` | `(e: Event)`           | 当 iframe 成功加载时触发。可以在此事件中安全地向 iframe 发送初始消息。     |
| `error`  | `(e: string \| Event)` | 当 iframe 加载失败时触发。可以在此事件中处理错误、显示错误信息或重试加载。 |

### KFrame 组件插槽 (Slots)

| 插槽          | 描述                        | 默认内容    |
| ------------- | --------------------------- | ----------- |
| `placeholder` | 当 `src` 为空时显示的内容   | "暂无数据"  |
| `loading`     | iframe 加载中时显示的内容   | "加载中..." |
| `error`       | iframe 加载失败时显示的内容 | "加载失败"  |

**自定义插槽示例：**

```vue
<KFrame src="https://example.com">
  <template #placeholder>
    <div>未提供 URL</div>
  </template>
  <template #loading>
    <div class="spinner">正在加载 iframe...</div>
  </template>
  <template #error>
    <div class="error-message">加载 iframe 失败，请重试。</div>
  </template>
</KFrame>
```

### KFrame 组件暴露的方法 (Exposed Methods)

| 方法       | 返回类型                    | 描述                                              |
| ---------- | --------------------------- | ------------------------------------------------- |
| `getRef()` | `HTMLIFrameElement \| null` | 获取 iframe 元素引用，用于发送 postMessage 等操作 |

---

## 🛠️ 开发

### 项目设置

```sh
pnpm install
```

### 编译并热重载用于开发

```sh
pnpm dev
```

### 类型检查、编译并压缩用于生产

```sh
pnpm build
```

### 使用 [ESLint](https://eslint.org/) 进行代码检查

```sh
pnpm lint
```

---

## 📄 致谢

本仓库基于 [canmick/kframe](https://github.com/canmick/kframe)，并增加了 npm 包构建配置。

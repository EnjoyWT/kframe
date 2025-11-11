# kframe

Component of iframe to support Vue KeepAlive

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

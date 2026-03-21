# react-avatar-editor

<a href="https://www.npmjs.com/package/react-avatar-editor"><img alt="npm version" src="https://badge.fury.io/js/react-avatar-editor.svg"></a>
<a href="https://npmjs.org/package/react-avatar-editor"><img alt="Downloads" src="http://img.shields.io/npm/dm/react-avatar-editor.svg"></a>

Avatar / profile picture cropping component for React.
Resize, crop and rotate your uploaded image using a simple and clean user interface.

## Features

- Fully typed, written in TypeScript
- Works with React 17, 18, and 19
- Resize, crop, and rotate
- Rounded or square crop area
- Built-in loading indicator
- `useAvatarEditor` hook for easy access to the editor API
- Zero runtime dependencies

## Install

```sh
npm i react-avatar-editor
```

## Usage

### Basic

```tsx
import AvatarEditor from 'react-avatar-editor'

function MyEditor() {
  return (
    <AvatarEditor
      image="https://example.com/photo.jpg"
      width={250}
      height={250}
      border={50}
      color={[255, 255, 255, 0.6]}
      scale={1.2}
      rotate={0}
    />
  )
}
```

### With `useAvatarEditor` hook

The `useAvatarEditor` hook provides a clean API to access the editor's methods without managing refs manually. All methods return `null` if the editor isn't ready or no image is loaded.

```tsx
import AvatarEditor, { useAvatarEditor } from 'react-avatar-editor'

function MyEditor() {
  const editor = useAvatarEditor()

  const handleSave = () => {
    const canvas = editor.getImageScaledToCanvas()
    if (canvas) {
      const dataUrl = canvas.toDataURL()
      // upload dataUrl to your server
    }
  }

  return (
    <div>
      <AvatarEditor
        ref={editor.ref}
        image="https://example.com/photo.jpg"
        width={250}
        height={250}
        border={50}
        scale={1.2}
      />
      <button onClick={handleSave}>Save</button>
    </div>
  )
}
```

#### Hook methods

| Method                     | Returns                     | Description                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------- |
| `ref`                      | `RefObject`                 | Pass this to the `ref` prop of `AvatarEditor`.          |
| `getImage()`               | `HTMLCanvasElement \| null` | The cropped image at the original resolution.           |
| `getImageScaledToCanvas()` | `HTMLCanvasElement \| null` | The cropped image scaled to the editor dimensions.      |
| `getCroppingRect()`        | `object \| null`            | The crop area as `{ x, y, width, height }` (0–1 range). |

### With ref (alternative)

If you prefer using refs directly:

```tsx
import { useRef } from 'react'
import AvatarEditor, { type AvatarEditorRef } from 'react-avatar-editor'

function MyEditor() {
  const editor = useRef<AvatarEditorRef>(null)

  return (
    <div>
      <AvatarEditor
        ref={editor}
        image="https://example.com/photo.jpg"
        width={250}
        height={250}
      />
      <button
        onClick={() => {
          const canvas = editor.current?.getImageScaledToCanvas()
        }}
      >
        Save
      </button>
    </div>
  )
}
```

### With drag and drop

Using [react-dropzone](https://github.com/react-dropzone/react-dropzone):

```tsx
import AvatarEditor from 'react-avatar-editor'
import Dropzone from 'react-dropzone'

function MyEditor() {
  const [image, setImage] = useState('https://example.com/photo.jpg')

  return (
    <Dropzone onDrop={([file]) => setImage(file)} noClick noKeyboard>
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps()}>
          <AvatarEditor width={250} height={250} image={image} />
          <input {...getInputProps()} />
        </div>
      )}
    </Dropzone>
  )
}
```

### Animated rotation

The `rotate` prop can be animated using any animation library. Here's an example with [motion](https://motion.dev):

```tsx
import { useState } from 'react'
import { useMotionValue, useSpring, useMotionValueEvent } from 'motion/react'
import AvatarEditor from 'react-avatar-editor'

function MyEditor() {
  const [rotate, setRotate] = useState(0)
  const [animatedRotate, setAnimatedRotate] = useState(0)

  const rotateMotion = useMotionValue(0)
  const rotateSpring = useSpring(rotateMotion, { stiffness: 200, damping: 25 })

  useMotionValueEvent(rotateSpring, 'change', (v) => setAnimatedRotate(v))

  if (rotateMotion.get() !== rotate) {
    rotateMotion.set(rotate)
  }

  return (
    <>
      <AvatarEditor
        image="https://example.com/photo.jpg"
        rotate={animatedRotate}
      />
      <button onClick={() => setRotate((r) => r - 90)}>↺</button>
      <button onClick={() => setRotate((r) => r + 90)}>↻</button>
    </>
  )
}
```

## Props

| Prop                    | Type                 | Default          | Description                                                                                   |
| ----------------------- | -------------------- | ---------------- | --------------------------------------------------------------------------------------------- |
| `image`                 | `string \| File`     |                  | The URL or File object of the image to edit.                                                  |
| `width`                 | `number`             | `200`            | Width of the crop area in pixels.                                                             |
| `height`                | `number`             | `200`            | Height of the crop area in pixels.                                                            |
| `border`                | `number \| number[]` | `25`             | Border size around the crop area. Use an array `[horizontal, vertical]` for different values. |
| `borderRadius`          | `number`             | `0`              | Border radius of the crop area. Set to `width / 2` for a circle.                              |
| `color`                 | `number[]`           | `[0, 0, 0, 0.5]` | RGBA color of the crop mask overlay.                                                          |
| `borderColor`           | `number[]`           |                  | RGBA color of the 1px border around the crop area. No border if omitted.                      |
| `backgroundColor`       | `string`             |                  | Background color for transparent images (CSS color string).                                   |
| `scale`                 | `number`             | `1`              | Zoom level. `1` = fit, `> 1` = zoom in, `< 1` = zoom out (requires `disableBoundaryChecks`).  |
| `rotate`                | `number`             | `0`              | Rotation in degrees.                                                                          |
| `position`              | `{ x, y }`           |                  | Center of the crop area (0–1 range). Set this + `onPositionChange` for controlled panning.    |
| `style`                 | `CSSProperties`      |                  | Additional CSS styles for the canvas element.                                                 |
| `crossOrigin`           | `string`             |                  | `crossOrigin` attribute for the image. Use `"anonymous"` for CORS images.                     |
| `showGrid`              | `boolean`            | `false`          | Show a rule-of-thirds grid overlay.                                                           |
| `gridColor`             | `string`             | `"#666"`         | Color of the grid lines.                                                                      |
| `disableBoundaryChecks` | `boolean`            | `false`          | Allow the image to be moved outside the crop boundary.                                        |
| `disableHiDPIScaling`   | `boolean`            | `false`          | Disable `devicePixelRatio` scaling. Can improve performance on mobile.                        |
| `disableCanvasRotation` | `boolean`            | `true`           | When `false`, the canvas resizes to fit the rotated image.                                    |
| `onLoadStart`           | `() => void`         |                  | Called when image loading begins.                                                             |
| `onLoadSuccess`         | `(image) => void`    |                  | Called when the image loads successfully.                                                     |
| `onLoadFailure`         | `() => void`         |                  | Called when the image fails to load.                                                          |
| `onImageReady`          | `() => void`         |                  | Called when the image is first painted on the canvas.                                         |
| `onImageChange`         | `() => void`         |                  | Called on every visual change (drag, scale, rotate, etc.).                                    |
| `onMouseUp`             | `() => void`         |                  | Called when the user releases the mouse after dragging.                                       |
| `onMouseMove`           | `(event) => void`    |                  | Called on every mouse/touch move while dragging.                                              |
| `onPositionChange`      | `(position) => void` |                  | Called when the crop position changes. Receives `{ x, y }`.                                   |

## Contributing

```sh
pnpm install          # install dependencies
pnpm build            # build the library
pnpm lint             # run oxlint
pnpm fmt              # format with oxfmt
pnpm demo:dev         # run demo at localhost:3000
```

### Kudos

Thanks to all contributors:

[dan-lee](https://github.com/dan-lee),
[mtlewis](https://github.com/mtlewis),
[jakerichan](https://github.com/jakerichan),
[hu9o](https://github.com/hu9o),
[ggwzrd](https://github.com/ggwzrd),
[nmn](https://github.com/nmn),
[kukagg](https://github.com/kukagg),
[benwiley4000](https://github.com/benwiley4000),
[ruipserra](https://github.com/ruipserra),
[rdw](https://github.com/rdw),
[sktt](https://github.com/sktt),
[RKJuve](https://github.com/RKJuve),
[tibotiber](https://github.com/tibotiber),
[aumayr](https://github.com/aumayr),
[yamafaktory](https://github.com/yamafaktory),
[codedmart](https://github.com/codedmart),
[chengyin](https://github.com/chengyin),
[MahdiHadrich](https://github.com/MahdiHadrich),
[jyash97](https://github.com/jyash97),
[fivenp](https://github.com/fivenp),
[pvcresin](https://github.com/pvcresin),
[shakaman](https://github.com/shakaman),
[oyeanuj](https://github.com/oyeanuj),
[dev-nima](https://github.com/dev-nima),
[kpbp](https://github.com/kpbp),
[DedaDev](https://github.com/DedaDev),
[vitbokisch](https://github.com/vitbokisch),
[pekq](https://github.com/pekq),
[MateusZitelli](https://github.com/MateusZitelli),
[kimon89](https://github.com/kimon89),
[xaviergonz](https://github.com/xaviergonz),
[jbrumwell](https://github.com/jbrumwell),
[luisrudge](https://github.com/luisrudge),
[bytor99999](https://github.com/bytor99999),
[Mitelak](https://github.com/Mitelak),
[sahanDissanayake](https://github.com/sahanDissanayake),
[sle-c](https://github.com/sle-c),
[YacheLee](https://github.com/YacheLee),
[yogthesharma](https://github.com/yogthesharma),
[taro-shono](https://github.com/taro-shono),
[tanguyantoine](https://github.com/tanguyantoine),
[lulzsun](https://github.com/lulzsun),
[mloeks](https://github.com/mloeks),
[metacortex](https://github.com/metacortex),
[exiify](https://github.com/exiify),
[thinhvoxuan](https://github.com/thinhvoxuan),
[tvankith](https://github.com/tvankith),
[yarikgenza](https://github.com/yarikgenza),
[zhipenglin](https://github.com/zhipenglin),
[TheMcMurder](https://github.com/TheMcMurder),
[notjosh](https://github.com/notjosh),
[xulww](https://github.com/xulww),
[jimniels](https://github.com/jimniels),
[jeffkole](https://github.com/jeffkole),
[deadlyicon](https://github.com/deadlyicon),
[velezjose](https://github.com/velezjose),
[lixiaoyan](https://github.com/lixiaoyan),
[brigand](https://github.com/brigand),
[florapdx](https://github.com/florapdx),
[kuhelbeher](https://github.com/kuhelbeher),
[chris-rudmin](https://github.com/chris-rudmin),
[bluej100](https://github.com/bluej100),
[dehbmarques](https://github.com/dehbmarques),
[kimorq](https://github.com/kimorq)

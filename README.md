# Cyberpunk Interactive 3D Shape

An interactive, animated 3D geometric visualization with cyberpunk aesthetics.

![Cyberpunk Shape Preview](https://placeholder-image.com/cyberpunk-shape.png)

## Features

- **3D Hexagonal Prism**: A fully 3D shape that rotates in space with proper perspective
- **Dynamic Colors**: Glowing color transitions with multiple cyberpunk-themed palettes
- **Interactive Controls**:
  - Drag the shape to reposition it
  - Click outside the shape to cycle through color schemes
  - Mouse proximity influences the shape's movement
- **Physics Simulation**:
  - Realistic bouncing off screen edges
  - Momentum when throwing the shape
  - Attractive force toward cursor position
- **Haptic Feedback** (on supported devices):
  - Vibration when changing colors
  - Vibration when grabbing/releasing the shape
  - Gentle pulses when bouncing off walls
- **Mobile Support**: Fully responsive with touch controls
- **Visual Effects**:
  - Glowing core and edges
  - Animated circuit lines
  - Custom cursor that reacts to proximity
  - 3D rotation on all axes

## Usage

### Desktop Controls
- **Mouse Movement**: Attracts the shape
- **Hover Over Shape**: Cursor changes to indicate it's draggable
- **Click and Drag**: Move the shape freely
- **Click Outside Shape**: Change color scheme
- **Release After Dragging**: Shape will continue moving with momentum

### Mobile Controls
- **Tap and Drag**: Move the shape
- **Tap Outside Shape**: Change color scheme
- **Release After Dragging**: Shape will continue moving with momentum

## Technical Details

- **Canvas Rendering**: Uses HTML5 Canvas for high-performance graphics
- **3D Transformations**: Implements custom 3D matrix transformations and perspective
- **Reactive Animation**: 60fps animation with physics-based movement
- **Web Vibration API**: Implements haptic feedback for mobile devices
- **No External Dependencies**: Pure JavaScript, no libraries required

## Browser Support

- Chrome (desktop & mobile)
- Firefox (desktop & mobile)
- Safari (desktop & mobile)
- Edge (desktop & mobile)

*Note: Vibration functionality requires browser support for the Web Vibration API*

## Installation

No installation needed - this is a standalone HTML file. Simply open in any modern web browser.

```html

```

## Customization

The shape's appearance and behavior can be modified by adjusting values in the code:

- Change the `shape.size` value to adjust the overall size
- Modify `shape.depth` to make the 3D effect more or less pronounced
- Adjust rotation speeds by changing `shape.rotationSpeed`
- Add new color schemes to `shape.colorSchemes` array

## License

MIT License - Free to use and modify

---

Created with cyberpunk inspiration and love for interactive web graphics.

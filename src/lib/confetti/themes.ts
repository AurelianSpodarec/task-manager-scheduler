import type { ColorTheme, ConfettiStyle } from './types'

function color(r: number, g: number, b: number): string {
  return `rgb(${r},${g},${b})`
}

function randomInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1))
}

function fromPalette(palette: readonly [number, number, number][]): string {
  const [r, g, b] = palette[Math.floor(Math.random() * palette.length)]
  return color(r, g, b)
}

const vibrantPalette: readonly [number, number, number][] = [
  [255, 64, 129],
  [255, 107, 0],
  [255, 214, 10],
  [82, 255, 87],
  [0, 210, 255],
  [88, 101, 242],
  [192, 96, 255],
  [255, 52, 179],
]

const streamerPalette: readonly [number, number, number][] = [
  [255, 56, 56],
  [255, 140, 0],
  [255, 220, 0],
  [20, 224, 120],
  [0, 198, 255],
  [96, 124, 255],
  [191, 90, 255],
]

const metallicPalette: readonly [number, number, number][] = [
  [255, 255, 255],
  [235, 238, 245],
  [225, 231, 242],
  [255, 239, 194],
  [250, 224, 140],
]

const bananaPalette: readonly [number, number, number][] = [
  [255, 220, 70],
  [255, 235, 120],
  [255, 198, 40],
  [255, 170, 55],
]

const colorThemes: ColorTheme[] = [
  () => fromPalette(vibrantPalette),
  () => color(255, randomInt(80, 170), randomInt(80, 170)),
  () => color(randomInt(80, 170), 255, randomInt(80, 170)),
  () => color(randomInt(80, 170), randomInt(80, 170), 255),
  () => color(255, randomInt(120, 185), randomInt(120, 255)),
  () => color(randomInt(120, 255), 255, 255),
  () => fromPalette(metallicPalette),
  () => colorThemes[Math.random() < 0.5 ? 1 : 2](),
  () => colorThemes[Math.random() < 0.5 ? 3 : 5](),
  () => fromPalette(bananaPalette),
]

export function getStyleTheme(style: ConfettiStyle): ColorTheme {
  switch (style) {
    case 'metallic':
      return colorThemes[6]
    case 'streamers':
      return () => (Math.random() < 0.75 ? fromPalette(streamerPalette) : colorThemes[8]())
    case 'banana':
      return colorThemes[9]
    case 'party':
    case 'colorful':
    default:
      return () => (Math.random() < 0.8 ? fromPalette(vibrantPalette) : colorThemes[0]())
  }
}

export function sampleThemeColor(style: ConfettiStyle): string {
  return getStyleTheme(style)()
}

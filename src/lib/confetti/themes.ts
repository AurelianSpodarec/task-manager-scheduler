import type { ColorTheme, ConfettiStyle } from './types'

function color(r: number, g: number, b: number): string {
  return `rgb(${r},${g},${b})`
}

function randomInt(max: number): number {
  return Math.floor(Math.random() * max)
}

const vibrantPalette = [
  color(255, 82, 82),
  color(255, 179, 0),
  color(102, 187, 106),
  color(66, 165, 245),
  color(171, 71, 188),
  color(255, 112, 67),
  color(38, 198, 218),
]

const streamerPalette = [
  color(255, 99, 132),
  color(255, 205, 86),
  color(54, 162, 235),
  color(75, 192, 192),
]

const metallicPalette = [
  color(245, 245, 245),
  color(224, 224, 224),
  color(255, 241, 118),
  color(207, 216, 220),
]

const bananaPalette = [
  color(255, 235, 59),
  color(255, 202, 40),
  color(255, 245, 157),
  color(255, 213, 79),
]

function pick(palette: string[]): string {
  return palette[randomInt(palette.length)]
}

const colorThemes: Record<ConfettiStyle, ColorTheme> = {
  colorful: () => pick(vibrantPalette),
  party: () => pick(vibrantPalette),
  metallic: () => pick(metallicPalette),
  streamers: () => pick(streamerPalette),
  banana: () => pick(bananaPalette),
}

export function getStyleTheme(style: ConfettiStyle): ColorTheme {
  return colorThemes[style] ?? colorThemes.colorful
}

export function sampleThemeColor(style: ConfettiStyle): string {
  return getStyleTheme(style)()
}

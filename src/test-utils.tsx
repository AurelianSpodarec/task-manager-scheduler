import { act, render, type RenderOptions, type RenderResult } from '@testing-library/react'
import type { ReactNode } from 'react'

/**
 * Wrapper around testing-library's render that awaits React 19's async act().
 * React 19.2+ requires act() to be awaited for createRoot().render() to flush.
 */
export async function renderAsync(
  ui: ReactNode,
  options?: RenderOptions,
): Promise<RenderResult> {
  let result!: RenderResult
  await act(async () => {
    result = render(ui, options)
  })
  return result
}

export { screen, within, cleanup } from '@testing-library/react'

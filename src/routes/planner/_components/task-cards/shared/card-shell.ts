import { cn } from '@/lib/utils'

type CardTone = 'light' | 'dark'
export function sidebarCardShellClass(tone: CardTone, isDragging: boolean): string {
  return cn(
    'relative w-full cursor-grab overflow-hidden rounded-[9px] border px-[0.62rem] py-[0.62rem] shadow-[0_8px_20px_rgba(16,24,40,0.08)] transition-colors',
    tone === 'dark'
      ? 'border-zinc-700/60 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 hover:border-zinc-600'
      : 'border-zinc-200 bg-gradient-to-br from-white via-zinc-50/45 to-zinc-100/65 hover:border-zinc-300',
    isDragging && 'opacity-40',
  )
}

export function dragPreviewCardShellClass(tone: CardTone): string {
  return cn(
    'relative overflow-hidden rounded-[9px] border px-[0.62rem] py-[0.62rem] shadow-[0_14px_28px_rgba(0,0,0,0.18)]',
    tone === 'dark'
      ? 'border-zinc-700/60 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950'
      : 'border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100',
  )
}

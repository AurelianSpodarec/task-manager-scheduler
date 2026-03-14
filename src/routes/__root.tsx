/* eslint-disable react-refresh/only-export-components -- TanStack route modules export `Route` and a component from the same file. */
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Bell, ChevronDown, Grip } from 'lucide-react'

const user = {
  name: 'Aurelian',
  email: 'aurel@example.com',
  imageUrl:
    'https://avatars.githubusercontent.com/u/10155855?v=4&size=64',
}

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="flex h-dvh min-h-0 flex-col bg-zinc-100/70">
      <header className="shrink-0">
        <nav className="border-b border-zinc-200/80 bg-white/95 backdrop-blur-sm">
          <div className="w-full px-3 sm:px-4 lg:px-6">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex size-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-colors hover:border-zinc-300 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  <span className="sr-only">Open workspace apps</span>
                  <Grip aria-hidden="true" className="size-4" />
                </button>
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex size-8 items-center justify-center rounded-lg bg-rose-600 text-[11px] font-semibold tracking-[0.04em] text-white uppercase">
                    LR
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] leading-5 font-semibold tracking-tight text-zinc-900">
                      Laser Red Team
                    </p>
                    <p className="text-[11px] leading-4 font-medium tracking-[0.08em] text-zinc-500 uppercase">
                      Workspace
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="relative inline-flex size-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-colors hover:border-zinc-300 hover:text-zinc-700 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <Bell aria-hidden="true" className="size-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-zinc-200 bg-white py-1 pr-1.5 pl-1 shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-shadow hover:shadow-[0_4px_10px_rgba(16,24,40,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  <span className="sr-only">Open user menu</span>
                  <img
                    alt={user.name}
                    src={user.imageUrl}
                    className="size-7 rounded-full border border-zinc-200 object-cover"
                  />
                  <ChevronDown aria-hidden="true" className="size-4 text-zinc-500" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex min-h-0 flex-1 flex-col bg-zinc-100/70 px-2 pb-2 md:px-3 md:pb-3">
        <Outlet />
      </main>
    </div>
  )
}

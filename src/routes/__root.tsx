/* eslint-disable react-refresh/only-export-components -- TanStack route modules export `Route` and a component from the same file. */
import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { ChevronDown, Grip } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  const navigate = useNavigate()
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-zinc-100/70">
      <header className="h-[42px] shrink-0">
        <nav className="h-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-sm">
          <div className="h-full w-full px-3 sm:px-4 lg:px-6">
            <div className="flex h-full items-center justify-between">
              <div className="flex items-center gap-2.5">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                    <span className="sr-only">Open workspace menu</span>
                    <Grip aria-hidden="true" className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    <DropdownMenuItem onClick={() => navigate({ to: '/' })}>
                      Home Page
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: '/planner' })}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: '/planner' })}>
                      Calendar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: '/scheduler' })}>
                      Scheduler
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center gap-1 rounded-md px-1">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      xmlSpace="preserve"
                      x="0"
                      y="0"
                      version="1.1"
                      viewBox="0 0 45.1 45.1"
                      className="size-[22px]"
                      aria-hidden="true"
                    >
                      <path
                        fill="#d90000"
                        d="m32.1 19.1-6.6 13.2 6.4 12.9H26l-6.4-12.9 6.6-13.2-3.6-7.2-14 27.8H16l2.7 5.4H0L22.5 0zm3.6 7.2-3 5.9 6.4 12.9H45z"
                      ></path>
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] leading-5 font-semibold tracking-tight text-zinc-900">
                      Laser Red Team
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1 rounded-full border border-zinc-200 bg-white py-1 pr-1.5 pl-1 shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-shadow hover:shadow-[0_3px_8px_rgba(16,24,40,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                    <span className="sr-only">Open user menu</span>
                    <img
                      alt={user.name}
                      src={user.imageUrl}
                      className="size-6 rounded-full border border-zinc-200 object-cover"
                    />
                    <ChevronDown aria-hidden="true" className="size-3.5 text-zinc-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => document.documentElement.classList.toggle('dark')}>
                      Dark Mode
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => navigate({ to: '/' })}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-100/70 px-2 pb-2 md:px-3 md:pb-3">
        <Outlet />
      </main>
    </div>
  )
}

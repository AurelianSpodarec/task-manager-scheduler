/* eslint-disable react-refresh/only-export-components -- TanStack route modules export `Route` and a component from the same file. */
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { BellIcon, MenuIcon } from 'lucide-react'

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
    <div className="flex h-dvh min-h-0 flex-col bg-gray-100">
      <header className="shrink-0">
        <nav className="bg-gray-100">
          <div className="w-full px-3 sm:px-4 lg:px-6">
            <div className="flex h-[42px] items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex size-7 items-center justify-center rounded-md text-gray-600 hover:bg-gray-200 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  <span className="sr-only">Open main menu</span>
                  <MenuIcon aria-hidden="true" className="size-4" />
                </button>
                <span className="text-base leading-none font-bold tracking-wide text-gray-900 md:text-lg">
                  Laser Red Team
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="relative rounded-full p-1 text-gray-500 hover:text-gray-700 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <BellIcon aria-hidden="true" className="size-5" />
                </button>
                <img
                  alt={user.name}
                  src={user.imageUrl}
                  className="size-7 rounded-full outline -outline-offset-1 outline-gray-300"
                />
              </div>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex min-h-0 flex-1 flex-col bg-gray-100 px-2 pt-0 pb-2 md:px-3 md:pt-0 md:pb-3">
        <Outlet />
      </main>
    </div>
  )
}

/* eslint-disable react-refresh/only-export-components -- TanStack route modules export `Route` and a component from the same file. */
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { BellIcon, MenuIcon, XIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type AppRoutePath = '/planner' | '/scheduler'

type NavItem = {
  name: string
  to: AppRoutePath
}

const navigation: NavItem[] = [
  { name: 'Planner', to: '/planner' },
  { name: 'Scheduler', to: '/scheduler' },
]

const userNavigation: NavItem[] = [
  { name: 'Planner', to: '/planner' },
  { name: 'Scheduler', to: '/scheduler' },
]

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
    <div className="flex min-h-screen flex-col">
      <header>
        <nav className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <input id="mobile-menu-toggle" type="checkbox" className="peer sr-only" />
            <div className="flex h-[42px] items-center justify-between">
              <div className="flex items-center">
                <div className="shrink-0">
                  <span className="text-base leading-none font-bold tracking-wide text-black md:text-lg">
                    Laser Red Team
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-center space-x-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.to}
                        activeOptions={{ exact: true }}
                        activeProps={{
                          'aria-current': 'page',
                          className:
                            'inline-flex h-7 items-center rounded-md bg-black px-3 text-sm font-medium text-white',
                        }}
                        inactiveProps={{
                          className:
                            'inline-flex h-7 items-center rounded-md px-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                        }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  <button
                    type="button"
                    className="relative rounded-full p-1 text-gray-500 hover:text-gray-700 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View notifications</span>
                    <BellIcon aria-hidden="true" className="size-5" />
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="relative ml-3 flex max-w-xs items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <img
                        alt=""
                        src={user.imageUrl}
                        className="size-7 rounded-full outline -outline-offset-1 outline-gray-200"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="w-48 min-w-48 rounded-md bg-white py-1 shadow-lg ring-0 outline-1 outline-gray-200"
                    >
                      {userNavigation.map((item) => (
                        <DropdownMenuItem
                          key={item.name}
                          className="rounded-none p-0 focus:bg-gray-100"
                        >
                          <Link
                            to={item.to}
                            activeOptions={{ exact: true }}
                            className="block w-full px-4 py-2 text-sm text-gray-700"
                          >
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                <label
                  htmlFor="mobile-menu-toggle"
                  className="group relative inline-flex cursor-pointer items-center justify-center rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
                >
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Toggle main menu</span>
                  <MenuIcon aria-hidden="true" className="size-5 peer-checked:hidden" />
                  <XIcon aria-hidden="true" className="hidden size-5 peer-checked:block" />
                </label>
              </div>
            </div>
            <div className="hidden md:hidden peer-checked:block">
              <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.to}
                    activeOptions={{ exact: true }}
                    activeProps={{
                      'aria-current': 'page',
                      className:
                        'block rounded-md bg-black px-3 py-2 text-base font-medium text-white',
                    }}
                    inactiveProps={{
                      className:
                        'block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="flex items-center px-5">
                  <div className="shrink-0">
                    <img
                      alt=""
                      src={user.imageUrl}
                      className="size-10 rounded-full outline -outline-offset-1 outline-gray-200"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base/5 font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm font-medium text-gray-600">{user.email}</div>
                  </div>
                  <button
                    type="button"
                    className="relative ml-auto shrink-0 rounded-full p-1 text-gray-500 hover:text-gray-700 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View notifications</span>
                    <BellIcon aria-hidden="true" className="size-6" />
                  </button>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.to}
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}

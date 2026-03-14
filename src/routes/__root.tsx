/* eslint-disable react-refresh/only-export-components -- TanStack route modules export `Route` and a component from the same file. */
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { BellIcon, MenuIcon, XIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type AppRoutePath = '/' | '/dashboard' | '/planner' | '/scheduler' | '/profile'

type NavItem = {
  name: string
  to: AppRoutePath
}

const navigation: NavItem[] = [
  { name: 'Home', to: '/' },
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'Planner', to: '/planner' },
  { name: 'Scheduler', to: '/scheduler' },
  { name: 'Profile', to: '/profile' },
]

const userNavigation: NavItem[] = [
  { name: 'Profile', to: '/profile' },
  { name: 'Planner', to: '/planner' },
  { name: 'Dashboard', to: '/dashboard' },
]

const user = {
  name: 'Aurelian',
  email: 'aurel@example.com',
  imageUrl:
    'https://ui-avatars.com/api/?name=Aurel&background=4f46e5&color=ffffff',
}

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <>
      <header>
        <nav className="bg-gray-800 dark:bg-gray-800/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <input id="mobile-menu-toggle" type="checkbox" className="peer sr-only" />
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="shrink-0">
                  <img
                    alt="Your Company"
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                    className="size-8"
                  />
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.to}
                        activeOptions={{ exact: true }}
                        activeProps={{
                          'aria-current': 'page',
                          className:
                            'rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white dark:bg-gray-950/50',
                        }}
                        inactiveProps={{
                          className:
                            'rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white',
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
                    className="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View notifications</span>
                    <BellIcon aria-hidden="true" className="size-6" />
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="relative ml-3 flex max-w-xs items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <img
                        alt=""
                        src={user.imageUrl}
                        className="size-8 rounded-full outline -outline-offset-1 outline-white/10"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="w-48 min-w-48 rounded-md bg-white py-1 shadow-lg ring-0 outline-1 outline-black/5 dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                    >
                      {userNavigation.map((item) => (
                        <DropdownMenuItem
                          key={item.name}
                          className="rounded-none p-0 focus:bg-gray-100 dark:focus:bg-white/5"
                        >
                          <Link
                            to={item.to}
                            activeOptions={{ exact: true }}
                            className="block w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
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
                  className="group relative inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
                >
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Toggle main menu</span>
                  <MenuIcon aria-hidden="true" className="size-6 peer-checked:hidden" />
                  <XIcon aria-hidden="true" className="hidden size-6 peer-checked:block" />
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
                        'block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white dark:bg-gray-950/50',
                    }}
                    inactiveProps={{
                      className:
                        'block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white',
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 pb-3">
                <div className="flex items-center px-5">
                  <div className="shrink-0">
                    <img
                      alt=""
                      src={user.imageUrl}
                      className="size-10 rounded-full outline -outline-offset-1 outline-white/10"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base/5 font-medium text-white">{user.name}</div>
                    <div className="text-sm font-medium text-gray-400">{user.email}</div>
                  </div>
                  <button
                    type="button"
                    className="relative ml-auto shrink-0 rounded-full p-1 text-gray-400 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
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
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white"
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
      <main>
        <Outlet />
      </main>
    </>
  )
}

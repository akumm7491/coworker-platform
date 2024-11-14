import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState } from '@/store'
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

function UserMenu() {
  const { profile } = useSelector((state: RootState) => state.user)

  if (!profile) return null

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-3 hover:opacity-80">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
        />
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-700">{profile.name}</p>
          <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
        </div>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/profile"
                className={`${
                  active ? 'bg-gray-50' : ''
                } flex px-4 py-2 text-sm text-gray-700 items-center space-x-2`}
              >
                <UserCircleIcon className="w-4 h-4" />
                <span>Your Profile</span>
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/settings"
                className={`${
                  active ? 'bg-gray-50' : ''
                } flex px-4 py-2 text-sm text-gray-700 items-center space-x-2`}
              >
                <Cog6ToothIcon className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-gray-50' : ''
                } flex px-4 py-2 text-sm text-gray-700 items-center space-x-2 w-full`}
              >
                <BellIcon className="w-4 h-4" />
                <span>Notifications</span>
              </button>
            )}
          </Menu.Item>
          <div className="border-t border-gray-100 my-1" />
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-gray-50' : ''
                } flex px-4 py-2 text-sm text-red-600 items-center space-x-2 w-full`}
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default UserMenu

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useDispatch } from 'react-redux'
import { updateProject } from '@/store/slices/projectsSlice'
import { Project, ProjectEnvironment } from '@/types'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface NewEnvironmentModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  environmentToEdit?: ProjectEnvironment
}

function NewEnvironmentModal({ isOpen, onClose, project, environmentToEdit }: NewEnvironmentModalProps) {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: environmentToEdit?.name || '',
    type: environmentToEdit?.type || 'development',
    url: environmentToEdit?.url || '',
    status: environmentToEdit?.status || 'active'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const environmentData: ProjectEnvironment = {
      id: environmentToEdit?.id || `env-${Date.now()}`,
      name: formData.name,
      type: formData.type as 'development' | 'staging' | 'production',
      status: formData.status as 'active' | 'inactive',
      url: formData.url,
      lastDeploy: environmentToEdit?.lastDeploy || null
    }

    const updatedProject = {
      ...project,
      environments: environmentToEdit
        ? project.environments.map(env => 
            env.id === environmentToEdit.id ? environmentData : env
          )
        : [...project.environments, environmentData]
    }

    dispatch(updateProject(updatedProject))
    onClose()
    setFormData({
      name: '',
      type: 'development',
      url: '',
      status: 'active'
    })
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                    {environmentToEdit ? 'Edit Environment' : 'Create New Environment'}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Environment Name
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Development, Staging, Production"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Environment Type
                    </label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Environment URL
                    </label>
                    <input
                      type="url"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                    >
                      {environmentToEdit ? 'Update Environment' : 'Create Environment'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default NewEnvironmentModal

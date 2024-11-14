import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useDispatch } from 'react-redux'
import { addProject } from '@/store/slices/projectsSlice'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requireReview: true,
    autoAssign: true,
    notifyOnChange: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newProject = {
      id: `p${Date.now()}`,
      name: formData.name,
      description: formData.description,
      status: 'active' as const,
      agents: [],
      tasks: [],
      integrations: [],
      environments: [
        {
          id: `e${Date.now()}`,
          name: 'Development',
          type: 'development' as const,
          status: 'active' as const
        }
      ],
      metrics: {
        completionRate: 0,
        taskSuccessRate: 0,
        timeEfficiency: 0,
        resourceUtilization: 0
      },
      settings: {
        requireReview: formData.requireReview,
        autoAssign: formData.autoAssign,
        notifyOnChange: formData.notifyOnChange
      }
    }

    dispatch(addProject(newProject))
    onClose()
    setFormData({
      name: '',
      description: '',
      requireReview: true,
      autoAssign: true,
      notifyOnChange: true
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
                    Create New Project
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Project Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Require Review</p>
                        <p className="text-xs text-gray-500">Require review before task completion</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.requireReview}
                        onChange={(e) => setFormData({ ...formData, requireReview: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Auto-assign Tasks</p>
                        <p className="text-xs text-gray-500">Automatically assign tasks to agents</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.autoAssign}
                        onChange={(e) => setFormData({ ...formData, autoAssign: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Change Notifications</p>
                        <p className="text-xs text-gray-500">Notify team on project changes</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.notifyOnChange}
                        onChange={(e) => setFormData({ ...formData, notifyOnChange: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
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
                      className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Create Project
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

export default NewProjectModal

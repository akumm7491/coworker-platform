import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useDispatch } from 'react-redux'
import { updateProject } from '@/store/slices/projectsSlice'
import { Project, ProjectIntegration } from '@/types'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface EditIntegrationModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  integration: ProjectIntegration
}

function EditIntegrationModal({
  isOpen,
  onClose,
  project,
  integration
}: EditIntegrationModalProps) {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: '',
    config: {
      repository: '',
      branch: '',
      channel: '',
      webhook: ''
    }
  })

  useEffect(() => {
    if (integration) {
      setFormData({
        name: integration.name,
        type: integration.type,
        status: integration.status,
        config: integration.config
      })
    }
  }, [integration])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const updatedIntegration: ProjectIntegration = {
      ...integration,
      name: formData.name,
      type: formData.type as ProjectIntegration['type'],
      status: formData.status as 'active' | 'inactive' | 'error',
      config: formData.config,
      lastSync: new Date().toISOString()
    }

    const updatedProject = {
      ...project,
      integrations: project.integrations.map(i =>
        i.id === integration.id ? updatedIntegration : i
      )
    }

    dispatch(updateProject(updatedProject))
    onClose()
  }

  const renderConfigFields = () => {
    switch (formData.type) {
      case 'github':
      case 'gitlab':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Repository</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.config.repository}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, repository: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.config.branch}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, branch: e.target.value }
                })}
              />
            </div>
          </>
        )
      case 'slack':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">Channel</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.config.channel}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, channel: e.target.value }
              })}
            />
          </div>
        )
      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.config.webhook}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, webhook: e.target.value }
              })}
            />
          </div>
        )
    }
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
                    Edit Integration
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Integration Name
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  {renderConfigFields()}

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
                      Update Integration
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

export default EditIntegrationModal

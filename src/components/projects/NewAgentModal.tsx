import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useDispatch } from 'react-redux'
import { addAgent } from '@/store/slices/agentsSlice'
import { updateProject } from '@/store/slices/projectsSlice'
import { Project, Agent } from '@/types'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface NewAgentModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
}

function NewAgentModal({ isOpen, onClose, project }: NewAgentModalProps) {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: '',
    type: 'developer',
    description: '',
    capabilities: '',
    learningRate: 1.0,
    maxConcurrentTasks: 3
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: formData.name,
      type: formData.type as Agent['type'],
      status: 'idle',
      performance: {
        tasksCompleted: 0,
        successRate: 100,
        averageTime: 0
      },
      capabilities: formData.capabilities.split(',').map(cap => cap.trim()).filter(Boolean),
      learningRate: formData.learningRate,
      maxConcurrentTasks: formData.maxConcurrentTasks,
      description: formData.description
    }

    dispatch(addAgent(newAgent))
    
    const updatedProject = {
      ...project,
      agents: [...project.agents, newAgent.id]
    }
    
    dispatch(updateProject(updatedProject))
    onClose()
    setFormData({
      name: '',
      type: 'developer',
      description: '',
      capabilities: '',
      learningRate: 1.0,
      maxConcurrentTasks: 3
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
                    Create New Agent
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Agent Name
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
                      Agent Type
                    </label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="director">Director</option>
                      <option value="architect">Architect</option>
                      <option value="developer">Developer</option>
                      <option value="qa">QA</option>
                      <option value="devops">DevOps</option>
                      <option value="analytics">Analytics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Capabilities (comma-separated)
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={formData.capabilities}
                      onChange={(e) => setFormData({ ...formData, capabilities: e.target.value })}
                      placeholder="e.g., code-review, testing, deployment"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Learning Rate
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="2.0"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        value={formData.learningRate}
                        onChange={(e) => setFormData({ ...formData, learningRate: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Max Concurrent Tasks
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        value={formData.maxConcurrentTasks}
                        onChange={(e) => setFormData({ ...formData, maxConcurrentTasks: parseInt(e.target.value) })}
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
                      className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                    >
                      Create Agent
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

export default NewAgentModal

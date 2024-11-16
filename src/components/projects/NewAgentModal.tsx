import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useDispatch } from 'react-redux'
import { createAgent } from '@/store/slices/agentsSlice'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
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

      const createdAgent = await dispatch(createAgent(newAgent)).unwrap();
      
      await dispatch(updateProject({
        id: project.id,
        data: {
          ...project,
          agents: [...project.agents, createdAgent.id]
        }
      })).unwrap();

      onClose();
      setFormData({
        name: '',
        type: 'developer',
        description: '',
        capabilities: '',
        learningRate: 1.0,
        maxConcurrentTasks: 3
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      // You might want to show an error message to the user here
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
                    Create New Agent
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="developer">Developer</option>
                      <option value="reviewer">Reviewer</option>
                      <option value="tester">Tester</option>
                      <option value="director">Director</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label htmlFor="capabilities" className="block text-sm font-medium text-gray-700">
                      Capabilities (comma-separated)
                    </label>
                    <input
                      type="text"
                      id="capabilities"
                      value={formData.capabilities}
                      onChange={(e) => setFormData({ ...formData, capabilities: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="e.g., Python, React, Testing"
                    />
                  </div>

                  <div>
                    <label htmlFor="learningRate" className="block text-sm font-medium text-gray-700">
                      Learning Rate
                    </label>
                    <input
                      type="number"
                      id="learningRate"
                      value={formData.learningRate}
                      onChange={(e) => setFormData({ ...formData, learningRate: parseFloat(e.target.value) })}
                      min="0"
                      max="2"
                      step="0.1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="maxConcurrentTasks" className="block text-sm font-medium text-gray-700">
                      Max Concurrent Tasks
                    </label>
                    <input
                      type="number"
                      id="maxConcurrentTasks"
                      value={formData.maxConcurrentTasks}
                      onChange={(e) => setFormData({ ...formData, maxConcurrentTasks: parseInt(e.target.value) })}
                      min="1"
                      max="10"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Create
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

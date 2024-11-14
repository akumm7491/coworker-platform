import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch } from 'react-redux';
import { updateAgent } from '@/store/slices/agentsSlice';
import { Agent } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
}

function EditAgentModal({ isOpen, onClose, agent }: EditAgentModalProps) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    id: agent.id,
    name: agent.name,
    type: agent.type,
    description: '',
    status: agent.status,
    performance: agent.performance,
    settings: {
      maxConcurrentTasks: 3,
      autoStart: true,
      requireApproval: true
    }
  });

  useEffect(() => {
    setFormData({
      id: agent.id,
      name: agent.name,
      type: agent.type,
      description: '',
      status: agent.status,
      performance: agent.performance,
      settings: {
        maxConcurrentTasks: 3,
        autoStart: true,
        requireApproval: true
      }
    });
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateAgent({ id: agent.id, data: formData })).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to update agent:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  <span>Edit Agent</span>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="agent-name" className="block text-sm font-medium text-gray-700">
                        Agent Name
                      </label>
                      <input
                        type="text"
                        id="agent-name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="agent-type" className="block text-sm font-medium text-gray-700">
                        Agent Type
                      </label>
                      <select
                        id="agent-type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                      <label htmlFor="agent-description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="agent-description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="max-tasks" className="block text-sm font-medium text-gray-700">
                        Max Concurrent Tasks
                      </label>
                      <input
                        type="number"
                        id="max-tasks"
                        name="settings.maxConcurrentTasks"
                        min="1"
                        max="10"
                        value={formData.settings.maxConcurrentTasks}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="auto-start"
                          name="settings.autoStart"
                          checked={formData.settings.autoStart}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="auto-start" className="ml-2 block text-sm text-gray-700">
                          Auto-start tasks
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="require-approval"
                          name="settings.requireApproval"
                          checked={formData.settings.requireApproval}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="require-approval" className="ml-2 block text-sm text-gray-700">
                          Require approval for actions
                        </label>
                      </div>
                    </div>
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
                      Save Changes
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default EditAgentModal;

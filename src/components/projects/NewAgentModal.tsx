import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { createAgent } from '@/store/slices/agentsSlice';
import { updateProject } from '@/store/slices/projectsSlice';
import { Project, Agent } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAppDispatch } from '@/store/hooks';

interface NewAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

function NewAgentModal({ isOpen, onClose, project }: NewAgentModalProps) {
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    name: '',
    type: 'developer' as Agent['type'],
    description: '',
    capabilities: '' as string | string[],
    learningRate: 1.0,
    maxConcurrentTasks: 3,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newAgent: Partial<Agent> = {
      name: formData.name,
      type: formData.type,
      capabilities: Array.isArray(formData.capabilities)
        ? formData.capabilities
        : [formData.capabilities],
      learningRate: formData.learningRate,
      maxConcurrentTasks: formData.maxConcurrentTasks,
      description: formData.description,
    };

    try {
      const createdAgent = await dispatch(createAgent(newAgent)).unwrap();

      await dispatch(
        updateProject({
          id: project.id,
          agents: [...project.agents, createdAgent.id],
        })
      ).unwrap();

      onClose();
      setFormData({
        name: '',
        type: 'developer' as Agent['type'],
        description: '',
        capabilities: '' as string | string[],
        learningRate: 1.0,
        maxConcurrentTasks: 3,
      });
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      New Agent
                    </Dialog.Title>
                    <div className="mt-2">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                            Type
                          </label>
                          <select
                            name="type"
                            id="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          >
                            <option value="developer">Developer</option>
                            <option value="researcher">Researcher</option>
                            <option value="assistant">Assistant</option>
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="capabilities"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Capabilities
                          </label>
                          <input
                            type="text"
                            name="capabilities"
                            id="capabilities"
                            value={formData.capabilities}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="learningRate"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Learning Rate
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="2"
                            name="learningRate"
                            id="learningRate"
                            value={formData.learningRate}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="maxConcurrentTasks"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Max Concurrent Tasks
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="1"
                            max="10"
                            name="maxConcurrentTasks"
                            id="maxConcurrentTasks"
                            value={formData.maxConcurrentTasks}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Description
                          </label>
                          <textarea
                            name="description"
                            id="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                          >
                            Create
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={onClose}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default NewAgentModal;

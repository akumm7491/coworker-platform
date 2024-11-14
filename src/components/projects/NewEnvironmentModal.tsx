import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch } from 'react-redux';
import { updateProject } from '@/store/slices/projectsSlice';
import { Project, ProjectEnvironment } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface NewEnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  environmentToEdit?: ProjectEnvironment;
}

function NewEnvironmentModal({ isOpen, onClose, project, environmentToEdit }: NewEnvironmentModalProps) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: environmentToEdit?.name || '',
    type: environmentToEdit?.type || 'development',
    url: environmentToEdit?.url || '',
    status: environmentToEdit?.status || 'active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEnvironment: ProjectEnvironment = {
      id: environmentToEdit?.id || `env_${Date.now()}`,
      ...formData
    };

    const updatedEnvironments = environmentToEdit
      ? project.environments.map(env => env.id === environmentToEdit.id ? newEnvironment : env)
      : [...project.environments, newEnvironment];

    try {
      await dispatch(updateProject({
        id: project.id,
        data: {
          ...project,
          environments: updatedEnvironments
        }
      })).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to update environment:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
                  <span>{environmentToEdit ? 'Edit Environment' : 'New Environment'}</span>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="env-name" className="block text-sm font-medium text-gray-700">
                      Environment Name
                    </label>
                    <input
                      type="text"
                      id="env-name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Development, Staging, Production"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="env-type" className="block text-sm font-medium text-gray-700">
                      Environment Type
                    </label>
                    <select
                      id="env-type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="env-url" className="block text-sm font-medium text-gray-700">
                      Environment URL
                    </label>
                    <input
                      type="url"
                      id="env-url"
                      name="url"
                      value={formData.url}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="env-status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="env-status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
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
                      {environmentToEdit ? 'Save Changes' : 'Create Environment'}
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

export default NewEnvironmentModal;

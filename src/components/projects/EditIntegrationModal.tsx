import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch } from 'react-redux';
import { updateProject } from '@/store/slices/projectsSlice';
import { Project, ProjectIntegration } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EditIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  integration: ProjectIntegration;
}

function EditIntegrationModal({ isOpen, onClose, project, integration }: EditIntegrationModalProps) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: integration.name,
    type: integration.type,
    status: integration.status,
    config: {
      ...integration.config,
      apiKey: integration.config.apiKey || '',
      url: integration.config.url || '',
      token: integration.config.token || ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatedIntegration: ProjectIntegration = {
        ...integration,
        ...formData,
        lastSync: new Date().toISOString()
      };

      const updatedIntegrations = project.integrations.map(i =>
        i.id === integration.id ? updatedIntegration : i
      );

      await dispatch(updateProject({
        id: project.id,
        data: {
          ...project,
          integrations: updatedIntegrations
        }
      })).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to update integration:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('config.')) {
      const configKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        config: {
          ...prev.config,
          [configKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
                  <span>Edit Integration</span>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="integration-name" className="block text-sm font-medium text-gray-700">
                      Integration Name
                    </label>
                    <input
                      type="text"
                      id="integration-name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="integration-type" className="block text-sm font-medium text-gray-700">
                      Integration Type
                    </label>
                    <select
                      id="integration-type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="github">GitHub</option>
                      <option value="gitlab">GitLab</option>
                      <option value="jira">Jira</option>
                      <option value="slack">Slack</option>
                      <option value="aws">AWS</option>
                      <option value="azure">Azure</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="integration-status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="integration-status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Configuration</h4>

                    <div>
                      <label htmlFor="integration-apikey" className="block text-sm font-medium text-gray-700">
                        API Key
                      </label>
                      <input
                        type="password"
                        id="integration-apikey"
                        name="config.apiKey"
                        value={formData.config.apiKey}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="integration-url" className="block text-sm font-medium text-gray-700">
                        URL
                      </label>
                      <input
                        type="url"
                        id="integration-url"
                        name="config.url"
                        value={formData.config.url}
                        onChange={handleChange}
                        placeholder="https://api.example.com"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="integration-token" className="block text-sm font-medium text-gray-700">
                        Access Token
                      </label>
                      <input
                        type="password"
                        id="integration-token"
                        name="config.token"
                        value={formData.config.token}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
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

export default EditIntegrationModal;

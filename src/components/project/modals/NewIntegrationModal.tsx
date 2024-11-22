import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { updateProject } from '@/store/slices/projectsSlice';
import { ProjectIntegration } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface NewIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const NewIntegrationModal = ({ isOpen, onClose, projectId }: NewIntegrationModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const project = useSelector((state: RootState) =>
    state.projects.projects.find(p => p.id === projectId)
  );

  const [formData, setFormData] = useState({
    name: '',
    type: 'github',
    description: '',
    config: {} as Record<string, string>,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfigChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value,
      },
    }));
  };

  const renderConfigFields = () => {
    switch (formData.type) {
      case 'github':
        return (
          <>
            <div>
              <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700">
                Repository URL
              </label>
              <input
                type="text"
                id="repo-url"
                value={formData.config['repo-url'] || ''}
                onChange={e => handleConfigChange('repo-url', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="access-token" className="block text-sm font-medium text-gray-700">
                Access Token
              </label>
              <input
                type="password"
                id="access-token"
                value={formData.config['access-token'] || ''}
                onChange={e => handleConfigChange('access-token', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </>
        );
      case 'jira':
        return (
          <>
            <div>
              <label htmlFor="jira-url" className="block text-sm font-medium text-gray-700">
                Jira URL
              </label>
              <input
                type="text"
                id="jira-url"
                value={formData.config['jira-url'] || ''}
                onChange={e => handleConfigChange('jira-url', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="api-token" className="block text-sm font-medium text-gray-700">
                API Token
              </label>
              <input
                type="password"
                id="api-token"
                value={formData.config['api-token'] || ''}
                onChange={e => handleConfigChange('api-token', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="project-key" className="block text-sm font-medium text-gray-700">
                Project Key
              </label>
              <input
                type="text"
                id="project-key"
                value={formData.config['project-key'] || ''}
                onChange={e => handleConfigChange('project-key', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </>
        );
      case 'slack':
        return (
          <>
            <div>
              <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700">
                Webhook URL
              </label>
              <input
                type="text"
                id="webhook-url"
                value={formData.config['webhook-url'] || ''}
                onChange={e => handleConfigChange('webhook-url', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="channel" className="block text-sm font-medium text-gray-700">
                Channel
              </label>
              <input
                type="text"
                id="channel"
                value={formData.config['channel'] || ''}
                onChange={e => handleConfigChange('channel', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project) {
      console.error('Project not found');
      return;
    }

    try {
      const newIntegration: ProjectIntegration = {
        id: Date.now().toString(),
        ...formData,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await dispatch(
        updateProject({
          id: projectId,
          integrations: [...(project.integrations || []), newIntegration],
        })
      ).unwrap();

      onClose();
      setFormData({
        name: '',
        type: 'github',
        description: '',
        config: {},
      });
    } catch (error) {
      console.error('Error creating integration:', error);
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
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      New Integration
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                        >
                          <option value="github">GitHub</option>
                          <option value="jira">Jira</option>
                          <option value="slack">Slack</option>
                        </select>
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
                        />
                      </div>
                      {renderConfigFields()}
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default NewIntegrationModal;

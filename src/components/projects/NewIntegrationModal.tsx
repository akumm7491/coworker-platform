import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch } from 'react-redux';
import { updateProject } from '@/store/slices/projectsSlice';
import { Project, ProjectIntegration } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface NewIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

function NewIntegrationModal({ isOpen, onClose, project }: NewIntegrationModalProps) {
  // Type the dispatch to accept async thunks
  const dispatch = useDispatch<any>();
  const [formData, setFormData] = useState({
    type: 'github',
    name: '',
    config: {
      repository: '',
      branch: 'main',
      channel: '',
      webhook: '',
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newIntegration: ProjectIntegration = {
      id: `int-${Date.now()}`,
      type: formData.type as 'github' | 'gitlab' | 'jira' | 'slack' | 'aws' | 'azure',
      name: formData.name,
      status: 'active',
      config: formData.config,
      lastSync: new Date().toISOString(),
    };

    const updatedProject = {
      ...project,
      integrations: [...project.integrations, newIntegration],
    };

    dispatch(updateProject(updatedProject))
      .unwrap()
      .then(() => {
        onClose();
        setFormData({
          type: 'github',
          name: '',
          config: {
            repository: '',
            branch: 'main',
            channel: '',
            webhook: '',
          },
        });
      })
      .catch((error: Error) => {
        console.error('Failed to update project:', error);
      });
  };

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
                onChange={e =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, repository: e.target.value },
                  })
                }
                placeholder="org/repo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.config.branch}
                onChange={e =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, branch: e.target.value },
                  })
                }
              />
            </div>
          </>
        );
      case 'slack':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">Channel</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.config.channel}
              onChange={e =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, channel: e.target.value },
                })
              }
              placeholder="#channel"
            />
          </div>
        );
      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.config.webhook}
              onChange={e =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, webhook: e.target.value },
                })
              }
            />
          </div>
        );
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
                    Add New Integration
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Integration Type
                    </label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
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
                    <label className="block text-sm font-medium text-gray-700">
                      Integration Name
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  {renderConfigFields()}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Add Integration
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

export default NewIntegrationModal;

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Card } from '@/components/ui/Card';
import {
  UserCircleIcon,
  EnvelopeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

function Profile() {
  const { profile } = useSelector((state: RootState) => state.user);

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-6">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center text-gray-500">
                <EnvelopeIcon className="w-4 h-4 mr-1" />
                <span className="text-sm">{profile.email}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <UserCircleIcon className="w-4 h-4 mr-1" />
                <span className="text-sm capitalize">{profile.role}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BriefcaseIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Projects Managed</p>
              <p className="text-2xl font-bold text-gray-900">{profile.stats.projectsManaged}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Agents Supervised</p>
              <p className="text-2xl font-bold text-gray-900">{profile.stats.agentsSupervised}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900">{profile.stats.tasksCompleted}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Teams</h2>
          <div className="space-y-3">
            {profile.teams.map(team => (
              <div
                key={team}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700">{team}</span>
                <span className="text-xs text-gray-500">Active</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Theme</span>
              <span className="text-sm font-medium capitalize">{profile.preferences.theme}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Notifications</span>
              <span
                className={`text-sm font-medium ${
                  profile.preferences.notifications ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {profile.preferences.notifications ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Updates</span>
              <span
                className={`text-sm font-medium ${
                  profile.preferences.emailUpdates ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {profile.preferences.emailUpdates ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Profile;

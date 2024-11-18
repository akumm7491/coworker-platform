import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  CpuChipIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { PageContainer, PageHeader, Card, EmptyState, Button } from '@/components/ui';
import { PieChartCard } from '@/components/charts/PieChartCard';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

function Analytics() {
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { agents = [] } = useSelector((state: RootState) => state.agents);
  const { projects = [] } = useSelector((state: RootState) => state.projects);

  const resourceData = [
    { name: 'CPU Usage', value: 65, color: '#818CF8' },
    { name: 'Memory Used', value: 45, color: '#34D399' },
    { name: 'Storage Used', value: 30, color: '#F472B6' },
  ];

  const performanceData = [
    { name: 'Jan', tasks: 85, efficiency: 78 },
    { name: 'Feb', tasks: 88, efficiency: 82 },
    { name: 'Mar', tasks: 92, efficiency: 85 },
    { name: 'Apr', tasks: 90, efficiency: 88 },
    { name: 'May', tasks: 95, efficiency: 92 },
  ];

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            className="flex flex-col items-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Loading analytics data...</p>
          </motion.div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <EmptyState
            icon={BeakerIcon}
            title="Error Loading Analytics"
            description={error}
            action={
              <Button variant="primary" onClick={() => setError(null)}>
                Try Again
              </Button>
            }
          />
        </div>
      </PageContainer>
    );
  }

  if (!agents.length && !projects.length) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <EmptyState
            icon={ChartBarIcon}
            title="No Data Available"
            description="Start by creating some agents or projects to see analytics."
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Analytics Dashboard"
        description="Monitor your autonomous agents and project performance"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RocketLaunchIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">{agents.length}</h3>
          <p className="text-gray-600">Active Agents</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">{projects.length}</h3>
          <p className="text-gray-600">Total Projects</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CpuChipIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">98.5%</h3>
          <p className="text-gray-600">System Uptime</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-pink-100 rounded-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-pink-600" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">92%</h3>
          <p className="text-gray-600">Task Success Rate</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#818CF8"
                  strokeWidth={2}
                  dot={{ fill: '#818CF8' }}
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#34D399"
                  strokeWidth={2}
                  dot={{ fill: '#34D399' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Resource Utilization</h3>
          <div className="h-80">
            <PieChartCard title="Resource Utilization" data={resourceData} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <ClockIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Task Completed</p>
                  <p className="text-sm text-gray-500">Agent A-{i} completed data analysis</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                <span className="text-sm text-gray-500">65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Memory</span>
                <span className="text-sm text-gray-500">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Storage</span>
                <span className="text-sm text-gray-500">30%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-pink-500 h-2 rounded-full" style={{ width: '30%' }} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RocketLaunchIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Active Tasks</span>
              </div>
              <span className="text-sm font-medium text-gray-900">24</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Completed Today</span>
              </div>
              <span className="text-sm font-medium text-gray-900">18</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Processing Power</span>
              </div>
              <span className="text-sm font-medium text-gray-900">12.4 TFLOPs</span>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

export default Analytics;

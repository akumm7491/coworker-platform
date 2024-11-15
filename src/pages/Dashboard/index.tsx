import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  Card,
  PageContainer,
  PageHeader,
  EmptyState,
  Button
} from '@/components/ui';
import { PieChartCard } from '@/components/charts/PieChartCard';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  CpuChipIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { agents = [] } = useSelector((state: RootState) => state.agents);
  const { projects = [] } = useSelector((state: RootState) => state.projects);

  const taskDistribution = [
    { name: 'Completed', value: 45, color: '#818CF8' },
    { name: 'In Progress', value: 35, color: '#34D399' },
    { name: 'Pending', value: 20, color: '#F472B6' }
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
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ 
                rotate: 360,
                transition: { duration: 2, repeat: Infinity, ease: "linear" }
              }}
              className="w-16 h-16 text-indigo-600"
            >
              <BeakerIcon className="w-full h-full" />
            </motion.div>
            <motion.p
              animate={{ 
                opacity: [1, 0.5, 1],
                transition: { duration: 1.5, repeat: Infinity }
              }}
              className="text-indigo-600 font-medium"
            >
              Loading dashboard data...
            </motion.p>
          </motion.div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer variant="error">
        <EmptyState
          icon={BeakerIcon}
          title="Error Loading Dashboard"
          description={error}
          action={
            <Button
              variant="primary"
              leftIcon={<ArrowTrendingUpIcon className="w-5 h-5" />}
              onClick={() => setError(null)}
            >
              Try Again
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (agents.length === 0 || projects.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="Dashboard"
          description="Monitor your autonomous agent platform performance"
          icon={<ChartBarIcon className="w-8 h-8 text-indigo-600" />}
        />
        <EmptyState
          icon={RocketLaunchIcon}
          title="No Data Available"
          description="Start by creating some agents and projects to see dashboard data."
          action={
            <Button
              variant="primary"
              leftIcon={<CpuChipIcon className="w-5 h-5" />}
              onClick={() => {/* Navigate to agents/projects */}}
            >
              Get Started
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Monitor your autonomous agent platform performance"
        icon={<ChartBarIcon className="w-8 h-8 text-indigo-600" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hover blur className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">System Performance</h3>
            <ArrowTrendingUpIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818CF8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34D399" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '0.75rem',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#818CF8"
                  strokeWidth={3}
                  name="Tasks"
                  dot={{ strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  fillOpacity={1}
                  fill="url(#colorTasks)"
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#34D399"
                  strokeWidth={3}
                  name="Efficiency"
                  dot={{ strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  fillOpacity={1}
                  fill="url(#colorEfficiency)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <PieChartCard
          title="Task Distribution"
          icon={<CpuChipIcon className="w-6 h-6 text-indigo-600" />}
          data={taskDistribution}
        />
      </div>

      <Card hover blur className="p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Agent Performance Metrics</h3>
          <RocketLaunchIcon className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4"
          >
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-8 h-8 text-indigo-600" />
              <div>
                <h4 className="text-sm font-medium text-indigo-900">Task Completion</h4>
                <p className="text-2xl font-bold text-indigo-600">92%</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4"
          >
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-8 h-8 text-emerald-600" />
              <div>
                <h4 className="text-sm font-medium text-emerald-900">Response Time</h4>
                <p className="text-2xl font-bold text-emerald-600">1.2s</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4"
          >
            <div className="flex items-center space-x-3">
              <ArrowTrendingUpIcon className="w-8 h-8 text-rose-600" />
              <div>
                <h4 className="text-sm font-medium text-rose-900">Success Rate</h4>
                <p className="text-2xl font-bold text-rose-600">95%</p>
              </div>
            </div>
          </motion.div>
        </div>
      </Card>
    </PageContainer>
  );
}

export default Dashboard;

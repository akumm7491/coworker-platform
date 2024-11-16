import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { fetchProjects } from '@/store/slices/projectsSlice';
import { fetchAgents } from '@/store/slices/agentsSlice';
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
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskDistribution, setTaskDistribution] = useState([
    { name: 'Completed', value: 0, color: '#818CF8' },
    { name: 'In Progress', value: 0, color: '#34D399' },
    { name: 'Pending', value: 0, color: '#F472B6' }
  ]);
  const [performanceData, setPerformanceData] = useState([]);
  
  const { agents = [], loading: agentsLoading } = useSelector((state: RootState) => state.agents);
  const { projects = [], loading: projectsLoading, error: projectsError } = useSelector((state: RootState) => state.projects);

  // Fetch projects and agents on mount
  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchAgents());
  }, [dispatch]);

  // Fetch dashboard analytics data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!projects.length) return; // Don't fetch analytics if no projects exist

      setIsLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('No access token found');
        }

        const [taskDistResponse, perfResponse] = await Promise.all([
          fetch('/api/analytics/task-distribution', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }),
          fetch('/api/analytics/performance', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
        ]);

        // Log responses for debugging
        console.log('Task Distribution Response:', taskDistResponse);
        console.log('Performance Response:', perfResponse);

        if (!taskDistResponse.ok) {
          throw new Error(`Task distribution fetch failed: ${taskDistResponse.status}`);
        }
        if (!perfResponse.ok) {
          throw new Error(`Performance data fetch failed: ${perfResponse.status}`);
        }

        const taskDistData = await taskDistResponse.json();
        const perfData = await perfResponse.json();

        // Validate response data
        if (!Array.isArray(taskDistData)) {
          console.error('Invalid task distribution data:', taskDistData);
          throw new Error('Invalid task distribution data format');
        }
        if (!Array.isArray(perfData)) {
          console.error('Invalid performance data:', perfData);
          throw new Error('Invalid performance data format');
        }

        setTaskDistribution(taskDistData);
        setPerformanceData(perfData);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [projects]);

  const isPageLoading = isLoading || projectsLoading || agentsLoading;
  const pageError = error || projectsError;

  if (isPageLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Dashboard"
          description="Monitor your autonomous agent platform performance"
          icon={<ChartBarIcon className="w-8 h-8 text-indigo-600" />}
        />
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

  if (pageError) {
    return (
      <PageContainer>
        <PageHeader
          title="Dashboard"
          description="Monitor your autonomous agent platform performance"
          icon={<ChartBarIcon className="w-8 h-8 text-indigo-600" />}
        />
        <EmptyState
          icon={BeakerIcon}
          title="Error Loading Dashboard"
          description={pageError}
          action={
            <Button
              variant="primary"
              leftIcon={<ArrowTrendingUpIcon className="w-5 h-5" />}
              onClick={() => {
                setError(null);
                dispatch(fetchProjects());
                dispatch(fetchAgents());
              }}
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
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#34D399"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card hover blur className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Task Distribution</h3>
            <ClockIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="h-64">
            <PieChartCard data={taskDistribution} />
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

export default Dashboard;

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchProjects } from '@/store/slices/projectsSlice';
import { fetchAgents } from '@/store/slices/agentsSlice';
import { Card, PageContainer, PageHeader, EmptyState, Button } from '@/components/ui';
import { PieChartCard } from '@/components/charts/PieChartCard';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ClockIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  CpuChipIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useSelector((state: RootState) => state.projects);
  const { agents, loading: agentsLoading } = useSelector((state: RootState) => state.agents);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskDistribution, setTaskDistribution] = useState<
    {
      name: string;
      value: number;
      color: string;
    }[]
  >([]);
  const [performanceData, setPerformanceData] = useState<
    {
      name: string;
      tasks: number;
      efficiency: number;
    }[]
  >([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await dispatch(fetchProjects()).unwrap();
        await dispatch(fetchAgents()).unwrap();
        setIsLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [dispatch]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulated data for task distribution
        const taskDistData = [
          { name: 'Analysis', value: 35, color: '#818CF8' },
          { name: 'Processing', value: 25, color: '#34D399' },
          { name: 'Research', value: 20, color: '#F472B6' },
          { name: 'Other', value: 20, color: '#FBBF24' },
        ];

        // Simulated performance data
        const perfData = [
          { name: 'Jan', tasks: 85, efficiency: 78 },
          { name: 'Feb', tasks: 88, efficiency: 82 },
          { name: 'Mar', tasks: 92, efficiency: 85 },
          { name: 'Apr', tasks: 90, efficiency: 88 },
          { name: 'May', tasks: 95, efficiency: 92 },
        ];

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
                transition: { duration: 2, repeat: Infinity, ease: 'linear' },
              }}
              className="w-16 h-16 text-indigo-600"
            >
              <BeakerIcon className="w-full h-full" />
            </motion.div>
            <motion.p
              animate={{
                opacity: [1, 0.5, 1],
                transition: { duration: 1.5, repeat: Infinity },
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
              onClick={() => {
                /* Navigate to agents/projects */
              }}
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
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
            <PieChartCard
              title="Task Distribution"
              icon={<ClockIcon className="w-6 h-6 text-indigo-600" />}
              data={taskDistribution}
            />
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

export default Dashboard;

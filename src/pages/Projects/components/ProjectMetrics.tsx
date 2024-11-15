import { Project } from '@/types';
import { Card } from '@/components/ui';
import { PieChartCard } from '@/components/charts/PieChartCard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  ChartBarIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface ProjectMetricsProps {
  project: Project;
}

function ProjectMetrics({ project }: ProjectMetricsProps) {
  const progressData = [
    { name: 'Week 1', progress: 20 },
    { name: 'Week 2', progress: 45 },
    { name: 'Week 3', progress: 65 },
    { name: 'Week 4', progress: 85 },
    { name: 'Week 5', progress: 92 }
  ];

  const taskDistribution = [
    { name: 'Completed', value: 45, color: '#818CF8' },
    { name: 'In Progress', value: 35, color: '#34D399' },
    { name: 'Pending', value: 20, color: '#F472B6' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card hover blur className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Project Progress</h3>
          <ChartBarIcon className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData}>
              <defs>
                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818CF8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
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
                dataKey="progress"
                stroke="#818CF8"
                strokeWidth={3}
                name="Progress"
                dot={{ strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                fillOpacity={1}
                fill="url(#colorProgress)"
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
  );
}

export default ProjectMetrics;

import { Project } from '@/types'
import { Card } from '@/components/ui/Card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface ProjectMetricsProps {
  project: Project
}

function ProjectMetrics({ project }: ProjectMetricsProps) {
  // Sample data - replace with real metrics
  const performanceData = [
    { name: 'Week 1', value: 85 },
    { name: 'Week 2', value: 88 },
    { name: 'Week 3', value: 92 },
    { name: 'Week 4', value: 90 },
    { name: 'Week 5', value: 95 },
  ]

  const taskDistribution = [
    { name: 'Pending', value: 30, color: '#FCD34D' },
    { name: 'In Progress', value: 45, color: '#60A5FA' },
    { name: 'Completed', value: 25, color: '#34D399' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h4 className="text-sm font-medium text-gray-600">Completion Rate</h4>
          <p className="text-2xl font-bold mt-2">{project.metrics.completionRate}%</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${project.metrics.completionRate}%` }}
            />
          </div>
        </Card>
        <Card className="p-4">
          <h4 className="text-sm font-medium text-gray-600">Task Success Rate</h4>
          <p className="text-2xl font-bold mt-2">{project.metrics.taskSuccessRate}%</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${project.metrics.taskSuccessRate}%` }}
            />
          </div>
        </Card>
        <Card className="p-4">
          <h4 className="text-sm font-medium text-gray-600">Resource Utilization</h4>
          <p className="text-2xl font-bold mt-2">{project.metrics.resourceUtilization}%</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: `${project.metrics.resourceUtilization}%` }}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="text-lg font-medium mb-4">Performance Trend</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-lg font-medium mb-4">Task Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {taskDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ProjectMetrics

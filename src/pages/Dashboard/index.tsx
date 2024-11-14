import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'
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
import {
  UserGroupIcon,
  FolderIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ClockIcon,
  BoltIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

function Dashboard() {
  const { agents = [] } = useSelector((state: RootState) => state.agents ?? { agents: [] })
  const { projects = [] } = useSelector((state: RootState) => state.projects ?? { projects: [] })

  const activeAgents = agents.filter(agent => agent.status === 'working')
  const completedTasks = projects.reduce(
    (acc, project) => acc + project.tasks.filter(task => task.status === 'completed').length,
    0
  )

  const stats = [
    {
      title: 'Active Agents',
      value: activeAgents.length,
      total: agents.length,
      icon: UserGroupIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Projects',
      value: projects.filter(p => p.status === 'active').length,
      total: projects.length,
      icon: FolderIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Completed Tasks',
      value: completedTasks,
      total: projects.reduce((acc, project) => acc + project.tasks.length, 0),
      icon: CheckCircleIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'System Health',
      value: '98%',
      icon: BoltIcon,
      color: 'bg-indigo-500'
    }
  ]

  // Sample performance data
  const performanceData = [
    { name: 'Mon', tasks: 12, efficiency: 85 },
    { name: 'Tue', tasks: 15, efficiency: 88 },
    { name: 'Wed', tasks: 18, efficiency: 92 },
    { name: 'Thu', tasks: 14, efficiency: 90 },
    { name: 'Fri', tasks: 20, efficiency: 95 }
  ]

  const taskDistribution = [
    { name: 'Pending', value: 30, color: '#FCD34D' },
    { name: 'In Progress', value: 45, color: '#60A5FA' },
    { name: 'Completed', value: 25, color: '#34D399' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  {stat.total && (
                    <p className="ml-2 text-sm text-gray-500">of {stat.total}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#6366f1"
                  strokeWidth={2}
                  name="Tasks Completed"
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#34d399"
                  strokeWidth={2}
                  name="Efficiency %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Distribution</h3>
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
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {agents.slice(0, 4).map((agent) => (
            <div key={agent.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                agent.status === 'working' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                <p className="text-sm text-gray-500">
                  {agent.currentTask?.title || 'No active task'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}

export default Dashboard

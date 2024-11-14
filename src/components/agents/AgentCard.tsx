import { Agent } from '@/types'

interface AgentCardProps {
  agent: Agent
  onAssignTask: (agentId: string) => void
}

function AgentCard({ agent, onAssignTask }: AgentCardProps) {
  const statusColors = {
    idle: 'bg-gray-200',
    working: 'bg-green-200',
    error: 'bg-red-200'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{agent.name}</h3>
        <span className={`px-2 py-1 rounded ${statusColors[agent.status]}`}>
          {agent.status}
        </span>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-600">Type: {agent.type}</p>
        {agent.currentTask && (
          <p className="text-gray-600">
            Current Task: {agent.currentTask.title}
          </p>
        )}
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Performance</h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Tasks</p>
            <p className="font-medium">{agent.performance.tasksCompleted}</p>
          </div>
          <div>
            <p className="text-gray-500">Success Rate</p>
            <p className="font-medium">{agent.performance.successRate}%</p>
          </div>
          <div>
            <p className="text-gray-500">Avg Time</p>
            <p className="font-medium">{agent.performance.averageTime}s</p>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => onAssignTask(agent.id)}
        className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Assign Task
      </button>
    </div>
  )
}

export default AgentCard

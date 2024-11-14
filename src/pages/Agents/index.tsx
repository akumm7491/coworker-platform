import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import AgentCard from '@/components/agents/AgentCard'

function Agents() {
  const { agents } = useSelector((state: RootState) => state.agents)
  const [selectedType, setSelectedType] = useState<string>('all')

  const filteredAgents = selectedType === 'all'
    ? agents
    : agents.filter(agent => agent.type === selectedType)

  const handleAssignTask = (agentId: string) => {
    // Implement task assignment logic
    console.log('Assign task to agent:', agentId)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agents</h1>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Types</option>
          <option value="director">Director</option>
          <option value="architect">Architect</option>
          <option value="developer">Developer</option>
          <option value="qa">QA</option>
          <option value="devops">DevOps</option>
          <option value="analytics">Analytics</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onAssignTask={handleAssignTask}
          />
        ))}
      </div>
    </div>
  )
}

export default Agents

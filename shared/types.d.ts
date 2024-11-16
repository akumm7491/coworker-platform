export interface Agent {
    id: string;
    name: string;
    status: 'idle' | 'busy' | 'offline';
    type: 'assistant' | 'specialist';
    tasks_completed: number;
    success_rate: number;
    created_at: string;
    updated_at: string;
}
export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
    completion: number;
    agents_assigned: string[];
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=types.d.ts.map
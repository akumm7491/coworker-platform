import { Agent } from '../../database/entities/Agent';

export interface CollaborationMessage {
  type: 'proposal' | 'feedback' | 'knowledge' | 'request' | 'response';
  sender: string;
  recipients: string[];
  content: {
    topic: string;
    data: Record<string, unknown>;
    context?: Record<string, unknown>;
  };
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface CollaborationSession {
  id: string;
  participants: string[];
  topic: string;
  status: 'active' | 'completed' | 'failed';
  messages: CollaborationMessage[];
  startTime: Date;
  endTime?: Date;
  outcome?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export abstract class CollaborationProtocol {
  protected sessions: Map<string, CollaborationSession>;

  constructor() {
    this.sessions = new Map();
  }

  abstract initiateCollaboration(
    initiator: Agent,
    participants: Agent[],
    topic: string,
    context?: Record<string, unknown>
  ): Promise<CollaborationSession>;

  abstract sendMessage(
    sessionId: string,
    message: CollaborationMessage
  ): Promise<void>;

  abstract processMessage(
    sessionId: string,
    message: CollaborationMessage
  ): Promise<void>;

  abstract resolveConflicts(
    sessionId: string,
    conflictingProposals: CollaborationMessage[]
  ): Promise<CollaborationMessage>;

  abstract evaluateOutcome(
    session: CollaborationSession
  ): Promise<{
    success: boolean;
    metrics: Record<string, number>;
    learningExperiences: Record<string, unknown>[];
  }>;

  getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values());
  }
}

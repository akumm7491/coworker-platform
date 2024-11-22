import { Agent } from '@coworker/shared/dist/database/entities/Agent';
import {
  CollaborationProtocol,
  CollaborationMessage,
  CollaborationSession,
} from '@coworker/shared/dist/agents/collaboration/CollaborationProtocol';
import { v4 as uuidv4 } from 'uuid';

export class ConsensusProtocol extends CollaborationProtocol {
  async initiateCollaboration(
    initiator: Agent,
    participants: Agent[],
    topic: string,
    context?: Record<string, unknown>
  ): Promise<CollaborationSession> {
    const sessionId = uuidv4();
    const session: CollaborationSession = {
      id: sessionId,
      participants: [initiator.id, ...participants.map(p => p.id)],
      topic,
      status: 'active',
      messages: [],
      startTime: new Date(),
      context,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  async sendMessage(sessionId: string, message: CollaborationMessage): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Validate sender is part of session
    if (!session.participants.includes(message.sender)) {
      throw new Error('Unauthorized sender');
    }

    session.messages.push(message);

    // If this is a proposal, check for consensus
    if (message.type === 'proposal') {
      await this.checkConsensus(sessionId, message);
    }
  }

  async processMessage(sessionId: string, message: CollaborationMessage): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    switch (message.type) {
      case 'proposal':
        // Wait for feedback from all participants
        const feedbackMessages = session.messages.filter(
          m => m.type === 'feedback' && m.content.topic === message.content.topic
        );

        if (feedbackMessages.length === session.participants.length - 1) {
          // Process consensus
          const consensus = this.calculateConsensus(feedbackMessages);
          if (consensus.approved) {
            await this.implementProposal(session, message);
          }
        }
        break;

      case 'request':
        // Generate response based on request type
        const response = await this.generateResponse(session, message);
        await this.sendMessage(sessionId, response);
        break;
    }
  }

  async resolveConflicts(
    sessionId: string,
    conflictingProposals: CollaborationMessage[]
  ): Promise<CollaborationMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Score each proposal based on agent expertise and proposal quality
    const scoredProposals = await Promise.all(
      conflictingProposals.map(async proposal => {
        const score = await this.scoreProposal(session, proposal);
        return { proposal, score };
      })
    );

    // Select highest scoring proposal
    const bestProposal = scoredProposals.reduce((a, b) => (a.score > b.score ? a : b));

    return bestProposal.proposal;
  }

  async evaluateOutcome(session: CollaborationSession): Promise<{
    success: boolean;
    metrics: Record<string, number>;
    learningExperiences: Record<string, unknown>[];
  }> {
    const metrics = {
      participationRate: this.calculateParticipationRate(session),
      consensusRate: this.calculateConsensusRate(session),
      resolutionTime: this.calculateResolutionTime(session),
      conflictRate: this.calculateConflictRate(session),
    };

    const success =
      metrics.participationRate > 0.7 && metrics.consensusRate > 0.6 && metrics.conflictRate < 0.3;

    const learningExperiences = session.messages.map(message => ({
      context: session.context || {},
      action: message.type,
      outcome: {
        success: true,
        metrics: {
          responseTime: this.calculateResponseTime(message),
          acceptanceRate: this.calculateAcceptanceRate(session, message),
        },
      },
      timestamp: message.timestamp,
    }));

    return { success, metrics, learningExperiences };
  }

  private async checkConsensus(sessionId: string, proposal: CollaborationMessage): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const feedbackMessages = session.messages.filter(
      m => m.type === 'feedback' && m.content.topic === proposal.content.topic
    );

    if (feedbackMessages.length === session.participants.length - 1) {
      const consensus = this.calculateConsensus(feedbackMessages);
      if (consensus.approved) {
        await this.implementProposal(session, proposal);
      }
    }
  }

  private calculateConsensus(feedbackMessages: CollaborationMessage[]): {
    approved: boolean;
    score: number;
  } {
    const approvals = feedbackMessages.filter(m => m.content.data.approved === true).length;
    const score = approvals / feedbackMessages.length;
    return {
      approved: score >= 0.7, // 70% threshold for consensus
      score,
    };
  }

  private async implementProposal(
    session: CollaborationSession,
    proposal: CollaborationMessage
  ): Promise<void> {
    // Implementation logic here
    session.messages.push({
      type: 'response',
      sender: 'system',
      recipients: session.participants,
      content: {
        topic: proposal.content.topic,
        data: {
          status: 'implemented',
          proposalId: proposal.content.data.id,
        },
      },
      timestamp: new Date(),
    });
  }

  private async generateResponse(
    session: CollaborationSession,
    request: CollaborationMessage
  ): Promise<CollaborationMessage> {
    return {
      type: 'response',
      sender: 'system',
      recipients: [request.sender],
      content: {
        topic: request.content.topic,
        data: {
          // Response data based on request type
          status: 'processed',
          requestId: request.content.data.id,
        },
      },
      timestamp: new Date(),
    };
  }

  private async scoreProposal(
    session: CollaborationSession,
    proposal: CollaborationMessage
  ): Promise<number> {
    // Scoring logic based on various factors
    const factors = {
      senderExpertise: 0.4,
      proposalQuality: 0.3,
      contextRelevance: 0.3,
    };

    return Object.values(factors).reduce((sum, factor) => sum + factor, 0);
  }

  private calculateParticipationRate(session: CollaborationSession): number {
    const activeParticipants = new Set(session.messages.map(m => m.sender)).size;
    return activeParticipants / session.participants.length;
  }

  private calculateConsensusRate(session: CollaborationSession): number {
    const proposals = session.messages.filter(m => m.type === 'proposal');
    if (proposals.length === 0) return 1;

    const consensusReached = proposals.filter(proposal => {
      const feedbacks = session.messages.filter(
        m => m.type === 'feedback' && m.content.topic === proposal.content.topic
      );
      return this.calculateConsensus(feedbacks).approved;
    }).length;

    return consensusReached / proposals.length;
  }

  private calculateResolutionTime(session: CollaborationSession): number {
    if (!session.endTime) return 0;
    return session.endTime.getTime() - session.startTime.getTime();
  }

  private calculateConflictRate(session: CollaborationSession): number {
    const proposals = session.messages.filter(m => m.type === 'proposal');
    if (proposals.length === 0) return 0;

    const conflicts = proposals.filter(proposal => {
      const feedbacks = session.messages.filter(
        m =>
          m.type === 'feedback' &&
          m.content.topic === proposal.content.topic &&
          m.content.data.approved === false
      );
      return feedbacks.length > 0;
    }).length;

    return conflicts / proposals.length;
  }

  private calculateResponseTime(message: CollaborationMessage): number {
    // Calculate average time to get responses
    return 0; // Implement actual calculation
  }

  private calculateAcceptanceRate(
    session: CollaborationSession,
    message: CollaborationMessage
  ): number {
    if (message.type !== 'proposal') return 1;

    const feedbacks = session.messages.filter(
      m => m.type === 'feedback' && m.content.topic === message.content.topic
    );

    if (feedbacks.length === 0) return 0;

    const approvals = feedbacks.filter(m => m.content.data.approved === true).length;

    return approvals / feedbacks.length;
  }
}

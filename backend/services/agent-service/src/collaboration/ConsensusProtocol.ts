import { Agent } from '@coworker/shared/dist/database/entities/Agent';
import {
  CollaborationProtocol,
  CollaborationMessage,
  CollaborationSession,
} from '../../../../packages/agents/collaboration/CollaborationProtocol';
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

    // Validate message type
    if (!['proposal', 'feedback', 'request', 'response'].includes(message.type)) {
      throw new Error(`Invalid message type: ${message.type}`);
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
      case 'proposal': {
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
      }

      case 'request': {
        // Generate response based on request type
        const response = await this.generateResponse(session, message);
        await this.sendMessage(sessionId, response);
        break;
      }

      default:
        throw new Error(`Unsupported message type: ${message.type}`);
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

    if (conflictingProposals.length === 0) {
      throw new Error('No proposals to resolve');
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
    if (!session) {
      throw new Error('Session is required');
    }

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
    if (!feedbackMessages || feedbackMessages.length === 0) {
      return { approved: false, score: 0 };
    }

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
    if (!session || !proposal) {
      throw new Error('Session and proposal are required');
    }

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
    if (!session || !request) {
      throw new Error('Session and request are required');
    }

    return {
      type: 'response',
      sender: 'system',
      recipients: [request.sender],
      content: {
        topic: request.content.topic,
        data: {
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
    if (!session || !proposal) {
      throw new Error('Session and proposal are required');
    }

    // Scoring logic based on various factors
    const factors = {
      senderExpertise: 0.4,
      proposalQuality: 0.3,
      contextRelevance: 0.3,
    };

    // Calculate sender expertise based on their participation in the session
    const senderParticipation = session.messages.filter(m => m.sender === proposal.sender).length;
    const totalMessages = session.messages.length;
    const senderExpertiseScore =
      (senderParticipation / (totalMessages || 1)) * factors.senderExpertise;

    // Calculate proposal quality based on content structure and completeness
    const hasContent =
      proposal.content &&
      Object.keys(proposal.content.data).length > 0 &&
      proposal.content.topic.length > 0;
    const hasContext = proposal.content.context && Object.keys(proposal.content.context).length > 0;
    const proposalQualityScore =
      ((hasContent ? 0.6 : 0) + (hasContext ? 0.4 : 0)) * factors.proposalQuality;

    // Calculate context relevance based on session topic alignment
    const topicRelevance = proposal.content.topic === session.topic ? 1 : 0.5;
    const contextRelevanceScore = topicRelevance * factors.contextRelevance;

    // Return weighted sum of all scores
    return senderExpertiseScore + proposalQualityScore + contextRelevanceScore;
  }

  private calculateParticipationRate(session: CollaborationSession): number {
    if (!session || !session.messages || !session.participants) {
      return 0;
    }

    const activeParticipants = new Set(session.messages.map(m => m.sender)).size;
    return activeParticipants / session.participants.length;
  }

  private calculateConsensusRate(session: CollaborationSession): number {
    if (!session || !session.messages) {
      return 0;
    }

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
    if (!session || !session.startTime || !session.endTime) {
      return 0;
    }

    return session.endTime.getTime() - session.startTime.getTime();
  }

  private calculateConflictRate(session: CollaborationSession): number {
    if (!session || !session.messages) {
      return 0;
    }

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
    if (!message || !message.type || message.type !== 'request') {
      return 0;
    }

    // Find responses to this message in any session
    let responses: CollaborationMessage[] = [];
    for (const session of this.sessions.values()) {
      if (session.messages.includes(message)) {
        responses = session.messages.filter(
          m =>
            m.type === 'response' &&
            m.content.topic === message.content.topic &&
            m.timestamp > message.timestamp
        );
        break; // Found the session containing our message
      }
    }

    if (responses.length === 0) return 0;

    // Calculate average response time in milliseconds
    const responseTimes = responses.map(
      response => response.timestamp.getTime() - message.timestamp.getTime()
    );

    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  private calculateAcceptanceRate(
    session: CollaborationSession,
    message: CollaborationMessage
  ): number {
    if (!session || !message || message.type !== 'proposal') {
      return 0;
    }

    const feedbacks = session.messages.filter(
      m => m.type === 'feedback' && m.content.topic === message.content.topic
    );

    if (feedbacks.length === 0) return 0;

    const approvals = feedbacks.filter(m => m.content.data.approved === true).length;

    return approvals / feedbacks.length;
  }
}

export interface LearningExperience {
  context: Record<string, unknown>;
  action: string;
  outcome: {
    success: boolean;
    metrics: Record<string, number>;
    feedback?: string;
  };
  timestamp: Date;
}

export interface LearningModel {
  type: string;
  parameters: Record<string, unknown>;
  version: string;
  experiences: LearningExperience[];
  lastUpdated: Date;
}

export interface LearningStrategy {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export abstract class LearningSystem {
  protected model: LearningModel;
  protected strategy: LearningStrategy;

  constructor(model: LearningModel, strategy: LearningStrategy) {
    this.model = model;
    this.strategy = strategy;
  }

  abstract learn(experience: LearningExperience): Promise<void>;
  
  abstract makeDecision(context: Record<string, unknown>): Promise<{
    action: string;
    confidence: number;
    reasoning: string;
  }>;

  abstract adaptStrategy(performance: Record<string, number>): Promise<void>;
  
  abstract shareKnowledge(peers: string[]): Promise<{
    sharedExperiences: LearningExperience[];
    updatedModel: Partial<LearningModel>;
  }>;

  abstract incorporateKnowledge(
    sharedExperiences: LearningExperience[],
    peerModel: Partial<LearningModel>
  ): Promise<void>;

  getModel(): LearningModel {
    return this.model;
  }

  getStrategy(): LearningStrategy {
    return this.strategy;
  }
}

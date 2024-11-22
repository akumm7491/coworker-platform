import {
  LearningSystem,
  LearningExperience,
  LearningModel,
  LearningStrategy,
} from '../../learning/LearningSystem';

export class ReinforcementLearningSystem extends LearningSystem {
  constructor(model: LearningModel, strategy: LearningStrategy) {
    super(model, strategy);
  }

  async learn(experience: LearningExperience): Promise<void> {
    // Update model based on experience using Q-learning or similar algorithm
    const reward = experience.outcome.success ? 1 : -1;
    const learningRate = (this.strategy.parameters.learningRate as number) || 0.1;
    const discountFactor = (this.strategy.parameters.discountFactor as number) || 0.9;

    // Simple Q-learning update
    const currentValue = (this.model.parameters[experience.action] as number) || 0;
    const maxFutureValue = Math.max(...Object.values(this.model.parameters).map(v => Number(v)));

    this.model.parameters[experience.action] =
      currentValue + learningRate * (reward + discountFactor * maxFutureValue - currentValue);

    // Store experience
    if (!this.model.experiences) {
      this.model.experiences = [];
    }
    this.model.experiences.push(experience);
    this.model.lastUpdated = new Date();
  }

  async makeDecision(context: Record<string, unknown>): Promise<{
    action: string;
    confidence: number;
    reasoning: string;
  }> {
    // Use epsilon-greedy strategy for exploration vs exploitation
    const epsilon = (this.strategy.parameters.epsilon as number) || 0.1;

    if (Math.random() < epsilon) {
      // Explore: choose random action
      const actions = Object.keys(this.model.parameters);
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      return {
        action: randomAction,
        confidence: epsilon,
        reasoning: 'Exploring new possibilities',
      };
    } else {
      // Exploit: choose best action
      const actions = Object.entries(this.model.parameters);
      const bestAction = actions.reduce((a, b) => (Number(a[1]) > Number(b[1]) ? a : b));

      return {
        action: bestAction[0],
        confidence: Number(bestAction[1]),
        reasoning: 'Choosing best known action based on past experiences',
      };
    }
  }

  async adaptStrategy(performance: Record<string, number>): Promise<void> {
    // Adjust learning parameters based on performance
    const successRate = performance.successRate || 0;

    // Adjust exploration rate based on success
    if (successRate > 0.8) {
      // Reduce exploration when performing well
      this.strategy.parameters.epsilon = Math.max(
        0.01,
        ((this.strategy.parameters.epsilon as number) || 0.1) * 0.9
      );
    } else if (successRate < 0.5) {
      // Increase exploration when performing poorly
      this.strategy.parameters.epsilon = Math.min(
        0.5,
        ((this.strategy.parameters.epsilon as number) || 0.1) * 1.1
      );
    }

    // Adjust learning rate based on performance stability
    const performanceVariance = performance.variance || 0;
    if (performanceVariance < 0.1) {
      // Reduce learning rate when performance is stable
      this.strategy.parameters.learningRate = Math.max(
        0.01,
        ((this.strategy.parameters.learningRate as number) || 0.1) * 0.95
      );
    }
  }

  async shareKnowledge(peers: string[]): Promise<{
    sharedExperiences: LearningExperience[];
    updatedModel: Partial<LearningModel>;
  }> {
    // Share successful experiences and current model parameters
    const successfulExperiences = this.model.experiences?.filter(exp => exp.outcome.success) || [];

    return {
      sharedExperiences: successfulExperiences,
      updatedModel: {
        parameters: this.model.parameters,
        version: this.model.version,
      },
    };
  }

  async incorporateKnowledge(
    sharedExperiences: LearningExperience[],
    peerModel: Partial<LearningModel>
  ): Promise<void> {
    // Merge peer experiences with local experiences
    if (!this.model.experiences) {
      this.model.experiences = [];
    }
    this.model.experiences.push(...sharedExperiences);

    // Update model parameters using weighted average
    if (peerModel.parameters) {
      const weight = (this.strategy.parameters.peerLearningWeight as number) || 0.3;
      Object.entries(peerModel.parameters).forEach(([action, value]) => {
        const currentValue = (this.model.parameters[action] as number) || 0;
        this.model.parameters[action] = currentValue * (1 - weight) + Number(value) * weight;
      });
    }

    this.model.lastUpdated = new Date();
  }
}

import { Entity, Column, ManyToMany, OneToMany, OneToOne, JoinColumn, Index } from 'typeorm';
import { Project as SharedProject } from '@coworker/shared/database/entities/Project';
import {
  ProjectStatus,
  ProjectVision,
  ProjectIntegration,
  ProjectDesignSystem,
  ProjectFeature,
  ProjectAnalytics,
} from '@coworker/shared';
import { Agent } from './agent.entity';
import { Task } from './task.entity';
import { Team } from './team.entity';
import { DomainEvent } from '@coworker/shared/events/definitions/DomainEvent';
import {
  ProjectEventTypes,
  isProjectRequirementsEventData,
  isProjectVisionEventData,
  isProjectStatusEventData,
  isProjectDesignSystemEventData,
  isProjectIntegrationEventData,
  isProjectAnalyticsEventData,
  isProjectFeatureEventData,
  isProjectLeadAgentEventData,
  isProjectStartedEventData,
  isProjectCompletedEventData,
  isProjectHoldEventData,
  isProjectResumedEventData,
} from '../events/project.events';

@Entity('projects')
export class Project extends SharedProject {
  @Column()
  @Index()
  declare name: string;

  @Column('text')
  declare description: string;

  @Column('text', { array: true })
  requirements!: string[];

  @Column('jsonb')
  vision!: ProjectVision;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.NOT_STARTED,
  })
  declare status: ProjectStatus;

  @Column('jsonb', { nullable: true })
  declare metadata?: Record<string, unknown>;

  @Column('jsonb')
  integrations!: {
    jira?: ProjectIntegration;
    azure_dev_ops?: ProjectIntegration;
    trello?: ProjectIntegration;
    github?: ProjectIntegration;
    [key: string]: ProjectIntegration | undefined;
  };

  @Column('jsonb')
  design_system!: ProjectDesignSystem;

  @Column('jsonb')
  features!: {
    [key: string]: ProjectFeature;
  };

  @Column('jsonb')
  analytics!: ProjectAnalytics;

  @ManyToMany(() => Agent, agent => agent.projects)
  agents!: Agent[];

  @OneToMany(() => Task, task => task.project)
  tasks!: Task[];

  @OneToMany(() => Team, team => team.project)
  teams!: Team[];

  @OneToOne(() => Agent)
  @JoinColumn({ name: 'lead_agent_id' })
  lead_agent!: Agent;

  declare start_date?: Date;
  declare completion_date?: Date;
  declare deadline?: Date;

  applyEvent(event: DomainEvent): void {
    const { eventType, data } = event;

    switch (eventType) {
      case ProjectEventTypes.REQUIREMENTS_UPDATED:
        if (isProjectRequirementsEventData(data)) {
          this.requirements = data.requirements;
        }
        break;

      case ProjectEventTypes.VISION_UPDATED:
        if (isProjectVisionEventData(data)) {
          this.vision = data.vision;
        }
        break;

      case ProjectEventTypes.STATUS_UPDATED:
        if (isProjectStatusEventData(data)) {
          this.status = data.status;
        }
        break;

      case ProjectEventTypes.DESIGN_SYSTEM_UPDATED:
        if (isProjectDesignSystemEventData(data)) {
          // Ensure we maintain the correct type structure
          const updatedDesignSystem: ProjectDesignSystem = {
            theme: data.designSystem.theme,
            typography: data.designSystem.typography,
            spacing: data.designSystem.spacing,
            radius: data.designSystem.radius,
            icons: data.designSystem.icons,
          };
          this.design_system = updatedDesignSystem;
        }
        break;

      case ProjectEventTypes.INTEGRATION_UPDATED:
        if (isProjectIntegrationEventData(data)) {
          const { type: integrationType, enabled, config } = data.integration;
          const integration: ProjectIntegration = {
            enabled,
            config,
          };
          this.integrations[integrationType] = integration;
        }
        break;

      case ProjectEventTypes.ANALYTICS_UPDATED:
        if (isProjectAnalyticsEventData(data)) {
          const updatedAnalytics: ProjectAnalytics = {
            agent_performance: data.analytics.agent_performance,
            task_completion: data.analytics.task_completion,
            timeline: data.analytics.timeline,
            metrics: data.analytics.metrics,
          };
          this.analytics = updatedAnalytics;
        }
        break;

      case ProjectEventTypes.FEATURE_UPDATED:
        if (isProjectFeatureEventData(data)) {
          const { name, ...featureData } = data.feature;
          this.features[name] = featureData;
        }
        break;

      case ProjectEventTypes.LEAD_AGENT_UPDATED:
        if (isProjectLeadAgentEventData(data)) {
          // Note: This only updates the ID reference. The actual Agent entity
          // needs to be loaded separately if needed.
          this.lead_agent = { id: data.agentId } as Agent;
        }
        break;

      case ProjectEventTypes.STARTED:
        if (isProjectStartedEventData(data)) {
          this.status = data.initialStatus;
          this.start_date = data.startDate;
        }
        break;

      case ProjectEventTypes.COMPLETED:
        if (isProjectCompletedEventData(data)) {
          this.status = data.finalStatus;
          this.completion_date = data.completionDate;
          if (data.metrics) {
            this.analytics.metrics = { ...this.analytics.metrics, ...data.metrics };
          }
        }
        break;

      case ProjectEventTypes.PUT_ON_HOLD:
        if (isProjectHoldEventData(data)) {
          this.status = ProjectStatus.ON_HOLD;
          this.metadata = {
            ...this.metadata,
            holdReason: data.reason,
            expectedResumptionDate: data.expectedResumptionDate,
          };
        }
        break;

      case ProjectEventTypes.RESUMED:
        if (isProjectResumedEventData(data)) {
          this.status = ProjectStatus.IN_PROGRESS;
          if (data.updatedTimeline) {
            if (data.updatedTimeline.newDeadline) {
              this.deadline = data.updatedTimeline.newDeadline;
            }
            if (data.updatedTimeline.adjustedMilestones) {
              this.metadata = {
                ...this.metadata,
                milestones: data.updatedTimeline.adjustedMilestones,
              };
            }
          }
        }
        break;

      default:
        throw new Error(`Unhandled event type: ${eventType}`);
    }
  }
}

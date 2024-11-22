import { v4 as uuidv4 } from 'uuid';
import { cacheService } from '../cache/CacheService.js';
import { storageService } from '../storage/StorageService.js';
import logger from '../../../utils/logger.js';

export interface KnowledgeItem {
  id: string;
  agentId: string;
  type: string;
  content: string;
  source: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  embeddings?: number[];
  tags?: string[];
}

export interface SearchOptions {
  query: string;
  agentId?: string;
  type?: string;
  tags?: string[];
  limit?: number;
  threshold?: number;
}

export class KnowledgeService {
  private static instance: KnowledgeService;
  private knowledgeBase: Map<string, KnowledgeItem> = new Map();
  private readonly vectorDimension = 1536; // For OpenAI embeddings

  private constructor() {
    this.initialize();
  }

  static getInstance(): KnowledgeService {
    if (!KnowledgeService.instance) {
      KnowledgeService.instance = new KnowledgeService();
    }
    return KnowledgeService.instance;
  }

  private async initialize(): Promise<void> {
    await this.loadKnowledgeBase();
  }

  private async loadKnowledgeBase(): Promise<void> {
    // Load knowledge items from database
    // Implementation depends on your database schema
  }

  async addKnowledgeItem(
    item: Omit<KnowledgeItem, 'id' | 'timestamp' | 'embeddings'>,
  ): Promise<KnowledgeItem> {
    const embeddings = await this.generateEmbeddings(item.content);
    const knowledgeItem: KnowledgeItem = {
      ...item,
      id: uuidv4(),
      timestamp: new Date(),
      embeddings,
    };

    // Store knowledge item
    this.knowledgeBase.set(knowledgeItem.id, knowledgeItem);
    await this.persistKnowledgeItem(knowledgeItem);

    logger.info('Knowledge item added:', {
      id: knowledgeItem.id,
      type: knowledgeItem.type,
    });

    return knowledgeItem;
  }

  async searchKnowledge(options: SearchOptions): Promise<KnowledgeItem[]> {
    const queryEmbeddings = await this.generateEmbeddings(options.query);
    const results: Array<{ item: KnowledgeItem; similarity: number }> = [];

    // Filter and calculate similarity scores
    for (const item of this.knowledgeBase.values()) {
      if (
        (!options.agentId || item.agentId === options.agentId) &&
        (!options.type || item.type === options.type) &&
        (!options.tags?.length || options.tags.some(tag => item.tags?.includes(tag)))
      ) {
        const similarity = this.calculateCosineSimilarity(queryEmbeddings, item.embeddings!);

        if (similarity >= (options.threshold || 0.7)) {
          results.push({ item, similarity });
        }
      }
    }

    // Sort by similarity and return top results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, options.limit || 10)
      .map(result => result.item);
  }

  async updateKnowledgeItem(id: string, updates: Partial<KnowledgeItem>): Promise<KnowledgeItem> {
    const item = this.knowledgeBase.get(id);
    if (!item) {
      throw new Error('Knowledge item not found');
    }

    const updatedItem: KnowledgeItem = {
      ...item,
      ...updates,
      embeddings:
        updates.content !== undefined
          ? await this.generateEmbeddings(updates.content)
          : item.embeddings,
    };

    this.knowledgeBase.set(id, updatedItem);
    await this.persistKnowledgeItem(updatedItem);

    return updatedItem;
  }

  async deleteKnowledgeItem(id: string): Promise<void> {
    const item = this.knowledgeBase.get(id);
    if (!item) {
      throw new Error('Knowledge item not found');
    }

    this.knowledgeBase.delete(id);
    await this.removeKnowledgeItem(id);

    logger.info('Knowledge item deleted:', { id });
  }

  async exportKnowledge(agentId: string): Promise<KnowledgeItem[]> {
    return Array.from(this.knowledgeBase.values()).filter(item => item.agentId === agentId);
  }

  async importKnowledge(items: KnowledgeItem[]): Promise<void> {
    for (const item of items) {
      this.knowledgeBase.set(item.id, item);
      await this.persistKnowledgeItem(item);
    }
  }

  private async generateEmbeddings(text: string): Promise<number[]> {
    try {
      // Generate embeddings using OpenAI or another embedding service
      // This is a placeholder implementation
      return new Array(this.vectorDimension).fill(0).map(() => Math.random());
    } catch (error) {
      logger.error('Error generating embeddings:', error);
      throw error;
    }
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private async persistKnowledgeItem(item: KnowledgeItem): Promise<void> {
    // Store knowledge item in database
    // Implementation depends on your database schema
  }

  private async removeKnowledgeItem(id: string): Promise<void> {
    // Remove knowledge item from database
    // Implementation depends on your database schema
  }
}

export const knowledgeService = KnowledgeService.getInstance();

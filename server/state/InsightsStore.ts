// Insights store for managing session summaries, subject metrics, and recent patterns

import { promises as fs } from 'fs';
import path from 'path';
import { SessionSummary, SubjectMetrics, RecentPattern, Mode } from '../../src/types/api';

class InsightsStore {
  private sessionSummaries = new Map<string, SessionSummary>();
  private subjectMetrics = new Map<Mode, SubjectMetrics>();
  private recentPatterns: RecentPattern[] = [];
  private storageFile = path.join(process.cwd(), 'insights.json');
  private initialized = false;

  private async ensureInitialized() {
    if (this.initialized) return;

    try {
      const data = await fs.readFile(this.storageFile, 'utf8');
      const insightsData = JSON.parse(data);
      this.sessionSummaries = new Map(Object.entries(insightsData.sessionSummaries || {}));
      this.subjectMetrics = new Map(Object.entries(insightsData.subjectMetrics || {}).map(([k, v]) => [k as Mode, v as SubjectMetrics]));
      this.recentPatterns = insightsData.recentPatterns || [];
    } catch (error) {
      // File doesn't exist or is corrupted, start with empty data
      console.log('No existing insights file found, starting fresh');
    }

    this.initialized = true;
  }

  private async saveToFile() {
    try {
      const insightsData = {
        sessionSummaries: Object.fromEntries(this.sessionSummaries),
        subjectMetrics: Object.fromEntries(this.subjectMetrics),
        recentPatterns: this.recentPatterns,
      };
      await fs.writeFile(this.storageFile, JSON.stringify(insightsData, null, 2));
    } catch (error) {
      console.error('Failed to save insights to file:', error);
    }
  }

  /**
   * Stores a new session summary
   */
  async saveSessionSummary(summary: SessionSummary): Promise<void> {
    await this.ensureInitialized();
    this.sessionSummaries.set(summary.sessionId, summary);

    // Update subject metrics
    await this.updateSubjectMetrics(summary);

    // Add to recent patterns
    this.recentPatterns.unshift({
      sessionId: summary.sessionId,
      mode: summary.mode,
      pattern: summary.patternsObserved,
      createdAt: summary.createdAt,
    });

    // Keep only last 50 patterns
    if (this.recentPatterns.length > 50) {
      this.recentPatterns = this.recentPatterns.slice(0, 50);
    }

    await this.saveToFile();
  }

  /**
   * Updates subject metrics when a new session summary is added
   */
  private async updateSubjectMetrics(summary: SessionSummary): Promise<void> {
    const mode = summary.mode;
    let metrics = this.subjectMetrics.get(mode);

    if (!metrics) {
      metrics = {
        mode,
        strengthsCorpus: [],
        weaknessesCorpus: [],
        aggregatedSummary: '',
        lastUpdated: Date.now(),
      };
    }

    // Append to corpuses
    metrics.strengthsCorpus.push(summary.strengths);
    metrics.weaknessesCorpus.push(summary.weaknesses);

    // Keep only last 20 entries per corpus
    if (metrics.strengthsCorpus.length > 20) {
      metrics.strengthsCorpus = metrics.strengthsCorpus.slice(-20);
    }
    if (metrics.weaknessesCorpus.length > 20) {
      metrics.weaknessesCorpus = metrics.weaknessesCorpus.slice(-20);
    }

    // Re-summarize the combined corpus (simplified implementation)
    const allStrengths = metrics.strengthsCorpus.join(' ');
    const allWeaknesses = metrics.weaknessesCorpus.join(' ');
    metrics.aggregatedSummary = `Strengths observed: ${allStrengths.substring(0, 200)}... Weaknesses observed: ${allWeaknesses.substring(0, 200)}...`;
    metrics.lastUpdated = Date.now();

    this.subjectMetrics.set(mode, metrics);
  }

  /**
   * Gets session summary by session ID
   */
  async getSessionSummary(sessionId: string): Promise<SessionSummary | undefined> {
    await this.ensureInitialized();
    return this.sessionSummaries.get(sessionId);
  }

  /**
   * Gets subject metrics for a mode
   */
  async getSubjectMetrics(mode: Mode): Promise<SubjectMetrics | undefined> {
    await this.ensureInitialized();
    return this.subjectMetrics.get(mode);
  }

  /**
   * Gets all subject metrics
   */
  async getAllSubjectMetrics(): Promise<Record<Mode, SubjectMetrics>> {
    await this.ensureInitialized();
    const result: Record<Mode, SubjectMetrics> = {} as Record<Mode, SubjectMetrics>;
    for (const mode of ['writing', 'coding', 'math'] as Mode[]) {
      const metrics = this.subjectMetrics.get(mode);
      if (metrics) {
        result[mode] = metrics;
      }
    }
    return result;
  }

  /**
   * Gets recent patterns (last 20)
   */
  async getRecentPatterns(limit: number = 20): Promise<RecentPattern[]> {
    await this.ensureInitialized();
    return this.recentPatterns.slice(0, limit);
  }

  /**
   * Gets all session summaries
   */
  async getAllSessionSummaries(): Promise<SessionSummary[]> {
    await this.ensureInitialized();
    return Array.from(this.sessionSummaries.values());
  }
}

// Export singleton instance
export const insightsStore = new InsightsStore();

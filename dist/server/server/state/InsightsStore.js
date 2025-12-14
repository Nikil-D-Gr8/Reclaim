// Insights store for managing session summaries, subject metrics, and recent patterns
import { promises as fs } from 'fs';
import path from 'path';
class InsightsStore {
    constructor() {
        this.storageFile = path.join(process.cwd(), 'insights.json');
    }
    async loadData() {
        try {
            const data = await fs.readFile(this.storageFile, 'utf8');
            const insightsData = JSON.parse(data);
            return {
                sessionSummaries: new Map(Object.entries(insightsData.sessionSummaries || {})),
                subjectMetrics: new Map(Object.entries(insightsData.subjectMetrics || {}).map(([k, v]) => [k, v])),
                recentPatterns: insightsData.recentPatterns || [],
            };
        }
        catch (error) {
            // File doesn't exist or is corrupted, start with empty data
            console.log('No existing insights file found, starting fresh');
            return {
                sessionSummaries: new Map(),
                subjectMetrics: new Map(),
                recentPatterns: [],
            };
        }
    }
    async saveData(data) {
        try {
            const insightsData = {
                sessionSummaries: Object.fromEntries(data.sessionSummaries),
                subjectMetrics: Object.fromEntries(data.subjectMetrics),
                recentPatterns: data.recentPatterns,
            };
            await fs.writeFile(this.storageFile, JSON.stringify(insightsData, null, 2));
        }
        catch (error) {
            console.error('Failed to save insights to file:', error);
        }
    }
    /**
     * Stores a new session summary
     */
    async saveSessionSummary(summary) {
        const data = await this.loadData();
        data.sessionSummaries.set(summary.sessionId, summary);
        // Update subject metrics
        await this.updateSubjectMetrics(data, summary);
        // Add to recent patterns
        data.recentPatterns.unshift({
            sessionId: summary.sessionId,
            mode: summary.mode,
            pattern: summary.patternsObserved,
            createdAt: summary.createdAt,
        });
        // Keep only last 50 patterns
        if (data.recentPatterns.length > 50) {
            data.recentPatterns = data.recentPatterns.slice(0, 50);
        }
        await this.saveData(data);
    }
    /**
     * Updates subject metrics when a new session summary is added
     */
    async updateSubjectMetrics(data, summary) {
        const mode = summary.mode;
        let metrics = data.subjectMetrics.get(mode);
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
        data.subjectMetrics.set(mode, metrics);
    }
    /**
     * Gets session summary by session ID
     */
    async getSessionSummary(sessionId) {
        const data = await this.loadData();
        return data.sessionSummaries.get(sessionId);
    }
    /**
     * Gets subject metrics for a mode
     */
    async getSubjectMetrics(mode) {
        const data = await this.loadData();
        return data.subjectMetrics.get(mode);
    }
    /**
     * Gets all subject metrics
     */
    async getAllSubjectMetrics() {
        const data = await this.loadData();
        const result = {};
        for (const mode of ['writing', 'coding', 'math']) {
            const metrics = data.subjectMetrics.get(mode);
            if (metrics) {
                result[mode] = metrics;
            }
        }
        return result;
    }
    /**
     * Gets recent patterns (last 20)
     */
    async getRecentPatterns(limit = 20) {
        const data = await this.loadData();
        return data.recentPatterns.slice(0, limit);
    }
    /**
     * Gets all session summaries
     */
    async getAllSessionSummaries() {
        const data = await this.loadData();
        return Array.from(data.sessionSummaries.values());
    }
}
// Export singleton instance
export const insightsStore = new InsightsStore();

"use strict";
// Insights store for managing session summaries, subject metrics, and recent patterns
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insightsStore = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class InsightsStore {
    constructor() {
        this.sessionSummaries = new Map();
        this.subjectMetrics = new Map();
        this.recentPatterns = [];
        this.storageFile = path_1.default.join(process.cwd(), 'insights.json');
        this.initialized = false;
    }
    async ensureInitialized() {
        if (this.initialized)
            return;
        try {
            const data = await fs_1.promises.readFile(this.storageFile, 'utf8');
            const insightsData = JSON.parse(data);
            this.sessionSummaries = new Map(Object.entries(insightsData.sessionSummaries || {}));
            this.subjectMetrics = new Map(Object.entries(insightsData.subjectMetrics || {}).map(([k, v]) => [k, v]));
            this.recentPatterns = insightsData.recentPatterns || [];
        }
        catch (error) {
            // File doesn't exist or is corrupted, start with empty data
            console.log('No existing insights file found, starting fresh');
        }
        this.initialized = true;
    }
    async saveToFile() {
        try {
            const insightsData = {
                sessionSummaries: Object.fromEntries(this.sessionSummaries),
                subjectMetrics: Object.fromEntries(this.subjectMetrics),
                recentPatterns: this.recentPatterns,
            };
            await fs_1.promises.writeFile(this.storageFile, JSON.stringify(insightsData, null, 2));
        }
        catch (error) {
            console.error('Failed to save insights to file:', error);
        }
    }
    /**
     * Stores a new session summary
     */
    async saveSessionSummary(summary) {
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
    async updateSubjectMetrics(summary) {
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
    async getSessionSummary(sessionId) {
        await this.ensureInitialized();
        return this.sessionSummaries.get(sessionId);
    }
    /**
     * Gets subject metrics for a mode
     */
    async getSubjectMetrics(mode) {
        await this.ensureInitialized();
        return this.subjectMetrics.get(mode);
    }
    /**
     * Gets all subject metrics
     */
    async getAllSubjectMetrics() {
        await this.ensureInitialized();
        const result = {};
        for (const mode of ['writing', 'coding', 'math']) {
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
    async getRecentPatterns(limit = 20) {
        await this.ensureInitialized();
        return this.recentPatterns.slice(0, limit);
    }
    /**
     * Gets all session summaries
     */
    async getAllSessionSummaries() {
        await this.ensureInitialized();
        return Array.from(this.sessionSummaries.values());
    }
}
// Export singleton instance
exports.insightsStore = new InsightsStore();

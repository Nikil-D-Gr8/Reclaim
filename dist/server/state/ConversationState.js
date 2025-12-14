// Conversation state model for tracking conversation history and agent reasoning
/**
 * Infers the user's intent from their message content
 * TODO: Implement real intent detection logic
 */
export function inferIntentFromMessage(content) {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes("solution") || lowerContent.includes("answer")) {
        return "ask_solution";
    }
    if (lowerContent.includes("hint") || lowerContent.includes("help")) {
        return "ask_hint";
    }
    if (lowerContent.includes("tried") || lowerContent.includes("attempt")) {
        return "explain_attempt";
    }
    return "clarify_concept"; // Default
}
/**
 * Updates the learning phase based on number of attempts
 * TODO: Implement more sophisticated phase detection
 */
export function updatePhase(attempts) {
    if (attempts === 0)
        return "exploration";
    if (attempts === 1)
        return "struggling";
    if (attempts <= 3)
        return "progressing";
    return "ready";
}

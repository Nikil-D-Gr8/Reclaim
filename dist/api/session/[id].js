"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Session ID is required' });
    }
    // Placeholder session object
    // In a real implementation, this would fetch from a database
    const session = {
        id,
        mode: 'writing', // default mode
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
    const response = {
        session,
    };
    res.status(200).json(response);
}

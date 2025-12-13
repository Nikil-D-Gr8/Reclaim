"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { mode } = req.body;
    if (!mode) {
        return res.status(400).json({ error: 'Mode is required' });
    }
    // Generate a unique session ID
    const sessionId = crypto.randomUUID();
    const createdAt = Date.now();
    const response = {
        sessionId,
        mode,
        createdAt,
    };
    res.status(200).json(response);
}

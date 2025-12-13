"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { sessionId, mode } = req.body;
    if (!sessionId || !mode) {
        return res.status(400).json({ error: 'Session ID and mode are required' });
    }
    // TODO: In the future, trigger Kestra workflow here to process session data
    const response = {
        success: true,
    };
    res.status(200).json(response);
}

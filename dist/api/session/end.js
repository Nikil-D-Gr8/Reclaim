import { sessionStore } from '../../dist/server/server/state/SessionStore.js';
// Import the process-kestra handler directly to avoid HTTP calls within Vercel
import processKestraHandler from './process-kestra.js';
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { sessionId, mode } = req.body;
    if (!sessionId || !mode) {
        return res.status(400).json({ error: 'Session ID and mode are required' });
    }
    try {
        // Fetch session state
        const session = await sessionStore.getSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        if (session.status === 'summarizing' || session.status === 'completed') {
            return res.status(400).json({ error: 'Session already ended or processing' });
        }
        // Flatten messages into plain text string
        const conversation = session.messages
            .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n');
        // Generate a unique execution ID for Kestra
        const kestraExecutionId = `exec_${sessionId}_${Date.now()}`;
        // Update session status to summarizing
        await sessionStore.updateSession(sessionId, {
            status: 'summarizing',
            kestraExecutionId,
        });
        // Trigger Kestra webhook (authentication required)
        const kestraUrl = 'http://localhost:8080/api/v1/executions/webhook/company.team/session_summary_simple/session-summary-simple';
        // Create Basic Auth credentials
        const username = process.env.KESTRA_USERNAME || 'admin';
        const password = process.env.KESTRA_PASSWORD || 'kestra';
        const credentials = Buffer.from(`${username}:${password}`).toString('base64');
        try {
            const kestraResponse = await fetch(kestraUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${credentials}`,
                },
                body: JSON.stringify({ conversation }),
            });
            if (!kestraResponse.ok) {
                console.error('Kestra webhook failed:', kestraResponse.status, kestraResponse.statusText);
                // Reset session status on failure
                await sessionStore.updateSession(sessionId, { status: 'active' });
                return res.status(500).json({ error: 'Failed to trigger Kestra workflow' });
            }
            // Capture the execution ID from Kestra response
            let executionId = '';
            try {
                const responseData = await kestraResponse.json();
                console.log('Kestra webhook response:', responseData);
                // Extract execution ID from response
                if (responseData.id) {
                    executionId = responseData.id;
                }
            }
            catch (parseError) {
                console.warn('Could not parse Kestra response JSON:', parseError);
            }
            // Update session with execution ID
            if (executionId) {
                await sessionStore.updateSession(sessionId, { kestraExecutionId: executionId });
                console.log('Kestra webhook triggered successfully for session:', sessionId, 'Execution ID:', executionId);
                // START SYNCHRONOUS POLLING - Block until completion (Vercel allows longer execution)
                console.log('🚀 KESTRA: Starting synchronous polling for session:', sessionId, 'Execution ID:', executionId);
                // Keep polling until we get a definitive result - SYNCHRONOUS to avoid Vercel timeout issues
                let attempts = 0;
                const maxAttempts = 18; // 18 attempts = 3 minutes with 10s intervals
                let completed = false;
                while (!completed && attempts < maxAttempts) {
                    attempts++;
                    console.log(`🔄 KESTRA: Polling attempt ${attempts}/${maxAttempts} for session ${sessionId}...`);
                    try {
                        console.log(`🔍 KESTRA: Calling process-kestra handler directly for session ${sessionId}`);
                        // Create mock request/response objects for direct function call
                        const mockReq = {
                            method: 'POST',
                            body: { sessionId },
                        };
                        let capturedResponse = null;
                        const mockRes = {
                            status: (code) => ({
                                json: (data) => {
                                    capturedResponse = { status: code, data };
                                    return mockRes;
                                }
                            }),
                            json: (data) => {
                                capturedResponse = { status: 200, data };
                                return mockRes;
                            }
                        };
                        // Call the process-kestra handler directly (no HTTP request)
                        await processKestraHandler(mockReq, mockRes);
                        console.log(`📄 KESTRA: Handler response:`, JSON.stringify(capturedResponse, null, 2));
                        if (capturedResponse && capturedResponse.data) {
                            const result = capturedResponse.data;
                            if (result.status === 'processing') {
                                console.log(`⏳ KESTRA: Session ${sessionId} still processing (attempt ${attempts})...`);
                                // Wait 10 seconds before next attempt
                                await new Promise(resolve => setTimeout(resolve, 10000));
                            }
                            else if (result.status === 'completed') {
                                console.log(`🎉 KESTRA: Session ${sessionId} COMPLETED after ${attempts} attempts!`);
                                // PRINT KESTRA SUMMARY OUTPUT - CRITICAL
                                if (result.sessionSummary) {
                                    console.log('📊 KESTRA SUMMARY OUTPUT:');
                                    console.log('   Session ID:', result.sessionSummary.sessionId);
                                    console.log('   Mode:', result.sessionSummary.mode);
                                    console.log('   Patterns Observed:', result.sessionSummary.patternsObserved);
                                    console.log('   Strengths:', result.sessionSummary.strengths);
                                    console.log('   Weaknesses:', result.sessionSummary.weaknesses);
                                    console.log('   Created At:', new Date(result.sessionSummary.createdAt).toISOString());
                                    console.log('📊 END KESTRA SUMMARY OUTPUT');
                                }
                                else {
                                    console.warn('⚠️ KESTRA: Completed but no sessionSummary in result');
                                }
                                completed = true;
                                break;
                            }
                        }
                        else {
                            console.error(`❌ KESTRA: No response from process-kestra handler`);
                            // Wait before retrying
                            await new Promise(resolve => setTimeout(resolve, 10000));
                        }
                    }
                    catch (pollError) {
                        console.error(`❌ KESTRA: Polling error for session ${sessionId}:`);
                        const error = pollError;
                        console.error(`   Error name:`, error.name);
                        console.error(`   Error message:`, error.message);
                        console.error(`   Error stack:`, error.stack);
                        // Wait before retrying
                        await new Promise(resolve => setTimeout(resolve, 10000));
                    }
                }
                if (!completed) {
                    console.warn(`⚠️ KESTRA: Session ${sessionId} still processing after ${maxAttempts} attempts (3 minutes), ending session anyway`);
                }
            }
            else {
                console.log('Kestra webhook triggered successfully for session:', sessionId, '(no execution ID captured)');
            }
        }
        catch (kestraError) {
            console.error('Error calling Kestra:', kestraError);
            // Reset session status on failure
            await sessionStore.updateSession(sessionId, { status: 'active' });
            return res.status(500).json({ error: 'Failed to connect to Kestra' });
        }
        const response = {
            success: true,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

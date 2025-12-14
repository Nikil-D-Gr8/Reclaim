import { VercelRequest, VercelResponse } from '@vercel/node';
import { sessionStore } from '../../dist/server/server/state/SessionStore.js';
import { insightsStore } from '../../dist/server/server/state/InsightsStore.js';

// Handle Kestra webhook notifications when executions complete
async function handleKestraWebhook(req: VercelRequest, res: VercelResponse) {
  try {
    const webhookData = req.body;
    console.log('🎣 KESTRA WEBHOOK RECEIVED:', JSON.stringify(webhookData, null, 2));

    // Extract execution details
    const executionId = webhookData.execution?.id;
    const executionState = webhookData.execution?.state?.current;

    if (!executionId) {
      console.warn('⚠️ KESTRA WEBHOOK: No execution ID in webhook data');
      return res.status(400).json({ error: 'No execution ID' });
    }

    console.log(`🎯 KESTRA WEBHOOK: Execution ${executionId} state: ${executionState}`);

    if (executionState === 'SUCCESS') {
      // Find the session that corresponds to this execution
      const sessionIds = await sessionStore.getActiveSessions();

      // Find session with matching execution ID
      let matchingSession: any;
      for (const sessionId of sessionIds) {
        const session = await sessionStore.getSession(sessionId);
        if (session?.kestraExecutionId === executionId && session.status !== 'completed') {
          matchingSession = session;
          break;
        }
      }

      if (!matchingSession) {
        console.warn(`⚠️ KESTRA WEBHOOK: No matching uncompleted session found for execution ${executionId}`);
        return res.status(200).json({ message: 'No matching session found' });
      }

      console.log(`✅ KESTRA WEBHOOK: Found matching session ${matchingSession.id}, processing results...`);

      // Process the completed execution
      await processCompletedExecution(matchingSession.id, webhookData);

      return res.status(200).json({ message: 'Webhook processed successfully' });
    }

    // For other states, just acknowledge
    return res.status(200).json({ message: `Execution ${executionState}` });

  } catch (error) {
    console.error('❌ KESTRA WEBHOOK ERROR:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Process a completed Kestra execution
async function processCompletedExecution(sessionId: string, webhookData: any) {
  try {
    // Fetch session state
    const session = await sessionStore.getSession(sessionId);
    if (!session) {
      console.error(`Session ${sessionId} not found`);
      return;
    }

    // Extract the Gemini output from webhook data or fetch from Kestra API
    let geminiText = '';

    // Try to get outputs from webhook data first
    const taskRuns = webhookData.execution?.taskRunList || [];
    const geminiTask = taskRuns.find((task: any) => task.taskId === 'gemini_reflection');

    if (geminiTask?.outputs?.body) {
      try {
        const parsedBody = JSON.parse(geminiTask.outputs.body);
        geminiText = parsedBody.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } catch (parseError) {
        console.error('Failed to parse webhook outputs:', parseError);
      }
    }

    // If no output in webhook, fetch from Kestra API
    if (!geminiText) {
      console.log('📡 Fetching results from Kestra API...');
      const executionId = session.kestraExecutionId;
      const apiUrl = `http://localhost:8080/api/v1/main/executions/${executionId}`;

      const username = process.env.KESTRA_USERNAME || 'admin';
      const password = process.env.KESTRA_PASSWORD || 'kestra';
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');

      const apiResponse = await fetch(apiUrl, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });

      if (apiResponse.ok) {
        const executionData: any = await apiResponse.json();
        const geminiTaskFromApi = executionData.taskRunList?.find((task: any) => task.taskId === 'gemini_reflection');

        if (geminiTaskFromApi?.outputs?.body) {
          const parsedBody = JSON.parse(geminiTaskFromApi.outputs.body);
          geminiText = parsedBody.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      }
    }

    if (!geminiText) {
      console.error('❌ Could not extract Gemini output');
      return;
    }

    console.log('🎯 KESTRA WEBHOOK OUTPUT - Raw Gemini Text:', geminiText);

    // Parse the Gemini response text
    let patternsObserved = '';
    let strengths = '';
    let weaknesses = '';

    // Extract Patterns Observed section
    const patternsMatch = geminiText.match(/Patterns Observed\s*\n([\s\S]*?)(?=\n\nStrengths and Weaknesses)/);
    if (patternsMatch) {
      patternsObserved = patternsMatch[1].trim();
    }

    // Extract Strengths and Weaknesses section
    const swMatch = geminiText.match(/Strengths and Weaknesses\s*\n([\s\S]*)$/);
    if (swMatch) {
      const swContent = swMatch[1];

      const strengthsMatch = swContent.match(/Strengths:\s*([\s\S]*?)(?=\n\nWeaknesses:|\n*$)/);
      const weaknessesMatch = swContent.match(/Weaknesses:\s*([\s\S]*?)(?=\n*$)/);

      if (strengthsMatch) {
        strengths = strengthsMatch[1].trim();
      }
      if (weaknessesMatch) {
        weaknesses = weaknessesMatch[1].trim();
      }
    }

    // Create session summary
    const sessionSummary = {
      sessionId,
      mode: session.mode,
      patternsObserved: patternsObserved || 'Learning patterns observed during the session',
      strengths: strengths || 'Various strengths demonstrated',
      weaknesses: weaknesses || 'Areas identified for improvement',
      createdAt: Date.now(),
    };

    console.log('📊 KESTRA WEBHOOK SUMMARY:');
    console.log('   Session ID:', sessionSummary.sessionId);
    console.log('   Mode:', sessionSummary.mode);
    console.log('   Patterns Observed:', sessionSummary.patternsObserved);
    console.log('   Strengths:', sessionSummary.strengths);
    console.log('   Weaknesses:', sessionSummary.weaknesses);

    // Save to insights store
    await insightsStore.saveSessionSummary(sessionSummary);

    // Update session status to completed
    await sessionStore.updateSession(sessionId, { status: 'completed' });

    console.log('✅ KESTRA WEBHOOK: Session processing completed for session:', sessionId);

  } catch (error) {
    console.error('❌ Error processing completed execution:', error);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle Kestra webhook notifications
  if (req.method === 'PUT') {
    return handleKestraWebhook(req, res);
  }

  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    // Fetch session state
    const session = await sessionStore.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.kestraExecutionId) {
      return res.status(400).json({ error: 'Session has no Kestra execution ID' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({ error: 'Session is already completed' });
    }

    // Poll the Kestra API for execution results using the execution ID
    const executionId = session.kestraExecutionId;
    const apiUrl = `http://localhost:8080/api/v1/main/executions/${executionId}`;

    try {
      console.log('🔍 KESTRA: Starting to poll execution:', executionId);
      console.log('🔗 KESTRA: API URL:', apiUrl);

      // Create Basic Auth credentials
      const username = process.env.KESTRA_USERNAME || 'admin';
      const password = process.env.KESTRA_PASSWORD || 'kestra';
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
      console.log('🔐 KESTRA: Using credentials - Username:', username, 'Password:', password.replace(/./g, '*'));

      const apiResponse = await fetch(apiUrl, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 KESTRA: HTTP Response Status:', apiResponse.status);
      console.log('📡 KESTRA: HTTP Response Headers:', Object.fromEntries(apiResponse.headers.entries()));

      if (!apiResponse.ok) {
        console.log('⏳ KESTRA: Execution not ready yet, HTTP status:', apiResponse.status);
        return res.status(200).json({ status: 'processing' }); // Still processing
      }

      const executionData = await apiResponse.json() as any;

      console.log('🎯 KESTRA: ===== FULL EXECUTION API RESPONSE =====');
      console.log('🎯 KESTRA: ENTIRE RESPONSE JSON:', JSON.stringify(executionData, null, 2));
      console.log('🎯 KESTRA: ===== END FULL RESPONSE =====');

      // Also log specific parts
      console.log('🎯 KESTRA: Execution ID:', executionData.id);
      console.log('🎯 KESTRA: State:', executionData.state);
      console.log('🎯 KESTRA: TaskRunList count:', executionData.taskRunList?.length || 0);
      console.log('🎯 KESTRA: TaskRunList:', executionData.taskRunList);

      // Check if execution is complete
      const isComplete = executionData.state?.current === 'SUCCESS';

      if (!isComplete) {
        console.log('Execution not complete yet, state:', executionData.state?.current);
        return res.status(200).json({ status: 'processing' }); // Still processing
      }

      console.log('Execution completed! Extracting results...');

      // Extract the Gemini output from the taskRunList
      // Find the task with taskId = "gemini_reflection"
      const geminiTask = executionData.taskRunList?.find((task: any) => task.taskId === 'gemini_reflection');

      if (!geminiTask) {
        console.error('Could not find gemini_reflection task in execution');
        return res.status(500).json({ error: 'Could not find Gemini task in execution' });
      }

      if (!geminiTask.outputs?.body) {
        console.error('Gemini task has no outputs.body');
        return res.status(500).json({ error: 'Gemini task has no output body' });
      }

      // Parse the outputs.body (it's stringified JSON)
      let geminiText = '';
      try {
        const parsedBody = JSON.parse(geminiTask.outputs.body);
        geminiText = parsedBody.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!geminiText) {
          console.error('Could not extract text from Gemini response');
          return res.status(500).json({ error: 'Could not extract text from Gemini response' });
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini outputs.body:', parseError);
        return res.status(500).json({ error: 'Failed to parse Gemini output' });
      }

      console.log('🎯 KESTRA WEBHOOK OUTPUT - Raw Gemini Text:', geminiText);
      console.log('📦 SUMMARY_OUTPUT');
      console.log(geminiTask.outputs.body);

      // Parse the Gemini response text
      let patternsObserved = '';
      let strengths = '';
      let weaknesses = '';

      console.log('🎯 KESTRA OUTPUT - Full Gemini Text:', geminiText);

      // Parse based on actual Gemini output format from the API response
      // The text contains "Patterns Observed" followed by patterns, then "Strengths and Weaknesses"

      // Extract Patterns Observed section (from "Patterns Observed" to "Strengths and Weaknesses")
      const patternsMatch = geminiText.match(/Patterns Observed\s*\n([\s\S]*?)(?=\n\nStrengths and Weaknesses)/);
      if (patternsMatch) {
        patternsObserved = patternsMatch[1].trim();
      }

      // Extract Strengths and Weaknesses section (everything after "Strengths and Weaknesses")
      const swMatch = geminiText.match(/Strengths and Weaknesses\s*\n([\s\S]*)$/);
      if (swMatch) {
        const swContent = swMatch[1];

        // Split into Strengths and Weaknesses
        const strengthsMatch = swContent.match(/Strengths:\s*([\s\S]*?)(?=\n\nWeaknesses:|\n*$)/);
        const weaknessesMatch = swContent.match(/Weaknesses:\s*([\s\S]*?)(?=\n*$)/);

        if (strengthsMatch) {
          strengths = strengthsMatch[1].trim();
        }
        if (weaknessesMatch) {
          weaknesses = weaknessesMatch[1].trim();
        }
      }

      // If we couldn't parse the logs, use default values
      if (!patternsObserved || !strengths || !weaknesses) {
        console.warn('Could not parse Gemini output from logs, using defaults');
        console.warn('Parsed values - Patterns:', patternsObserved, 'Strengths:', strengths, 'Weaknesses:', weaknesses);
        patternsObserved = patternsObserved || 'Learning patterns observed during the session';
        strengths = strengths || 'Various strengths demonstrated';
        weaknesses = weaknesses || 'Areas identified for improvement';
      }

      console.log('📊 FINAL PROCESSED SUMMARY:');
      console.log('   Patterns Observed:', patternsObserved);
      console.log('   Strengths:', strengths);
      console.log('   Weaknesses:', weaknesses);

      // Create session summary
      const sessionSummary = {
        sessionId,
        mode: session.mode,
        patternsObserved,
        strengths,
        weaknesses,
        createdAt: Date.now(),
      };

      console.log('💾 SAVING SESSION SUMMARY:', sessionSummary);

      // Save to insights store
      await insightsStore.saveSessionSummary(sessionSummary);

      // Update session status to completed
      await sessionStore.updateSession(sessionId, { status: 'completed' });

      console.log('✅ SESSION PROCESSING COMPLETED for session:', sessionId);

      res.status(200).json({
        status: 'completed',
        sessionSummary,
        message: 'Summary processed successfully',
      });

    } catch (kestraError) {
      console.error('Error polling Kestra:', kestraError);
      res.status(200).json({ status: 'processing' }); // Assume still processing on error
    }

  } catch (error) {
    console.error('Error processing Kestra results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

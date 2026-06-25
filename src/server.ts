import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json({ limit: '32kb' }));

app.get('/api/groq/status', (_req, res) => {
  res.json({ configured: Boolean(process.env['GROQ_API_KEY']) });
});

app.post('/api/groq/chat', async (req, res) => {
  const apiKey = process.env['GROQ_API_KEY'];
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';

  if (!apiKey) {
    res.status(503).json({ error: 'Server-side AI proxy is not configured.' });
    return;
  }

  if (!prompt || prompt.length > 12000) {
    res.status(400).json({ error: 'Invalid prompt.' });
    return;
  }

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({ error: data?.error?.message ?? 'Groq request failed.' });
      return;
    }

    res.json({ text: data?.choices?.[0]?.message?.content?.trim() ?? '' });
  } catch {
    res.status(502).json({ error: 'AI proxy request failed.' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

import { execSync } from 'child_process';
import https from 'https';

// Get Firebase access token
let token;
try {
  token = execSync('firebase auth:export /dev/null --format=json 2>/dev/null; cat ~/.config/firebase/application_default_credentials.json 2>/dev/null || true').toString();
} catch {}

// Use google-auth-library if available
import('@google-cloud/storage').then(async ({ Storage }) => {
  const storage = new Storage({ projectId: 'myauth-app-8d1d2' });
  const bucket = storage.bucket('myauth-app-8d1d2.firebasestorage.app');
  await bucket.setCorsConfiguration([{
    origin: ['*'],
    method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
    maxAgeSeconds: 3600,
    responseHeader: ['Content-Type', 'Authorization', 'Content-Length'],
  }]);
  console.log('CORS set successfully!');
}).catch(() => {
  console.log('Install: npm install @google-cloud/storage');
});

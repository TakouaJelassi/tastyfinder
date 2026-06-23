// Copy this file to environment.ts and environment.prod.ts and fill in your values.
// Get Firebase config from: https://console.firebase.google.com → Project Settings → Your apps
export const environment = {
  production: false,
  // Ein oder mehrere Spoonacular-Keys. Bei Tageslimit (402) rotiert die App automatisch zum nächsten.
  spoonacularApiKeys: ['YOUR_SPOONACULAR_KEY', 'YOUR_SECOND_SPOONACULAR_KEY'],
  firebase: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    databaseURL: 'https://YOUR_PROJECT_ID-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
  },
};

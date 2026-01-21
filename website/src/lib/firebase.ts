import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCgnAJArcnq8SXkWta_f61S05Z2Wue03bc",
  authDomain: "voicenote-pro-f6a9d.firebaseapp.com",
  projectId: "voicenote-pro-f6a9d",
  storageBucket: "voicenote-pro-f6a9d.firebasestorage.app",
  messagingSenderId: "433638665102",
  appId: "1:433638665102:web:53d2d07be98062628dd2df"
};

// Initialize Firebase app (avoid re-initializing)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
export default app;

// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDbrA1foAoc3L1CzkD6pd7zRfyZl6X4Csk",
  authDomain: "sachin-f6875.firebaseapp.com",
  projectId: "sachin-f6875",
  storageBucket: "sachin-f6875.appspot.com", // FIXED this from .app to .com
  messagingSenderId: "917334580527",
  appId: "1:917334580527:web:c4adff85eadfe809aa55da",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

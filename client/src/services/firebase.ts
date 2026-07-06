import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBtBQG3Eo7JdywoIERT2CoIjyVe4wlN3NI",
  authDomain: "migraine-genie.firebaseapp.com",
  projectId: "migraine-genie",
  storageBucket: "migraine-genie.firebasestorage.app",
  messagingSenderId: "864470899431",
  appId: "1:864470899431:web:b1fa4420704c5a6b2fe042",
  measurementId: "G-01CDC0T326",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

// Mock Firebase Configuration & Services
// Replace with actual config when connecting to a real project
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app;
try {
  // Only init if real keys are provided, else we mock
  if(firebaseConfig.apiKey !== "YOUR_API_KEY") {
    app = initializeApp(firebaseConfig);
  }
} catch (error) {
  console.log("Firebase not initialized:", error);
}

// Simulated Google Provider wrapper
export const mockGoogleSignIn = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
          uid: 'google_user_' + Math.floor(Math.random() * 10000),
          email: 'citizen@example.com',
          displayName: 'Jane Doe',
          photoURL: 'https://i.pravatar.cc/150?img=1',
          role: 'Citizen' // Mock Role
        }
      });
    }, 1000);
  });
};

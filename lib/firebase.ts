import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// TODO: Configure Firebase
// 1. Va sur https://console.firebase.google.com/
// 2. Crée un projet (ex: "artvault")
// 3. Project Settings > General > Your apps > Add app (Web)
// 4. Copie les valeurs du SDK config dans ton fichier .env.local
// 5. Active Firestore : Build > Firestore Database > Create database
// 6. Pour commencer, choisis "Start in test mode" (à sécuriser plus tard)
//
// Structure Firestore attendue :
// Collection : assets
// Document fields : { id, name, category, amount, currency, createdAt }
// category values : "liquidites" | "investissements" | "actifs"

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            ?? 'TODO_API_KEY',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? 'TODO_AUTH_DOMAIN',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         ?? 'TODO_PROJECT_ID',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? 'TODO_STORAGE_BUCKET',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? 'TODO_SENDER_ID',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             ?? 'TODO_APP_ID',
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const db = getFirestore(app)

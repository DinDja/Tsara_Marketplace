import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth"
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore"
import { auth, db, FIRESTORE_COLLECTIONS } from "@/lib/firebase/config"
import type { User } from "@/lib/types"

function mapFirebaseUser(fu: any): User {
  return {
    id: fu.uid,
    name: fu.displayName || fu.email?.split("@")[0] || "Usuário",
    email: fu.email || "",
    role: "user",
    avatar: fu.photoURL || undefined,
    createdAt: fu.metadata?.creationTime ? new Date(fu.metadata.creationTime) : new Date(),
  }
}

async function saveUserToFirestore(user: User) {
  await setDoc(doc(db, FIRESTORE_COLLECTIONS.users, user.id), {
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || null,
    createdAt: Timestamp.now(),
  }, { merge: true })
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const user = mapFirebaseUser(cred.user)
  const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.users, user.id))
  if (snap.exists() && snap.data().role) {
    user.role = snap.data().role
  }
  return user
}

export async function registerUser(name: string, email: string, password: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: name })
  const user = mapFirebaseUser(cred.user)
  user.name = name
  await saveUserToFirestore(user)
  return user
}

export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider()
  const cred = await signInWithPopup(auth, provider)
  const user = mapFirebaseUser(cred.user)
  const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.users, user.id))
  if (!snap.exists()) {
    await saveUserToFirestore(user)
  } else {
    user.role = snap.data()?.role || "user"
  }
  return user
}

export async function logout(): Promise<void> {
  await signOut(auth)
}

export async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      unsubscribe()
      if (!firebaseUser) return resolve(null)
      const user = mapFirebaseUser(firebaseUser)
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.users, user.id))
      if (snap.exists() && snap.data().role) {
        user.role = snap.data().role
      }
      resolve(user)
    })
  })
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

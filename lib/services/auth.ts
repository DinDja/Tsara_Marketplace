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

async function enrichUserFromFirestore(user: User): Promise<User> {
  const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.users, user.id))
  if (snap.exists()) {
    const data = snap.data()
    if (data.role) user.role = data.role
    if (data.phone) user.phone = data.phone
    if (data.name) user.name = data.name
    if (data.avatar) user.avatar = data.avatar
  }
  return user
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
  const user = await enrichUserFromFirestore(mapFirebaseUser(cred.user))
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
    Object.assign(user, {
      role: snap.data()?.role || "user",
      phone: snap.data()?.phone || undefined,
    })
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
      const user = await enrichUserFromFirestore(mapFirebaseUser(firebaseUser))
      resolve(user)
    })
  })
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

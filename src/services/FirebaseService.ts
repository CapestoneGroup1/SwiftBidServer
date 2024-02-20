import { FirebaseApp, FirebaseOptions, initializeApp } from "firebase/app"
import { firebaseConfig } from "../config/firebase"
import {
  FirebaseStorage,
  StorageReference,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage"

export class FirebaseService {
  static instance: FirebaseService
  firebaseApp: FirebaseApp
  storage: FirebaseStorage
  storageRef: StorageReference

  private constructor() {
    this.firebaseApp = initializeApp(firebaseConfig)
    this.storage = getStorage(this.firebaseApp)
    this.storageRef = ref(this.storage)
  }

  static initialize() {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService()
    }
    return FirebaseService.instance
  }

  async saveFileToFirebase(buffer: Buffer, reference: string): Promise<string | null> {
    try {
        this.storageRef = ref(this.storage, reference);
      const uploadTaskSnapShot = await uploadBytesResumable(this.storageRef, buffer)
      const url = await getDownloadURL(uploadTaskSnapShot.ref)
      return url
    } catch (error) {
      console.error(error)
      return null
    }
  }
}

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

  async saveFileToFirebase(buffer: Buffer, reference: string, contentType: string): Promise<string | null> {
    try {
      const storageref = ref(this.storage, reference);
      const metadata = {
        contentType: contentType
      };
      const uploadTaskSnapShot = await uploadBytesResumable(storageref, buffer, metadata)
      const url = await getDownloadURL(uploadTaskSnapShot.ref)
      return url
    } catch (error) {
      console.error(error)
      return null
    }
  }
}

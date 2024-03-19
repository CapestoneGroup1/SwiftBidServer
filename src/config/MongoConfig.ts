import mongoose, { Connection } from "mongoose"

export class MongoClient {
  static async initialize(): Promise<boolean> {
    const url = process.env.MONGO_URL || ""
    console.log("Connecting to MONGO DATABASE URL: " +url)
    if (!url) {
      throw new Error("Invalid connection URL")
    }
    await mongoose.connect(url)
    console.log(`Connected to MOngoDb successfulyy...`)
    return true
  }
}

export default MongoClient

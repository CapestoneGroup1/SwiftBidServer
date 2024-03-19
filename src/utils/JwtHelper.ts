import jwt, { Secret } from "jsonwebtoken"

export class JwtHelper {
  static getSecret(): Secret {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error("Secret Not Provided")
    }
    return secret
  }

  static createToken(tokenPayload: Record<string, any>): string {
    const secretKey = this.getSecret()
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 5645645656
    return jwt.sign({ ...tokenPayload, exp: expirationTime }, secretKey)
  }

  static verifyTokenAndReturnPayload(token: string): Record<string, any> | null {
    const secretKey = this.getSecret()
    try {
      return jwt.verify(token, secretKey) as Record<string, any>
    } catch (error) {
      return null
    }
  }
}

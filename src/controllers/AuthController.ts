import { NextFunction, Request, Response } from "express"
import { UserModel } from "../models/user"
import { JwtHelper } from "../utils/JwtHelper"
import { CustomRequest } from "../types"
import { generateOtp } from "../utils/commonUtils"
import { EmailConfig } from "../config/EmailConfig"
import bcrypt from "bcrypt"
import { BadRequest } from "../utils/exceptions"

export class AuthController {
  /**
   * In case of Error
   * return  400 status and json as
   * {
   *   error: "corresponding error message"
   * }
   *
   * In case of Success
   * return  200 status and json as
   * {
   *   token : "newly created JWT token"
   * }
   * @param req
   * @param res
   * @param next
   * @returns
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body

      console.log(email,password);
      const user = await UserModel.findOne({ email })

      if (!user) {
        return res.status(400).json({ error: "User not found" })
      }

      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        return res.status(400).json({ error: "Incorrect password" })
      }

      return res.json({
        token: JwtHelper.createToken({ id: user._id }),
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = req.body

      const existingUser = await UserModel.findOne({
        $or: [{ email: userData.email }, { username: userData.username }],
      })

      if (existingUser) {
        return res.status(400).json({ error: "Email or Username Already Exists." })
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      userData.password = hashedPassword

      const newUser = await UserModel.create({...userData, savedCards: [], stripeCustomerId: ""})
      const token = JwtHelper.createToken({ id: newUser._id })

      return res.status(201).json({ token })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  static async forgotPassword(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new BadRequest("User not Exist")

      const { email, id } = req.user
      const otp = generateOtp()
      await EmailConfig.sendEmail(email, "RESET PASSWORD", `OTP to Reset your password in  ${otp}`)

      await UserModel.findByIdAndUpdate(id, {
        otp,
      })

      return res.json({
        message: "OTP Successfully sent to " + email,
      })
    } catch (error) {
      next(error)
    }
  }
  static async resetPassword(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, otp } = req.body

      const user = await UserModel.findOne({ email })

      if (!user) {
        throw new BadRequest("User not Exist")
      }
      if (user.otp !== otp) {
        throw new BadRequest("Invalid OTP!!!")
      }
      if (!password) {
        throw new BadRequest("Invalid Password")
      }
      const hashedPassword = await bcrypt.hash(password, 10)
      await UserModel.findByIdAndUpdate(user.id, {
        password: hashedPassword,
        otp: "",
      })

      return res.json({
        message: "Password Updated successdfully",
      })
    } catch (error) {
      next(error)
    }
  }
}
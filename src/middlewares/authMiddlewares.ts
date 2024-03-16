import { NextFunction, Request, Response } from "express"
import { CustomRequest, ForgotPasswordType, User } from "../types"
import { UserModel } from "../models/user"
import { BadRequest, ForbiddenError, UnAuthenticatedError } from "../utils/exceptions"
import { JwtHelper } from "../utils/JwtHelper"
import { getUserProfile } from "../services/UserServices"
import { Schema } from "joi"

export const isUserEmailExists = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { body } = req
    const { email } = body as ForgotPasswordType

    const existingUser = await UserModel.findOne({ email })
    if (!existingUser) {
      console.error("Email not available in system")
      throw new BadRequest("Email not available in system")
    }

    req.user = existingUser as User
    next()
  } catch (error) {
    next(error)
  }
}

export const validateToken = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    const payload = JwtHelper.verifyTokenAndReturnPayload(token || "")
    if (!payload) {
      throw new UnAuthenticatedError("Session Expired/Invalid")
    }
    const userDetails = await getUserProfile(payload.id);
    req.userId = payload.id
    req.user = userDetails as User;
    next()
  } catch (error) {
    next(error)
  }
}

export const isUserAdmin = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { userId = "" } = req
    const userDetails = await getUserProfile(userId)
    if (!userDetails || userDetails.role.toLowerCase() !== "admin") {
      throw new ForbiddenError("Forbidden from Access")
    }
    next()
  } catch (error) {
    next(error)
  }
}

export const isUserNotAdmin = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { userId = "" } = req
    const userDetails = await getUserProfile(userId)
    if (!userDetails || userDetails.role.toLowerCase() === "admin") {
      throw new ForbiddenError("Admin Account cannot place bids")
    }
    next()
  } catch (error) {
    next(error)
  }
}

export const validateSchema = (schema: Schema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      const firstError = error.details[0].message || ''
      throw new BadRequest(firstError);
    }
    next();
  } catch (error) {
    next(error);
  }
};
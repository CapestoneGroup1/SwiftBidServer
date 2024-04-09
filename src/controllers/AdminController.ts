import { NextFunction, Response } from "express"
import { CustomRequest } from "../types"
import { BadRequest } from "../utils/exceptions"
import { SupportModel } from "../models/support"

export const saveQuery = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, message } = req.body || {}
    if (!name || !email || !message) {
      throw new BadRequest("Please Fill all the Details")
    }

    const details = await SupportModel.create({
      email,
      message,
      name,
      date: new Date().toDateString(),
    })

    return res.json({ ...details.toJSON() })
  } catch (error) {
    next(error)
  }
}

export const getQueries = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const records = await SupportModel.find({})
    return res.json([...records])
  } catch (error) {
    next(error)
  }
}

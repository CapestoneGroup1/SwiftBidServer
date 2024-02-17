import { NextFunction, Response } from "express"
import { CustomRequest, User } from "../types"
import { getUserFromEmail, getUserProfile, saveUserProfile } from "../services/UserServices"
import { BadRequest } from "../utils/exceptions"

export class UserController {
  /**
   * This is to get profile for loggedIN users
   * This will return user details based on the userId, which was there in token and appended to req object through previous middleware.
   * @param req
   * @param res
   * @param next
   * @returns
   */
  static async getUserProfile(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { userId = "" } = req
      const userDetails = await getUserProfile(userId)
      if (!userDetails) {
        throw new BadRequest("User doesnt Exist")
      }
      const { username, email, mobile, address, province, city, postalcode } = userDetails

      return res.json({ username, email, mobile, address, province, city, postalcode })
    } catch (error) {
      next(error)
    }
  }

  /**
   * This is t get profile for Other users for admin purpose...
   * @param req
   * @param res
   * @param next
   * @returns
   */
  static async getUserProfileFromPath(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userDetails = await getUserProfile(id)
      if (!userDetails) {
        throw new BadRequest("User doesnt Exist")
      }
      const { username, email, mobile, address, province, city, postalcode } = userDetails

      return res.json({ username, email, mobile, address, province, city, postalcode })
    } catch (error) {
      next(error)
    }
  }

  static async saveUserProfile(req: CustomRequest, res: Response, next: NextFunction) {
    try {

      if(!req.userId)
      throw new BadRequest("User doesnt Exist")

      const body = req.body as User;
      const { email, mobile, address, province, city, postalcode } = body;

      //DO EMial unique check...
      if(email) {
        const userFromDB = await getUserProfile(req.userId);
        if(userFromDB?.email !== email) {
          const existingUser = await getUserFromEmail(email);
          if(existingUser) {
            throw new BadRequest("Email already Exists")
          }
        }
      }

      const savedUser = await saveUserProfile({ email, mobile, address, province, city, postalcode }, req.userId);
      if(!savedUser) {
        throw new Error("Internal Error");
      }

      //Update.
      return res.json({ 
        email: savedUser.email,
        mobile: savedUser.mobile,
        address: savedUser.address,
        province: savedUser.province,
        city: savedUser.city,
        postalcode: savedUser.postalcode,
        username: savedUser.postalcode
      })

    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

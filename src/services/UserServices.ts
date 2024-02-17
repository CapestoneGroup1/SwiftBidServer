import { UserModel } from "../models/user"
import { User } from "../types"

export const getUserProfile = async (id: string) => {
  return await UserModel.findById(id)
}

export const getUserFromEmail = async (email: string) => {
  return await UserModel.findOne({
    email
  })
}

export const saveUserProfile= async (user: Partial<User>, id: string) => {
  console.log(user)
  console.log(id)

  return await UserModel.findByIdAndUpdate(id, {
    ...user
  })
}

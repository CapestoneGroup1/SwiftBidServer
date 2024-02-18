import { Request } from "express"

export interface User {
  id: string
  username?: string
  email: string
  mobile: string
  address: string
  role: string
  password: string
  province: string
  city: string
  postalcode: string
  country: string
  otp: string
}
export interface CustomRequest extends Request {
  user?: User
  userId?: string
}

export interface ForgotPasswordType {
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  username: string
  email: string
  password: string
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  imageurl: string;
  category: string; 
  userid: string; 
  status?: boolean; 
  bidenddate?: Date; 
  adminapproval?: boolean; 
}
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
  primaryCard: string
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
  id: string
  name: string
  description: string
  price: string
  imageurl: string
  category: string
  userid: string
  status?: boolean
  bidenddate: Date
  adminapproval?: boolean
}
export interface AddCategoryRequest {
  name: string
}

export interface EditCategoryRequest {
  name: string
  id: string
}

export interface ApproveRejectPRoduct {
  id: string
  rejectReason: string
}

export interface PlaceNewBid {
  productid: string
  bidprice: number
}

export interface AddNewCreditCard {
  name: string
  number: string
  exp_month: string
  exp_year: string
  cvc: string
  address_country: string
  address_zip: string
  testCardToken?: string
}
export interface SavedCard {
  id: string
  object: string
  address_city: string | null
  address_country: string | null
  address_line1: string | null
  address_line1_check: string | null
  address_line2: string | null
  address_state: string | null
  address_zip: string | null
  address_zip_check: string | null
  brand: string
  country: string
  customer: string
  cvc_check: string
  dynamic_last4: string | null
  exp_month: number
  exp_year: number
  fingerprint: string
  funding: string
  last4: string
  metadata: Record<string, any>
  name: string | null
  tokenization_method: string | null
  wallet: string | null
}

export interface CardDetails {
  cardId: string
  number: string
  exp_month: number
  exp_year: number
  name: string
  brand: string
}

export interface GoogleLinkRequest {
  uid: string,
  email: string,
  displayName: string
  phoneNumber: string
}
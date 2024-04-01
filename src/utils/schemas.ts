import Joi from "joi"

export const SignUpSchema = Joi.object({
  username: Joi.string().alphanum().min(4).max(50).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().alphanum().min(8).max(8).required(),
})

export const LoginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().alphanum().min(8).max(8).required(),
})

export const ForgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
})

export const ResetPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().alphanum().min(8).max(8).required(),
  otp: Joi.string().min(4).required(),
})

export const SaveProfileSchema = Joi.object({
  username: Joi.string().alphanum().min(4).max(50).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  mobile: Joi.string()
    .min(10)
    .pattern(/^[0-9]+$/)
    .required(),
  address: Joi.string().required(),
  province: Joi.string().required(),
  city: Joi.string().required(),
  postalcode: Joi.string().max(10).required(),
  country: Joi.string().required(),
})

export const AddProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().max(500).required(),
  price: Joi.string()
    .pattern(/^[0-9]+$/)
    .required(),
  category: Joi.string().required(),
  bidenddate: Joi.string().required(), //number of milliseconds
  file: Joi.any().optional(),
})

export const PlaceBidSchema = Joi.object({
  productid: Joi.string().required(),
  bidprice: Joi.number()
    .required(),
})
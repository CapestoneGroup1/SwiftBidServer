import STRIPE from "stripe"
import { AddNewCreditCard } from "../types"

const stripe = new STRIPE(process.env.STRIPE_KEY || "")

export const createCustomer = async (email: string): Promise<STRIPE.Customer> => {
  const customer = await stripe.customers.create(
    {
      email,
    },
    {
      stripeAccount: process.env.STRIPE_ACCOUNT_ID,
      apiKey: process.env.STRIPE_KEY,
    },
  )
  return customer
}

export const addNewCardForCustomer = async (
  newCardDetails: AddNewCreditCard,
  stripeCustomerId: string,
): Promise<STRIPE.Card> => {
  //PRODUCTION PURPOSE...
  //   const cardToken: STRIPE.Token = await stripe.tokens.create(
  //     {
  //       card: {
  //         ...newCardDetails,
  //         currency: "CAD",
  //       },
  //     },
  //     {
  //       stripeAccount: process.env.STRIPE_ACCOUNT_ID,
  //       apiKey: process.env.STRIPE_KEY,
  //     },
  //   )

  //   if (!cardToken) {
  //     throw new BadRequest("Falied to save Card, Provide Valid Details")
  //   }

  const card = await stripe.customers.createSource(
    stripeCustomerId,
    {
      source: newCardDetails.testCardToken || `tok_visa_debit`,
    },
    {
      stripeAccount: process.env.STRIPE_ACCOUNT_ID,
      apiKey: process.env.STRIPE_KEY,
    },
  )

  return card as STRIPE.Card
}

export const getCustomerSavedCards = async (
  stripeCustomerId: string,
): Promise<STRIPE.Card[]> => {
  const savedCards = await stripe.customers.listSources(
    stripeCustomerId,
    {
      object: "card",
    },
    {
      stripeAccount: process.env.STRIPE_ACCOUNT_ID,
      apiKey: process.env.STRIPE_KEY,
    },
  )
  const cardDetails = Object.values(savedCards.data)
  return (cardDetails || []) as STRIPE.Card[]
}

export const deleteCustomerCard = async (
  stripeCustomerId: string,
  cardId: string,
): Promise<STRIPE.CustomerSource | STRIPE.DeletedCustomerSource> => {
  const deleteCard = await stripe.customers.deleteSource(stripeCustomerId, cardId, {
    stripeAccount: process.env.STRIPE_ACCOUNT_ID,
    apiKey: process.env.STRIPE_KEY,
  })
  return deleteCard
}

export const chargeUserCard = async (
  stripeCustomerId: string,
  cardId: string,
  amount: number,
  email: string,
): Promise<STRIPE.Charge> => {
  const createCharge = await stripe.charges.create(
    {
      amount: amount,
      currency: "CAD",
      customer: stripeCustomerId,
      description: "Swift Bid , charge for Product Purcase",
      source: cardId,
      receipt_email: email,
    },
    {
      stripeAccount: process.env.STRIPE_ACCOUNT_ID,
      apiKey: process.env.STRIPE_KEY,
    },
  )
  return createCharge
}
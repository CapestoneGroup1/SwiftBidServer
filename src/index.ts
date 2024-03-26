import express, { NextFunction, Request, Response } from "express"
import bodyParser from "body-parser"
import cors from "cors"
import { EmailConfig } from "./config/EmailConfig"
import MongoClient from "./config/MongoConfig"
import dotenv from "dotenv"
import { userAuthRoutes } from "./routehandlers/userAuthRoutes"
import { BadRequest, ForbiddenError, NotFound, UnAuthenticatedError } from "./utils/exceptions"
import { userRoutes } from "./routehandlers/userRoutes"
import { productRoutes } from "./routehandlers/productRoutes"
import { categoryRoutes } from "./routehandlers/categoryRoutes"
import "./config/firebase"
import { FirebaseService } from "./services/FirebaseService"
import { bidRoutes } from "./routehandlers/bidRoutes"
import { adminRoutes } from "./routehandlers/adminRoutes"
import { addNewCardForCustomer, chargeUserCard, createCustomer, deleteCustomerCard, getCustomerSavedCards } from "./services/StripeService"
import { AddNewCreditCard } from "./types"

const app = express()
const port = process.env.PORT || 3000

dotenv.config()

app.use(express.static("public"))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.get("/health", (req: Request, res: Response) => {
  res.send("Server is Up and Running")
})

app.use("/auth", userAuthRoutes)
app.use("/user", userRoutes)
app.use("/product", productRoutes)
app.use("/category", categoryRoutes)
app.use("/bids", bidRoutes)
app.use("/admin", adminRoutes)

app.get("/test/stripe/customer", async (req, res, next) => {
  const customer = await createCustomer("teststripe1@gmail.com")
  res.json(customer)
})


app.get("/test/stripe/customer/cards/", async (req, res, next) => {
  const savedCards = await getCustomerSavedCards("cus_PnUqsxD2Hk6eIX")
  res.json(savedCards)
})


app.get("/test/stripe/customer/charge/", async (req, res, next) => {
  const charge = await chargeUserCard("cus_PnUqsxD2Hk6eIX", "card_1OxuxaLjhQBMegblj3MkYEmO", 100, "teststripe1@gmail.com")
  res.json(charge)
})

app.delete("/test/stripe/customer/cards/", async (req, res, next) => {
  const deleted = await deleteCustomerCard("cus_PnUqsxD2Hk6eIX", "card_1OxuYlLjhQBMegblPUg2oXgz")
  res.json(deleted)
})

app.post("/test/stripe/savecard/:id", async (req, res, next) => {
  const { body } = req
  const { id } = req.params
  const { name, address_country, address_zip, cvc, exp_month, exp_year, number } =
    body as AddNewCreditCard
  const card = await addNewCardForCustomer(
    { name, address_country, address_zip, cvc, exp_month, exp_year, number },
    id,
  )
  res.json(card)
})

/**
 * Global Error Handler for complete app.
 * If any of the routes failed to handle error the control will be trnasfered to this middleware.
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (
    err instanceof BadRequest ||
    err instanceof NotFound ||
    err instanceof ForbiddenError ||
    err instanceof UnAuthenticatedError
  ) {
    console.log(err)
    res.status(err.statusCode).json({ error: err.message })
  } else {
    console.log(err)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

// Initializations..
FirebaseService.initialize()
EmailConfig.initialize()
MongoClient.initialize()
  .then(() => {
    app.listen(port, () => console.log("App is listening on port " + port))
  })
  .catch((error) => {
    console.error("Faile to start Server", error)
  })
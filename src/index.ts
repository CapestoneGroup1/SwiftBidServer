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

const app = express()
const port = process.env.PORT || 3000

dotenv.config()

app.use(express.static("public"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.get("/healthCheck", (req: Request, res: Response) => {
  res.send("Server is Up and Running")
})

app.use("/auth", userAuthRoutes)
app.use("/user", userRoutes)
app.use("/product", productRoutes)
app.use("/category", categoryRoutes)

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
    res.status(err.statusCode).json({ error: err.message })
  } else {
    res.status(500).json({ error: "Internal Server Error" })
  }
})

// Initializations..
FirebaseService.initialize()
EmailConfig.initialize()
MongoClient.initialize()
  .then(() => {
    app.listen(3000, () => console.log("App is listening on port " + port))
  })
  .catch((error) => {
    console.error("Faile to start Server", error)
  })

import { Router } from "express";
import { authController } from "./auth.module";
import { authenticateJWT } from "../../common/strategies/jwt.strategy";

const authRouter = Router()

authRouter.post("/register", authController.register)
authRouter.post("/login", authController.login)
authRouter.post("/verify/email", authController.verifyEmail)

authRouter.post("/password/change", authenticateJWT, authController.changePassword)
authRouter.post("/password/forgot", authController.forgotPassword)
authRouter.post("/password/reset", authController.resetPassword)

authRouter.get("/refresh", authController.refreshToken)
authRouter.post("/logout", authenticateJWT, authController.logout)

export default authRouter
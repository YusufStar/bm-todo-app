import { Router } from "express";
import { userController } from "./user.module";

const userRoutes = Router()

userRoutes.put("/update", userController.updateUser)

export default userRoutes
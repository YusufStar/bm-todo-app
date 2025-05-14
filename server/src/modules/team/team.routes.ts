import { Router } from "express";
import { teamController } from "./team.module";

const teamRoutes = Router()

teamRoutes.post("/create", teamController.createTeam)

export default teamRoutes
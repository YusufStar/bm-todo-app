import { Router } from "express";
import { teamController } from "./team.module";

const teamRoutes = Router()

teamRoutes.get("/", teamController.getAllTeams)
teamRoutes.post("/create", teamController.createTeam)
teamRoutes.post("/invite", teamController.inviteMember)

export default teamRoutes
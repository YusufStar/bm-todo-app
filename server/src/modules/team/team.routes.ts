import { Router } from "express";
import { teamController } from "./team.module";

const teamRoutes = Router()

teamRoutes.get("/", teamController.getAllTeams)
teamRoutes.post("/create", teamController.createTeam)
teamRoutes.put("/:teamId", teamController.updateTeam)
teamRoutes.delete("/:teamId", teamController.deleteTeam)

teamRoutes.post("/invite", teamController.inviteMember)
teamRoutes.post("/invite/accept", teamController.acceptInvite)
teamRoutes.post("/invite/reject", teamController.rejectInvite)

export default teamRoutes
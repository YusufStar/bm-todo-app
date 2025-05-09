import { Router } from "express";
import { sessionController } from "./session.module";

const sessionRoutes = Router()

sessionRoutes.get("/", sessionController.getSession);
sessionRoutes.get("/all", sessionController.getAllSessions);

sessionRoutes.delete("/:id", sessionController.deleteSession);

export default sessionRoutes
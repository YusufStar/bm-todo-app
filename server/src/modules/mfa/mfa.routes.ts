import { Router } from "express";
import { authenticateJWT } from "../../common/strategies/jwt.strategy";
import { mfaController } from "./mf.module";

const mfaRoutes = Router();

mfaRoutes.get("/setup", authenticateJWT, mfaController.generateMfaSetup);

export default mfaRoutes;
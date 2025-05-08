import { Router } from "express";
import { authenticateJWT } from "../../common/strategies/jwt.strategy";
import { mfaController } from "./mf.module";

const mfaRoutes = Router();

mfaRoutes.get("/setup", authenticateJWT, mfaController.generateMfaSetup);
mfaRoutes.post("/verify", authenticateJWT, mfaController.verifyMfaToken);
mfaRoutes.put("/revoke", authenticateJWT, mfaController.revokeMfa);
mfaRoutes.post("/verify-login", mfaController.verifyMfaForLogin);

export default mfaRoutes;
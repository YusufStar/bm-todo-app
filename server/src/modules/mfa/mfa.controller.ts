import { setAuthenticationCookies } from "../../common/utils/cookie";
import { verifyMfaForLoginSchema, verifyMfaSchema } from "../../common/validators/mfa.validator";
import { HTTPSTATUS } from "../../config/http.config";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { MfaService } from "./mfa.service";

export class MfaController {
    private mfaService: MfaService;

    constructor(mfaService: MfaService) {
        this.mfaService = mfaService;
    }

    public generateMfaSetup = asyncHandler(
        async (req, res) => {
            const { secret, qrImageUrl, message } = await this.mfaService.generateMfaSetup(req);

            return res.status(HTTPSTATUS.OK).json({
                message,
                secret,
                qrImageUrl
            })
        }
    )

    public verifyMfaToken = asyncHandler(
        async (req, res) => {
            const { code, secretKey } = verifyMfaSchema.parse({
                ...req.body
            })

            const { message, userPreferences } = await this.mfaService.verifyMfaToken(req, code, secretKey);

            return res.status(HTTPSTATUS.OK).json({
                message,
                userPreferences
            })
        }
    )

    public revokeMfa = asyncHandler(
        async (req, res) => {
            const { message, userPreferences } = await this.mfaService.revokeMfa(req);

            return res.status(HTTPSTATUS.OK).json({
                message,
                userPreferences
            })
        }
    )

    public verifyMfaForLogin = asyncHandler(
        async (req, res) => {
            const { code, email, userAgent } = verifyMfaForLoginSchema.parse({
                ...req.body,
                userAgent: req.headers["user-agent"]
            })

            const { accessToken, refreshToken, user } = await this.mfaService.verifyMfaForLogin(code, email, userAgent);

            await setAuthenticationCookies({
                res,
                accessToken,
                refreshToken
            }).status(HTTPSTATUS.OK).json({
                message: "Verified & logged in successfully",
                user,
            })
        }
    )
}
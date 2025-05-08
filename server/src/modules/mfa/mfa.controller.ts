import { verifyMfaSchema } from "../../common/validators/mfa.validator";
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
}
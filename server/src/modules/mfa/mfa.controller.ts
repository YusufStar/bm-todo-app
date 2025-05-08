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
            const {secret, qrImageUrl, message} = await this.mfaService.generateMfaSetup(req);

            return res.status(HTTPSTATUS.OK).json({
                message,
                secret,
                qrImageUrl
            })
        }
    )
}
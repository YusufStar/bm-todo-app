import { registerSchema } from "../../common/validators/auth.validator";
import { HTTPSTATUS } from "../../config/http.config";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { AuthService } from "./auth.service";

export class AuthController {
    private authService: AuthService

    constructor(authService: AuthService) {
        this.authService = authService
    }

    public register = asyncHandler(
        async (req, res): Promise<any> => {
            const userAgent = req.headers["user-agent"]
            const body = registerSchema.parse({
                ...req.body,
                userAgent
            });
            const { user } = await this.authService.register(body)

            return res.status(HTTPSTATUS.CREATED).json({
                message: "User registered successfully",
                data: user
            })
        }   
    )
}
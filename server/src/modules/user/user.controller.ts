import { userUpdateSchema } from "../../common/validators/user.validator";
import { HTTPSTATUS } from "../../config/http.config";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { UserService } from "./user.service";

export class UserController {
    private userService: UserService

    constructor(userService: UserService) {
        this.userService = userService
    }

    public updateUser = asyncHandler(
        async (req, res) => {
            const body = userUpdateSchema.parse(req.body);
            const userId = req.user?.id;

            await this.userService.updateUser(userId, body);

            return res.status(HTTPSTATUS.OK).json({
                message: "User updated successfully",
            })
        }
    )
}
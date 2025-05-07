import { logger } from "../../common/utils/logger";
import { HTTPSTATUS } from "../../config/http.config";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { SessionService } from "./session.service";

export class SessionController {
    private sessionService: SessionService;

    constructor(sessionService: SessionService) {
        this.sessionService = sessionService;
    }

    public getAllSessions = asyncHandler(async (req, res) => {
        const userId = req.user?.id;
        const sessionId = req.sessionId;

        const { sessions } = await this.sessionService.getAllSessions(userId);

        const modifySessions = sessions.map((session) => ({
            ...session.toObject(),
            ...(session.id === sessionId && {
                isCurrent: true,
            })
        }))

        return res.status(HTTPSTATUS.OK).json({
            sessions: modifySessions,
            message: "Retrieved all sessions successfully",
        });
    });
}

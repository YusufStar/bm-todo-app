import { z } from "zod";
import { NotFoundException } from "../../common/utils/catch-errors";
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
            }),
        }));

        return res.status(HTTPSTATUS.OK).json({
            sessions: modifySessions,
            message: "Retrieved all sessions successfully",
        });
    });

    public getSession = asyncHandler(async (req, res) => {
        const sessionId = req.sessionId;

        if (!sessionId) {
            throw new NotFoundException("Session ID not found. Please log in again.");
        }

        const { user } = await this.sessionService.getSessionById(sessionId);

        return res.status(HTTPSTATUS.OK).json({
            user,
            message: "Retrieved session successfully",
        });
    });

    public deleteSession = asyncHandler(
        async (req, res) => {
            const sessionId = z.string().parse(req.params.id);
            const userId = req.user?.id;

            await this.sessionService.deleteSession(sessionId, userId);

            return res.status(HTTPSTATUS.OK).json({
                message: "Session deleted successfully",
            });
        }
    )
}

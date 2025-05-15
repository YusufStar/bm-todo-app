import { TeamInviteSchema, TeamSchema } from "../../common/validators/team.validator";
import { HTTPSTATUS } from "../../config/http.config";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { TeamService } from "./team.service";

export class TeamController {
    private teamService: TeamService;

    constructor(teamService: TeamService) {
        this.teamService = teamService;
    }

    public createTeam = asyncHandler(
        async (req, res) => {
            const userId = req.user?.id;
            const body = TeamSchema.parse(req.body);

            await this.teamService.createTeam(body, userId);

            res.status(HTTPSTATUS.OK).json({
                message: "Team created successfully",
            });
        }
    )

    public inviteMember = asyncHandler(
        async (req, res) => {
            const userId = req.user?.id;
            const body = TeamInviteSchema.parse(req.body);

            await this.teamService.inviteMember(body, userId);

            res.status(HTTPSTATUS.OK).json({
                message: "Member invited successfully",
            });
        }
    )

    public getAllTeams = asyncHandler(
        async (req, res) => {
            const userId = req.user?.id;

            const teams = await this.teamService.getAllTeams(userId);

            res.status(HTTPSTATUS.OK).json({
                message: "Teams fetched successfully",
                teams: teams,
            });
        }
    )
}
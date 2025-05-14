import { TeamSchema } from "../../common/validators/team.validator";
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
            const body = TeamSchema.parse(req.body);

            await this.teamService.createTeam(body);

            res.status(HTTPSTATUS.OK).json({
                message: "Team created successfully",
            });
        }
    )
}
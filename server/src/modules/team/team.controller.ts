import { z } from "zod";
import { clearTeamCookie, getTeamIdFromCookie, setTeamCookie } from "../../common/utils/cookie";
import { TeamInviteActionSchema, TeamInviteSchema, TeamSchema, TeamUpdateSchema } from "../../common/validators/team.validator";
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

            const teamData = await this.teamService.createTeam(body, userId);

            return setTeamCookie({
                res,
                currentTeamId: teamData._id,
            }).status(HTTPSTATUS.OK).json({
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

    public updateTeam = asyncHandler(
        async (req, res) => {
            const userId = req.user?.id;
            const teamId = req.params.teamId;

            const body = TeamUpdateSchema.parse(req.body);

            await this.teamService.updateTeam(body, teamId, userId);

            res.status(HTTPSTATUS.OK).json({
                message: "Team updated successfully",
            });
        }
    )

    public deleteTeam = asyncHandler(
        async (req, res) => {
            const userId = req.user?.id;
            const teamId = req.params.teamId;

            await this.teamService.deleteTeam(teamId, userId);

            res.status(HTTPSTATUS.OK).json({
                message: "Team deleted successfully",
            });
        }
    )

    public acceptInvite = asyncHandler(
        async (req, res) => {
            const userId = req.user?.id;
            const { inviteId } = TeamInviteActionSchema.parse(req.body);

            const teamId = await this.teamService.acceptInvite(inviteId, userId);

            return setTeamCookie({
                res,
                currentTeamId: teamId,
            }).status(HTTPSTATUS.OK).json({
                message: "Invite accepted successfully",
            });
        }
    )

    public rejectInvite = asyncHandler(
        async (req, res) => {
            const userId = req.user?.id;
            const { inviteId } = TeamInviteActionSchema.parse(req.body);

            await this.teamService.rejectInvite(inviteId, userId);

            res.status(HTTPSTATUS.OK).json({
                message: "Invite rejected successfully",
            });
        }
    )

    public selectTeam = asyncHandler(
        async (req, res) => {
            const userId = req.user?.id;
            const { teamId } = z.object({
                teamId: z.string(),
            }).parse(req.body);
            
            if (!teamId) {
                return res.status(HTTPSTATUS.BAD_REQUEST).json({
                    message: "Team ID is required",
                });
            }

            const team = await this.teamService.selectTeam(teamId, userId);

            return setTeamCookie({
                res,
                currentTeamId: team._id,
            }).status(HTTPSTATUS.OK).json({
                message: "Team selected successfully",
            });
        }
    )

    public getCurrentTeam = asyncHandler(
        async (req, res) => {
            const userId = req.user?.id;
            const teamId = getTeamIdFromCookie(req);

            if (!teamId) {
                const teams = await this.teamService.getAllTeams(userId);
                if (teams.length === 0) {
                    return clearTeamCookie(res).status(HTTPSTATUS.BAD_REQUEST).json({
                        message: "No teams found",
                    });
                }

                return setTeamCookie({
                    res,
                    currentTeamId: teams[0]._id,
                }).status(HTTPSTATUS.OK).json({
                    message: "No team selected, defaulting to first team",
                    team: teams[0],
                });
            }

            const team = await this.teamService.getCurrentTeam(userId, teamId);

            if (!team) {
                return clearTeamCookie(res).status(HTTPSTATUS.BAD_REQUEST).json({
                    message: "No team found",
                });
            }

            res.status(HTTPSTATUS.OK).json({
                message: "Current team fetched successfully",
                team: team,
            });
        }
    )
}
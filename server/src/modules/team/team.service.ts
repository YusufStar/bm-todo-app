import { z } from "zod";
import { TeamInviteSchema, TeamSchema } from "../../common/validators/team.validator";
import TeamModel from "../../database/models/team.model";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../../common/utils/catch-errors";
import { TeamMemberRole, TeamPlans } from "../../common/enums/team.enum";
import UserModel from "../../database/models/user.model";
import { sendEmail } from "../../mailers/mailer";

export class TeamService {
    public async createTeam(teamData: z.infer<typeof TeamSchema>, userId: string): Promise<void> {
        if (!userId) {
            throw new UnauthorizedException("Authentication required");
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const existingTeam = await TeamModel.findOne({ name: teamData.name });
        if (existingTeam) {
            throw new BadRequestException("Team with this name already exists");
        }

        const newTeam = new TeamModel({
            ...teamData,
            members: [
                {
                    user: user._id,
                    role: TeamMemberRole.OWNER,
                },
            ],
            createdBy: user._id,
            plan: TeamPlans.FREE,
        });

        await newTeam.save();
    }

    public async inviteMember(inviteData: z.infer<typeof TeamInviteSchema>, userId: string): Promise<void> {
        if (!userId) {
            throw new UnauthorizedException("Authentication required");
        }
        
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const team = await TeamModel.findById(inviteData.teamId);
        if (!team) {
            throw new NotFoundException("Team not found");
        }

        const hasMyRole = team.members.some(member => member.user._id === userId && (member.role === TeamMemberRole.OWNER || member.role === TeamMemberRole.ADMIN));

        if (!hasMyRole) {
            throw new BadRequestException("You do not have permission to invite members to this team");
        }

        const existingInvite = await TeamModel.findOne({
            team: inviteData.teamId,
            invitedTo: inviteData.email,
        });
        if (existingInvite) {
            throw new BadRequestException("Invite already exists");
        }

        const invitedToUser = await UserModel.findOne({ email: inviteData.email });
        if (!invitedToUser) {
            throw new NotFoundException("User to be invited not found");
        }

        const invitedToUserTeams = await TeamModel.find({ members: { $elemMatch: { user: invitedToUser._id } } });
        
        if (invitedToUserTeams.some(team => team._id.toString() === inviteData.teamId)) {
            throw new BadRequestException("User is already a member of this team");
        }

        const newInvite = new TeamModel({
            invitedBy: user._id,
            invitedTo: invitedToUser._id,
            team: team._id,
            role: inviteData.role,
            status: inviteData.status,
            expiresAt: inviteData.expiresAt,
        });

        await newInvite.save();

        await sendEmail({
            to: invitedToUser.email,
            subject: "Team Invitation",
            text: `You have been invited to join the team ${team.name} as a ${inviteData.role}. Please accept or reject the invitation.`,
            html: `<p>You have been invited to join the team <strong>${team.name}</strong> as a <strong>${inviteData.role}</strong>. Please accept or reject the invitation.</p>`,
        });
    }

    public async getAllTeams(userId: string): Promise<any[]> {
        if (!userId) {
            throw new UnauthorizedException("Authentication required");
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const teams = await TeamModel.find({ members: { $elemMatch: { user: user._id } } })
            .populate("members.user")
            .populate("createdBy");

        return teams;
    }
}
import { z } from "zod";
import { TeamInviteSchema, TeamSchema, TeamUpdateSchema } from "../../common/validators/team.validator";
import TeamModel, { TeamDocument } from "../../database/models/team.model";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../../common/utils/catch-errors";
import { TeamInviteStatus, TeamMemberRole, TeamPlans } from "../../common/enums/team.enum";
import UserModel from "../../database/models/user.model";
import { sendEmail } from "../../mailers/mailer";
import TeamInviteModel from "../../database/models/team-invite.model";

export class TeamService {
    public async createTeam(teamData: z.infer<typeof TeamSchema>, userId: string): Promise<TeamDocument> {
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

        const newTeam = await TeamModel.create({
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

        return newTeam;
    }

    public async updateTeam(teamData: z.infer<typeof TeamUpdateSchema>, teamId: string, userId: string): Promise<void> {
        if (!userId) {
            throw new UnauthorizedException("Authentication required");
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const team = await TeamModel.findById(teamId);
        if (!team) {
            throw new NotFoundException("Team not found");
        }

        const hasMyRole = team.members.some(member => member.user._id === userId && (member.role === TeamMemberRole.OWNER || member.role === TeamMemberRole.ADMIN));

        if (!hasMyRole) {
            throw new BadRequestException("You do not have permission to update this team");
        }

        await TeamModel.findByIdAndUpdate(teamId, teamData);
    }

    public async deleteTeam(teamId: string, userId: string): Promise<void> {
        if (!userId) {
            throw new UnauthorizedException("Authentication required");
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const team = await TeamModel.findById(teamId);
        if (!team) {
            throw new NotFoundException("Team not found");
        }

        const hasMyRole = team.members.some(member => member.user._id === userId && (member.role === TeamMemberRole.OWNER || member.role === TeamMemberRole.ADMIN));

        if (!hasMyRole) {
            throw new BadRequestException("You do not have permission to delete this team");
        }

        await TeamModel.findByIdAndDelete(teamId);
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

    public async getAllTeams(userId: string): Promise<TeamDocument[]> {
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

    public async acceptInvite(inviteId: string, userId: string): Promise<string> {
        if (!userId) {
            throw new UnauthorizedException("Authentication required");
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const invite = await TeamInviteModel.findById(inviteId);
        if (!invite) {
            throw new NotFoundException("Invite not found");
        }

        if (invite.status !== TeamInviteStatus.PENDING) {
            throw new BadRequestException("Invite is not pending");
        }

        invite.status = TeamInviteStatus.ACCEPTED;
        await invite.save();

        const team = await TeamModel.findById(invite.team);

        if (!team) {
            throw new NotFoundException("Team not found");
        }

        const adminUserId = invite.invitedBy._id;

        const hasAdminUserROle = team.members.some(member => member.user._id === adminUserId && (member.role === TeamMemberRole.OWNER || member.role === TeamMemberRole.ADMIN));
        if (!hasAdminUserROle) {
            throw new BadRequestException("You do not have permission to accept this invite");
        }
        const hasUserRole = team.members.some(member => member.user._id === userId);
        if (hasUserRole) {
            throw new BadRequestException("You are already a member of this team");
        }

        await TeamModel.findByIdAndUpdate(team._id, {
            $push: {
                members: {
                    user: user._id,
                    role: invite.role,
                },
            },
        },);
        await TeamInviteModel.findByIdAndDelete(inviteId);

        await sendEmail({
            to: user.email,
            subject: "Team Invitation Accepted",
            text: `You have accepted the invitation to join the team ${team.name} as a ${invite.role}.`,
            html: `<p>You have accepted the invitation to join the team <strong>${team.name}</strong> as a <strong>${invite.role}</strong>.</p>`,
        });

        return team._id;
    }

    public async rejectInvite(inviteId: string, userId: string): Promise<void> {
        if (!userId) {
            throw new UnauthorizedException("Authentication required");
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const invite = await TeamInviteModel.findById(inviteId);
        if (!invite) {
            throw new NotFoundException("Invite not found");
        }

        if (invite.status !== TeamInviteStatus.PENDING) {
            throw new BadRequestException("Invite is not pending");
        }

        invite.status = TeamInviteStatus.REJECTED;
        await invite.save();

        await sendEmail({
            to: user.email,
            subject: "Team Invitation Rejected",
            text: `You have rejected the invitation to join the team ${invite.team.name} as a ${invite.role}.`,
            html: `<p>You have rejected the invitation to join the team <strong>${invite.team.name}</strong> as a <strong>${invite.role}</strong>.</p>`,
        });
    }

    public async selectTeam(teamId: string, userId: string): Promise<TeamDocument> {
        if (!userId) {
            throw new UnauthorizedException("Authentication required");
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const team = await TeamModel.findById(teamId);
        if (!team) {
            throw new NotFoundException("Team not found");
        }

        const isMyMember = team.members.some(member => {
            return member.user._id?.toString() === userId;
        });

        if (!isMyMember) {
            throw new BadRequestException("You are not a member of this team");
        }

        return team;
    }

    public async getCurrentTeam(userId: string, teamId: string): Promise<TeamDocument | null> {
        if (!userId) {
            throw new UnauthorizedException("Authentication required");
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const team = await TeamModel.findOne({ members: { $elemMatch: { user: user._id } }, _id: teamId })
            .populate("members.user")
            .populate("createdBy");

        if (!team) {
            return null
        }

        return team;
    }
}
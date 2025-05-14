import mongoose from "mongoose";
import { Schema } from "mongoose";
import { TeamInviteStatus, TeamMemberRole } from "../../common/enums/team.enum";
import { UserDocument } from "./user.model";
import { TeamDocument } from "./team.model";

export interface TeamInviteDocument extends Document {
    invitedBy: UserDocument;
    invitedTo: UserDocument;
    role: TeamMemberRole;
    team: TeamDocument
    status: TeamInviteStatus;

    expiresAt: Date;
    createdAt: Date;
}

const teamSchema = new Schema<TeamInviteDocument>({
    invitedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    invitedTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: "Team",
        required: true,
    },
    status: {
        type: String,
        default: TeamInviteStatus.PENDING,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    role: {
        type: String,
        enum: Object.values(TeamMemberRole),
        default: TeamMemberRole.MEMBER,
    },
}, { timestamps: true });

const TeamInviteModel = mongoose.model<TeamInviteDocument>(
    "TeamInvite",
    teamSchema,
);

export default TeamInviteModel;
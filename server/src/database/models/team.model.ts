import mongoose from "mongoose";
import { Schema } from "mongoose";
import { TeamMemberRole, TeamStatus, TeamPlans } from "../../common/enums/team.enum";
import { UserDocument } from "./user.model";

interface TeamMember {
    role: TeamMemberRole;
    user: UserDocument;
}

export interface TeamDocument extends Document {
    _id: string;
    name: string
    logo: string
    plan: TeamPlans
    status: TeamStatus;

    members: TeamMember[];
    createdBy: UserDocument;

    createdAt: Date;
}

const teamSchema = new Schema<TeamDocument>({
    name: {
        type: String,
        required: true,
    },
    logo: {
        type: String,
        required: true,
    },
    plan: {
        type: String,
        enum: Object.values(TeamPlans),
        default: TeamPlans.FREE,
    },
    status: {
        type: String,
        enum: Object.values(TeamStatus),
        default: TeamStatus.ACTIVE,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    members: [
        {
            role: {
                type: String,
                enum: Object.values(TeamMemberRole),
                default: TeamMemberRole.MEMBER,
            },
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        },
    ],
}, { timestamps: true });

const TeamModel = mongoose.model<TeamDocument>(
    "Team",
    teamSchema,
);

export default TeamModel;
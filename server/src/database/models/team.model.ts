import mongoose from "mongoose";
import { Schema } from "mongoose";
import { TeamStatus } from "../../common/enums/team-status.enum";
import { UserDocument } from "./user.model";

export interface TeamDocument extends Document {
    name: string
    logo: string
    plan: TeamPlans
    status: TeamStatus;

    members: UserDocument[];
    owner: UserDocument;

    expiresAt: Date;
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
        default: TeamPlans.FREE,
    },
    status: {
        type: String,
        default: TeamStatus.ACTIVE,
    },
    members: {
        type: [Schema.Types.ObjectId],
        ref: "User",
        index: true,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
        required: true,
    },
    expiresAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

const VerificationCodeModel = mongoose.model<TeamDocument>(
    "Team",
    teamSchema,
);

export default VerificationCodeModel;
import mongoose, { Document, Schema } from "mongoose";
import { compareValue, hashValue } from "../../common/utils/bcrypt";

interface UserPreferences {
    enable2FA: boolean;
    emailNotification: boolean;
    twoFactorSecret?: string;
}

export interface UserDocument extends Document {
    avatar?: string;
    name: string;
    email: string;
    password: string;
    department?: string;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    userPreferences: UserPreferences;
    comparePassword(value: string): Promise<boolean>;
}
const userPreferencesSchema = new Schema<UserPreferences>({
    enable2FA: { type: Boolean, default: false },
    emailNotification: { type: Boolean, default: true },
    twoFactorSecret: { type: String, required: false },
});

const userSchema = new Schema<UserDocument>(
    {
        avatar: {
            type: String,
            default: "",
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        department: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            required: false,
        },
        userPreferences: {
            type: userPreferencesSchema,
            default: {},
        },
    },
    {
        timestamps: true,
        toJSON: {},
    }
);

function autoPopulate(this: mongoose.Query<any, UserDocument>, next: mongoose.CallbackWithoutResultAndOptionalError) {
    this.populate("department");
    next();
}

userSchema
    .pre("findOne", autoPopulate)
    .pre("find", autoPopulate)
    .pre("findOneAndDelete", autoPopulate)
    .pre("findOneAndReplace", autoPopulate)
    .pre("findOneAndUpdate", autoPopulate)

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await hashValue(this.password);
    }
    next();
});

userSchema.methods.comparePassword = async function (value: string) {
    return compareValue(value, this.password);
};

userSchema.set("toJSON", {
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.userPreferences.twoFactorSecret;
        return ret;
    },
});

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
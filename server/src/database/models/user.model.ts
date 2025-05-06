import { model, Schema } from "mongoose"

interface UserPreferences {
    enable2FA: boolean
    emailNotification: boolean
    twoFactorSecret?: string
}

export interface UserDocument extends Document {
    name: string
    email: string
    password: string
    isEmailVerified: boolean
    createdAt: Date
    updatedAt: Date
    userPreferences: UserPreferences
    comparePassword: (candidatePassword: string) => Promise<boolean>
}

const userPreferences = new Schema<UserPreferences>({
    enable2FA: { type: Boolean, default: false },
    emailNotification: { type: Boolean, default: true },
    twoFactorSecret: { type: String, default: false },
})

const userSchema = new Schema<UserDocument>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    userPreferences: { type: userPreferences, default: {} },
}, { timestamps: true, toJSON: {} })

userSchema.set("toJSON", {
    transform: function (doc, ret) {
        delete ret.password
        delete ret.userPreferences.twoFactorSecret
        return ret
    }
})

const UserModel = model<UserDocument>("User", userSchema)
export default UserModel
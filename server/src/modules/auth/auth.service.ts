import { ErrorCode } from "../../common/enums/error-code.enum";
import { VerificationEnum } from "../../common/enums/verification-code.enum";
import { LoginDto, RegisterDto, ResetPasswordDto } from "../../common/interface/auth.interface";
import { calculateExpirationDate, fortyFiveMinutesFromNow, ONE_DAY_IN_MS, tenMinutesAgo } from "../../common/utils/date-time";
import { BadRequestException, HttpException, InternalServerException, NotFoundException, UnauthorizedException } from "../../common/utils/catch-errors";
import UserModel from "../../database/models/user.model";
import VerificationCodeModel from "../../database/models/verification.model";
import SessionModel from "../../database/models/session.model";
import { refreshTokenSignOptions, RefreshTPayload, signJwtToken, verifyJwtToken } from "../../common/utils/jwt";
import { config } from "../../config/app.config";
import { sendEmail } from "../../mailers/mailer";
import { passwordResetTemplate, verifyEmailTemplate } from "../../mailers/templates/template";
import { HTTPSTATUS } from "../../config/http.config";
import { logger } from "../../common/utils/logger";
import { resetPasswordSchema } from "../../common/validators/auth.validator";
import { hashValue } from "../../common/utils/bcrypt";

export class AuthService {
    public async register(registerData: RegisterDto) {
        const { name, email, password } = registerData;

        const existingUser = await UserModel.exists({
            email,
        });

        if (existingUser) {
            throw new BadRequestException(
                "User already exists with this email",
                ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
            );
        }
        const newUser = await UserModel.create({
            name,
            email,
            password,
        });

        const userId = newUser._id;

        const verification = await VerificationCodeModel.create({
            userId,
            type: VerificationEnum.EMAIL_VERIFICATION,
            expiresAt: fortyFiveMinutesFromNow(),
        });
        
        const verificationUrl = `${config.APP_ORIGIN}/confirm-account?code=${verification.code}`;
        await sendEmail({
            to: newUser.email,
            ...verifyEmailTemplate(verificationUrl),
        })

        logger.info(`Verification email sent to ${newUser.email}`)

        return {
            user: newUser,
        };
    }
    
    public async login(loginData: LoginDto) {
        const { email, password, userAgent } = loginData;

        const user = await UserModel.findOne({ email });

        if (!user) {
            throw new BadRequestException(
                "Invalid email or password provided",
                ErrorCode.AUTH_USER_NOT_FOUND
            );
        }
        
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new BadRequestException(
                "Invalid email or password provided",
                ErrorCode.AUTH_USER_NOT_FOUND
            );
        }
        
        const session = await SessionModel.create({
            userId: user._id,
            agent: userAgent,
        });

        const accessToken = signJwtToken({
            userId: user._id,
            sessionId: session._id,
        })

        const refreshToken = signJwtToken(
            {
                sessionId: session._id,
            },
            refreshTokenSignOptions
        );

        return {
            user,
            accessToken,
            refreshToken,
            mfaRequired: false,
        }
    }

    public async refreshToken(refreshToken: string) {
        const { payload } = verifyJwtToken<RefreshTPayload>(refreshToken, {
            secret: refreshTokenSignOptions.secret,
        })

        if (!payload) {
            throw new UnauthorizedException("Invalid refresh token")
        }

        const session = await SessionModel.findById(payload.sessionId)
        const now = Date.now()

        if (!session) {
            throw new UnauthorizedException("Session does not exist")
        }

        if (session.expiredAt.getTime() <= now) {
            throw new UnauthorizedException("Session expired")
        }
        
        const sessionRequiredRefresh = session.expiredAt.getTime() - now <= ONE_DAY_IN_MS

        if (sessionRequiredRefresh) {
            session.expiredAt = calculateExpirationDate(
                config.JWT.REFRESH_EXPIRES_IN
            )
            await session.save()
        }

        const newRefreshToken = sessionRequiredRefresh ? signJwtToken({
            sessionId: session._id,
        }, refreshTokenSignOptions) : undefined

        const accessToken = signJwtToken({
            userId: session.userId,
            sessionId: session._id,
        })

        return {
            accessToken,
            newRefreshToken,
        }
    }

    public async verifyEmail(code: string) {
        const validCode = await VerificationCodeModel.findOne({
            code,
            type: VerificationEnum.EMAIL_VERIFICATION,
            expiresAt: { $gt: new Date() },
        })
        
        if (!validCode) {
            throw new NotFoundException("Invalid or expired verification code")
        }
        
        const updateUser = await UserModel.findByIdAndUpdate(
            validCode.userId,
            {
                isEmailVerified: true
            },
            {
                new: true
            }
        )

        if (!updateUser) {
            throw new BadRequestException(
                "Unable to verify email adress",
                ErrorCode.VALIDATION_ERROR
            )
        }

        await validCode.deleteOne()

        logger.info(`User verified email successfully - ${updateUser.email}`)

        return {
            user: updateUser,
        }
    }

    public async forgotPassword(email: string) {
        const user = await UserModel.findOne({
            email,
        })

        if (!user) {
            throw new NotFoundException("User not found")
        }

        // check email rate limit is 2 emails per 10 min
        const timeAgo = tenMinutesAgo()
        const maxAttempts = 3

        const count = await VerificationCodeModel.countDocuments({
            userId: user._id,
            type: VerificationEnum.PASSWORD_RESET,
            createdAt: { $gt: timeAgo },
        })

        if (count >= maxAttempts) {
            throw new HttpException(
                "Too many attempts, please try again later",
                HTTPSTATUS.TOO_MANY_REQUESTS,
                ErrorCode.AUTH_TOO_MANY_ATTEMPTS
            )
        }

        const expiresAt = calculateExpirationDate("1h")
        const validCode = await VerificationCodeModel.create({
            userId: user._id,
            type: VerificationEnum.PASSWORD_RESET,
            expiresAt,
        })

        const resetLink = `${config.APP_ORIGIN}/reset-password?code=${validCode.code}&exp=${expiresAt.getTime()}`
        const {data, error} = await sendEmail({
            to: user.email,
            ...passwordResetTemplate(resetLink),
        })

        logger.info(`Password reset email sent to ${user.email} - ${data?.id}`)

        if (!data?.id) {
            throw new InternalServerException(`${error?.name} ${error?.message}`)
        }
        return {
            url: resetLink,
            emailId: data.id,
        }
    }

    public async resetPassword({
        verificationCode,
        password,
    }: ResetPasswordDto) {
        const validCode = await VerificationCodeModel.findOne({
            code: verificationCode,
            type: VerificationEnum.PASSWORD_RESET,
            expiresAt: { $gt: new Date() },
        })

        if (!validCode) {
            throw new NotFoundException("Invalid or expired verification code")
        }

        const hashedPassword = await hashValue(password)

        const updateUser = await UserModel.findByIdAndUpdate(
            validCode.userId,
            {
                password: hashedPassword,
            }
        )

        if (!updateUser) {
            throw new BadRequestException("Failed to reset password")     
        }

        await validCode.deleteOne()

        await SessionModel.deleteMany({
            userId: updateUser._id,
        })

        logger.info(`User reset password successfully - ${updateUser.email}`)

        return {
            user: updateUser
        }
    }

    public async logout(sessionId: string) {
        return await SessionModel.findByIdAndDelete(sessionId)
    }
}
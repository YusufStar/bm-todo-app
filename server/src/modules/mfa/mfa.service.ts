import { Request } from "express";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { BadRequestException, UnauthorizedException } from "../../common/utils/catch-errors";

export class MfaService {
    public async generateMfaSetup(req: Request): Promise<{
        message: string;
        secret?: string;
        qrImageUrl?: string;
    }> {
        const user = req.user;

        if (!user) {
            throw new UnauthorizedException("User not authorized");
        }

        if (user.userPreferences.enable2FA) {
            return {
                message: "MFA already enabled",
            };
        }

        let secretKey = user.userPreferences.twoFactorSecret;

        if (!secretKey) {
            const secret = speakeasy.generateSecret({
                name: "BM Todo",
            });
            secretKey = secret.base32;
            user.userPreferences.twoFactorSecret = secretKey;
            await user.save();
        }

        const url = speakeasy.otpauthURL({
            secret: secretKey,
            label: `${user.name} (${user.email})`,
            issuer: "bmtodo.com",
            encoding: "base32",
        });

        const qrImageUrl = await qrcode.toDataURL(url);

        return {
            message: "Scan the QR code or use the setup key.",
            secret: secretKey,
            qrImageUrl,
        };
    }

    public async verifyMfaToken(
        req: Request,
        code: string,
        secretKey: string
    ) {
        const user = req.user;

        if (!user) {
            throw new UnauthorizedException("User not authorized");
        }

        if (user.userPreferences.enable2FA) {
            return {
                message: "MFA already enabled",
                userPreferences: {
                    enable2FA: user.userPreferences.enable2FA,
                }
            }
        }

        const isValid = speakeasy.totp.verify({
            secret: secretKey,
            encoding: "base32",
            token: code,
        })

        if (!isValid) {
            throw new BadRequestException("Invalid MFA code. Pleae try again.");
        }
        
        user.userPreferences.enable2FA = true;
        await user.save();

        return {
            message: "MFA setup successfully",
            userPreferences: {
                enable2FA: user.userPreferences.enable2FA,
            }
        }
    }
}

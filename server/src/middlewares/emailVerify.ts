import { Request, Response, NextFunction } from 'express';
import { HTTPSTATUS } from '../config/http.config';
import UserModel from '../database/models/user.model';

export default async function emailVerify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.user?.id) {
            res.status(HTTPSTATUS.UNAUTHORIZED).json({
                message: 'Unauthorized',
            });
            return;
        }

        const user = await UserModel.findById(req.user.id);
        if (!user) {
            res.status(HTTPSTATUS.NOT_FOUND).json({
                message: 'User not found',
            });
            return;
        }

        if (!user.isEmailVerified) {
            res.status(HTTPSTATUS.FORBIDDEN).json({
                message: 'Email not verified',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}
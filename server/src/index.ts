import "dotenv/config";
import cors from "cors";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { config } from "./config/app.config";
import { logger } from "./common/utils/logger";
import connectDatabase from "./database/database";
import { errorHandler } from "./middlewares/errorHandler";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler";
import authRoutes from "./modules/auth/auth.routes";
import passport from "./middlewares/passport";
import { authenticateJWT } from "./common/strategies/jwt.strategy";
import sessionRoutes from "./modules/session/session.routes";
import mfaRoutes from "./modules/mfa/mfa.routes";
import userRoutes from "./modules/user/user.routes";
import UserModel from "./database/models/user.model";
import SessionModel from "./database/models/session.model";
import DepartmentModel from "./database/models/department.model";
import VerificationCodeModel from "./database/models/verification.model";
import data from "../public/data.json";
import emailVerify from "./middlewares/emailVerify";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: config.APP_ORIGIN,
        credentials: true,
    })
);

app.use(cookieParser());
app.use(passport.initialize());

app.use(express.static(path.join(__dirname, '../public')));

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/mfa`, mfaRoutes);

app.use(`${BASE_PATH}/session`, authenticateJWT, sessionRoutes);
app.use(`${BASE_PATH}/user`, authenticateJWT, emailVerify, userRoutes);

app.get(`/`, asyncHandler(async (req: Request, res: Response) => {
    res.status(HTTPSTATUS.OK).json({
        message: "Hello World!",
    });
}));

app.get(`/reset`, asyncHandler(async (req: Request, res: Response) => {
    logger.info("Resetting database...");

    UserModel.deleteMany({}).exec();

    SessionModel.deleteMany({}).exec();
    DepartmentModel.deleteMany({}).exec();
    VerificationCodeModel.deleteMany({}).exec();
    logger.info("Database reset complete.");

    // create default departments
    const departments = data;

    DepartmentModel.insertMany(departments)
        .then(() => {
            logger.info("Default departments created successfully.");
        })
        .catch((error) => {
            logger.error("Error creating default departments:", error);
        });

    logger.info("Default departments created successfully.");

    return res.status(200).json({
        message: "Database reset complete.",
    });
}
))

app.get(`/all-departments`, asyncHandler(async (req: Request, res: Response) => {
    const departments = await DepartmentModel.find({}).exec();
    return res.status(200).json(departments || []);
}));

app.use(errorHandler);

app.listen(config.PORT, async () => {
    logger.info(
        `Server is running on port ${config.PORT} - ${config.NODE_ENV} mode`
    );
    await connectDatabase();
});

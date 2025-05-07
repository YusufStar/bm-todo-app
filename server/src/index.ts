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
import authRouter from "./modules/auth/auth.routes";
import passport from "./middlewares/passport";
import { authenticateJWT } from "./common/strategies/jwt.strategy";
import sessionRoutes from "./modules/session/session.routes";

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

app.use(`${BASE_PATH}/auth`, authRouter);
app.use(`${BASE_PATH}/session`, authenticateJWT, sessionRoutes);

app.get(`/`, asyncHandler(async (req: Request, res: Response) => {
    res.status(HTTPSTATUS.OK).json({
        message: "Hello World!",
    });
}));

app.use(errorHandler);

app.listen(config.PORT, async () => {
    logger.info(
        `Server is running on port ${config.PORT} - ${config.NODE_ENV} mode`
    );
    await connectDatabase();
});

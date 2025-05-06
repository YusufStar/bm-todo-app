import "dotenv/config";
import cors from "cors";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { config } from "./config/app.config";
import { logger } from "./common/utils/logger";
import { requestLogger } from "./middlewares/logger.middleware";
import connectDatabase from "./database/database";
import { errorHandler } from "./middlewares/errorHandler";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler";
import authRouter from "./modules/auth/auth.routes";

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

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

app.use(requestLogger);

app.get(`/`, asyncHandler(async (req: Request, res: Response) => {
    res.status(HTTPSTATUS.OK).json({
        message: "Hello World!",
    });
}));

app.use(errorHandler);

app.use(`${BASE_PATH}/auth`, authRouter)

app.listen(config.PORT, async () => {
    logger.info(
        `Server is running on port ${config.PORT} - ${config.NODE_ENV} mode`
    );
    await connectDatabase();
});

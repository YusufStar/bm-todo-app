import mongoose from "mongoose"
import { config } from "../config/app.config"
import { logger } from "../common/utils/logger"

const connectDatabase = async () => {
    try {
        await mongoose.connect(config.MONGO_URI)
        logger.info("Database connected successfully")
    } catch (error) {
        logger.error("Database connection failed", error)
        process.exit(1)
    }
}

export default connectDatabase
import mongoose, { Document, Schema } from "mongoose";

export interface DepartmentDocument extends Document {
    name: string;
    description: string;
}

const departmentSchema = new Schema<DepartmentDocument>(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const DepartmentModel = mongoose.model<DepartmentDocument>("Department", departmentSchema);

export default DepartmentModel;
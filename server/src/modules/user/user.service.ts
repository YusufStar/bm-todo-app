import { z } from "zod";
import UserModel, { UserDocument } from "../../database/models/user.model";
import { userUpdateSchema } from "../../common/validators/user.validator";
import { NotFoundException } from "../../common/utils/catch-errors";
import DepartmentModel from "../../database/models/department.model";

export class UserService {
    public async findUserById(userId: string) {
        const user = await UserModel.findById(userId, {
            password: false
        })
        return user || null
    }

    public async updateUser(userId: string, data: z.infer<typeof userUpdateSchema>): Promise<void> {
        const departmens = await DepartmentModel.find({})
        const department = departmens.find(department => department.id === data.department)

        if (!department) {
            throw new NotFoundException("Department not found")
        }

        const user = await UserModel.findByIdAndUpdate(userId, data, {
            new: true,
            runValidators: true,
        })

        if (!user) {
            throw new NotFoundException("User not found")
        }
    }
}
import { RegisterDto } from "../../common/interface/auth.interface";

export class AuthService {
    public register = async (registerDto: RegisterDto) => {
        const { name, email, password, confirmPassword, userAgent } = registerDto
    }
}
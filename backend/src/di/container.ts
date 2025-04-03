// import { Container } from "inversify";
// import TYPES from "./types";

// import UserModel from "../models/userModel"
// import { IUser } from "../models/userModel";

// import { UserRepository } from "../repositories/userRepository";
// import { IUserRepository } from "../interfaces/IUserRepository";

// import { AuthService } from "../services/authService";
// import { MailService } from "../utils/mail";
// import { IMailService } from "../utils/mail";
// import { JwtService } from "../utils/jwt";
// import { IJwtService } from "../utils/jwt";
// import { IAuthService } from "../interfaces/IAuthService";
// import { IAdminService } from "../interfaces/IAdminService";
// import { AdminService } from "../services/adminService";

// import { AuthController } from "../controllers/authController";
// import { AdminController } from "../controllers/adminController";
// import { IAdminController } from "../interfaces/IAdminController";

// const container = new Container();

// // models
// container.bind<typeof UserModel>(TYPES.IUser).toConstantValue(UserModel)

// // Repositories
// container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository).inSingletonScope()

// // Services
// container.bind<IAuthService>(TYPES.IAuthService).to(AuthService).inSingletonScope()
// container.bind<IJwtService>(TYPES.IJwtService).to(JwtService).inSingletonScope()
// container.bind<IMailService>(TYPES.IMailService).to(MailService).inSingletonScope()
// container.bind<IAdminService>(TYPES.IAdminService).to(AdminService).inSingletonScope()

// // Controllers
// container.bind<AuthController>(AuthController).toSelf();
// container.bind<AdminController>(AdminController).toSelf()

// export default container;

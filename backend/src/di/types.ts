const TYPES = {

  // models
  IUser: Symbol.for("IUser"),

  // Repositories
  IUserRepository: Symbol.for("IUserRepository"),

  // Services
  IAuthService: Symbol.for("IAuthService"),
  IJwtService: Symbol.for("IJwtService"),
  IMailService: Symbol.for("IMailService"),
  IAdminService: Symbol.for("IAdminService"),

  // Controllers
  IAuthController: Symbol.for("IAuthController"),
  IAdminController: Symbol.for("IAdminController"),
};

export default TYPES;
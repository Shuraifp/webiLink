const TYPES = {

  // models
  IUser: Symbol.for("IUser"),

  // Repositories
  IUserRepository: Symbol.for("IUserRepository"),

  // Services
  IAuthService: Symbol.for("IAuthService"),
  IJwtService: Symbol.for("IJwtService"),
  IMailService: Symbol.for("IMailService"),
};

export default TYPES;
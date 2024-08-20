import { AuthGuard } from "./auth.guard";
import { APP_GUARD } from "@nestjs/core";

const AuthGuardProviders = [
  {
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
];

export default AuthGuardProviders;

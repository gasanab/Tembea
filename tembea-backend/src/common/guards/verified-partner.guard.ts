import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PartnerStatus, Role } from "@prisma/client";

@Injectable()
export class VerifiedPartnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    // Admin capabilities are controlled by role/ownership guards and dedicated
    // admin endpoints; partner verification must never block an administrator.
    if (user.role === Role.ADMIN) {
      return true;
    }

    if (user.role !== Role.PARTNER) {
      throw new ForbiddenException("Partner access required");
    }

    if (!user.partner || user.partner.status !== PartnerStatus.VERIFIED) {
      throw new ForbiddenException(
        "Your partner account must be verified before managing inventory",
      );
    }

    return true;
  }
}

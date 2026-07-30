/// <reference types="jest" />

import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { PartnerStatus, Role } from "@prisma/client";
import { VerifiedPartnerGuard } from "./verified-partner.guard";

const contextFor = (user: unknown): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe("VerifiedPartnerGuard", () => {
  const guard = new VerifiedPartnerGuard();

  it("allows a verified partner", () => {
    const context = contextFor({
      role: Role.PARTNER,
      partner: { id: "partner-1", status: PartnerStatus.VERIFIED },
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it.each([PartnerStatus.PENDING, PartnerStatus.SUSPENDED])(
    "rejects a %s partner",
    (status) => {
      const context = contextFor({
        role: Role.PARTNER,
        partner: { id: "partner-1", status },
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    },
  );

  it("allows an administrator without a partner profile", () => {
    expect(guard.canActivate(contextFor({ role: Role.ADMIN }))).toBe(true);
  });
});

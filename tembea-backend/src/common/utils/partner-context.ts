import { ForbiddenException } from "@nestjs/common";

export function getPartnerIdOrThrow(user: {
  partner?: { id?: string } | null;
}): string {
  const partnerId = user?.partner?.id;

  if (!partnerId) {
    throw new ForbiddenException("A partner profile is required for this action");
  }

  return partnerId;
}

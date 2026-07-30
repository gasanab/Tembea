import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto, RegistrationRole } from "./dto/register.dto";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { Response } from "express";
import { PartnerStatus, Role } from "@prisma/client";
import { PasswordResetEmailService } from "./password-reset-email.service";

const COOKIE_NAME = "tembea_token";
const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private passwordResetEmail: PasswordResetEmailService,
  ) {}

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private hashResetToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  private assertBcryptPasswordSize(password: string) {
    if (Buffer.byteLength(password, "utf8") > 72) {
      throw new BadRequestException(
        "Password is too long; use at most 72 UTF-8 bytes",
      );
    }
  }

  private setCookies(res: Response, token: string) {
    const isProduction = this.config.get("NODE_ENV") === "production";
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  async register(dto: RegisterDto, res: Response) {
    this.assertBcryptPasswordSize(dto.password);
    const email = this.normalizeEmail(dto.email);
    const requestedRole = dto.role ?? RegistrationRole.CLIENT;
    if (!Object.values(RegistrationRole).includes(requestedRole)) {
      throw new BadRequestException("Invalid registration role");
    }

    const role =
      requestedRole === RegistrationRole.PARTNER ? Role.PARTNER : Role.CLIENT;
    const existing = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (existing) throw new ConflictException("Email already registered");

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email,
        passwordHash,
        role,
        ...(role === Role.PARTNER && {
          partner: {
            create: {
              businessName: dto.name,
              category: "TOURS",
              documents: [],
              status: PartnerStatus.PENDING,
            },
          },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        partner: {
          select: {
            id: true,
            businessName: true,
            category: true,
            status: true,
          },
        },
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwt.sign(payload);
    this.setCookies(res, token);

    return {
      user,
      partner: user.partner,
      token,
    };
  }

  async login(dto: LoginDto, res: Response) {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      include: {
        partner: {
          select: {
            id: true,
            businessName: true,
            category: true,
            status: true,
          },
        },
      },
    });
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwt.sign(payload);
    this.setCookies(res, token);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        partner: user.partner,
      },
      partner: user.partner,
      token,
    };
  }

  async logout(res: Response) {
    res.clearCookie(COOKIE_NAME);
    return { message: "Logged out" };
  }

  async forgotPassword(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });
    // Always return success to avoid email enumeration
    if (!user) return { message: "If that email exists, a reset link was sent" };

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
      });
      await tx.passwordResetToken.create({
        data: { userId: user.id, token: tokenHash, expiresAt },
      });
    });

    try {
      await this.passwordResetEmail.sendPasswordReset(user.email, rawToken);
    } catch {
      // Preserve the generic response to avoid account enumeration and revoke
      // the unusable token. Do not log the raw token or reset URL here.
      await this.prisma.passwordResetToken.updateMany({
        where: { token: tokenHash, used: false },
        data: { used: true },
      });
      this.logger.error("Password reset email delivery failed");
    }

    return { message: "If that email exists, a reset link was sent" };
  }

  async resetPassword(token: string, newPassword: string) {
    this.assertBcryptPasswordSize(newPassword);
    const tokenHash = this.hashResetToken(token);
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      const record = await tx.passwordResetToken.findUnique({
        where: { token: tokenHash },
      });
      if (!record || record.used || record.expiresAt <= now) {
        throw new BadRequestException("Invalid or expired reset token");
      }

      const claimed = await tx.passwordResetToken.updateMany({
        where: {
          id: record.id,
          token: tokenHash,
          used: false,
          expiresAt: { gt: now },
        },
        data: { used: true },
      });
      if (claimed.count !== 1) {
        throw new BadRequestException("Invalid or expired reset token");
      }

      await tx.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      });
      await tx.passwordResetToken.updateMany({
        where: { userId: record.userId, used: false },
        data: { used: true },
      });
      await tx.refreshToken.deleteMany({ where: { userId: record.userId } });
    });

    return { message: "Password updated successfully" };
  }
}

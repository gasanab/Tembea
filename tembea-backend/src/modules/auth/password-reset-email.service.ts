import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PasswordResetEmailService {
  private readonly logger = new Logger(PasswordResetEmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendPasswordReset(recipient: string, rawToken: string): Promise<void> {
    const frontendUrl = this.config.get<string>(
      "FRONTEND_URL",
      "http://localhost:3000",
    );
    const resetUrl = new URL("/reset-password", frontendUrl);
    resetUrl.searchParams.set("token", rawToken);

    const apiKey = this.config.get<string>("RESEND_API_KEY");
    const emailFrom = this.config.get<string>("EMAIL_FROM");
    const nodeEnv = this.config.get<string>("NODE_ENV", "development");
    const allowDevelopmentLog = this.config.get<boolean>(
      "ALLOW_DEV_PASSWORD_RESET_LOG",
      false,
    );

    if (!apiKey || !emailFrom) {
      if (nodeEnv === "development" && allowDevelopmentLog) {
        // This is deliberately opt-in and development-only. Never enable it in
        // a shared or production environment because the URL contains a token.
        this.logger.warn(`[DEVELOPMENT ONLY] Password reset URL: ${resetUrl}`);
        return;
      }
      throw new ServiceUnavailableException(
        "Password reset email delivery is not configured",
      );
    }

    const escapedResetUrl = resetUrl.toString().replace(/&/g, "&amp;");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [recipient],
        subject: "Reset your Tembea password",
        text: `Reset your Tembea password using this link: ${resetUrl}`,
        html: `<p>We received a request to reset your Tembea password.</p><p><a href="${escapedResetUrl}">Reset password</a></p><p>This link expires in one hour. If you did not request it, you can ignore this email.</p>`,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException("Password reset email could not be sent");
    }
  }
}

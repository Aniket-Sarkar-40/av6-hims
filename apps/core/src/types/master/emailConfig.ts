export interface CreateOrUpdateEmailConfig {
  emailType: string | null;
  smtpServer: string | null;
  smtpPort: string | null;
  smtpUsername: string | null;
  smtpPassword: string | null;
  sslTls: string | null;
  isActive: "yes" | "no";
}

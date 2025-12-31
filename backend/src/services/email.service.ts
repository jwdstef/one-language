import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// 验证码存储 (生产环境应使用 Redis)
const verificationCodes = new Map<string, { code: string; expiresAt: Date }>();

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

/**
 * 生成6位数字验证码
 */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 发送验证码邮件
 */
export async function sendVerificationCode(email: string): Promise<void> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟有效期

  // 存储验证码
  verificationCodes.set(email, { code, expiresAt });

  // 发送邮件
  await transporter.sendMail({
    from: `"One-Language" <${env.SMTP_FROM}>`,
    to: email,
    subject: '【One-Language】邮箱验证码',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
        <h2 style="color: #0d9488;">One-Language 邮箱验证</h2>
        <p>您好！</p>
        <p>您的验证码是：</p>
        <div style="background: #f0fdfa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #0d9488; letter-spacing: 8px;">${code}</span>
        </div>
        <p>验证码有效期为 <strong>10 分钟</strong>，请尽快完成验证。</p>
        <p>如果这不是您的操作，请忽略此邮件。</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
      </div>
    `,
  });
}

/**
 * 验证验证码
 */
export function verifyCode(email: string, code: string): boolean {
  const stored = verificationCodes.get(email);
  
  if (!stored) {
    return false;
  }

  // 检查是否过期
  if (stored.expiresAt < new Date()) {
    verificationCodes.delete(email);
    return false;
  }

  // 验证码匹配
  if (stored.code === code) {
    verificationCodes.delete(email); // 验证成功后删除
    return true;
  }

  return false;
}

/**
 * 清理过期验证码 (定时任务)
 */
export function cleanupExpiredCodes(): void {
  const now = new Date();
  for (const [email, data] of verificationCodes.entries()) {
    if (data.expiresAt < now) {
      verificationCodes.delete(email);
    }
  }
}

// 每5分钟清理一次过期验证码
setInterval(cleanupExpiredCodes, 5 * 60 * 1000);

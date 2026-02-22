import { emailButton, emailLayout } from './layout';

interface VerificationEmailParams {
  verification_url: string;
}

export function buildVerificationEmail(params: VerificationEmailParams) {
  return {
    subject: 'Verify your email address',
    html: emailLayout(`
          <tr>
            <td style="padding:36px 36px 16px;">
              <h1 style="margin:0;font-size:20px;font-weight:600;color:#0a0806;">Verify your email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 24px;">
              <p style="margin:0;font-size:14px;line-height:22px;color:#726b65;">Click the button below to verify your email address and get started with CoderScreen.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 24px;">
              ${emailButton(params.verification_url, 'Verify email')}
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 36px;border-top:1px solid #e5e1dd;">
              <p style="margin:16px 0 0;font-size:12px;line-height:18px;color:#726b65;">If you didn't create an account, you can safely ignore this email.</p>
            </td>
          </tr>`),
  };
}

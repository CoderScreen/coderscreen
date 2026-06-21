import { emailLayout } from './layout';

interface SupportMessageEmailParams {
  user_name: string;
  user_email: string;
  user_id: string;
  org_id: string | null;
  message: string;
}

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildSupportMessageEmail(params: SupportMessageEmailParams) {
  const message = escapeHtml(params.message).replace(/\n/g, '<br />');

  return {
    subject: `Support request from ${params.user_name}`,
    html: emailLayout(`
          <tr>
            <td style="padding:36px 36px 8px;">
              <h1 style="margin:0;font-size:20px;font-weight:600;color:#0a0806;">New support request</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 24px;">
              <p style="margin:0;font-size:14px;line-height:22px;color:#726b65;"><strong style="color:#0a0806;">${escapeHtml(params.user_name)}</strong> sent a message through the in-app support dialog.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f7f6;border:1px solid #e5e1dd;border-radius:6px;">
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #e5e1dd;">
                    <p style="margin:0;font-size:12px;color:#726b65;text-transform:uppercase;letter-spacing:0.04em;">From</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#0a0806;">${escapeHtml(params.user_name)} &lt;${escapeHtml(params.user_email)}&gt;</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:12px;color:#726b65;text-transform:uppercase;letter-spacing:0.04em;">User / Org</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#0a0806;">${escapeHtml(params.user_id)}${params.org_id ? ` · ${escapeHtml(params.org_id)}` : ''}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 36px;">
              <p style="margin:0 0 8px;font-size:12px;color:#726b65;text-transform:uppercase;letter-spacing:0.04em;">Message</p>
              <div style="font-size:14px;line-height:22px;color:#0a0806;white-space:pre-wrap;">${message}</div>
            </td>
          </tr>`),
  };
}

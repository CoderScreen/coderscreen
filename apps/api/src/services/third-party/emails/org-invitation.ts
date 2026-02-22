import { emailButton, emailLayout } from './layout';

interface OrgInvitationEmailParams {
  invited_by_username: string;
  invited_by_email: string;
  org_name: string;
  invite_link: string;
}

export function buildOrgInvitationEmail(params: OrgInvitationEmailParams) {
  return {
    subject: `${params.invited_by_username} invited you to ${params.org_name}`,
    html: emailLayout(`
          <tr>
            <td style="padding:36px 36px 16px;">
              <h1 style="margin:0;font-size:20px;font-weight:600;color:#0a0806;">Join ${params.org_name}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 24px;">
              <p style="margin:0;font-size:14px;line-height:22px;color:#726b65;"><strong style="color:#0a0806;">${params.invited_by_username}</strong> (${params.invited_by_email}) has invited you to collaborate on CoderScreen.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 24px;">
              ${emailButton(params.invite_link, 'Accept invitation')}
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 36px;border-top:1px solid #e5e1dd;">
              <p style="margin:16px 0 0;font-size:12px;line-height:18px;color:#726b65;">If you weren't expecting this invitation, you can safely ignore this email.</p>
            </td>
          </tr>`),
  };
}

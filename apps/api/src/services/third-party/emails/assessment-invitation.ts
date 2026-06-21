import { emailButton, emailLayout } from './layout';

interface AssessmentInvitationEmailParams {
  org_name: string;
  candidate_name: string;
  assessment_title: string;
  take_link: string;
}

export function buildAssessmentInvitationEmail(params: AssessmentInvitationEmailParams) {
  return {
    subject: `You've been invited to ${params.assessment_title}`,
    html: emailLayout(`
          <tr>
            <td style="padding:36px 36px 16px;">
              <h1 style="margin:0;font-size:20px;font-weight:600;color:#0a0806;">${params.assessment_title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 24px;">
              <p style="margin:0;font-size:14px;line-height:22px;color:#726b65;">Hi <strong style="color:#0a0806;">${params.candidate_name}</strong>, <strong style="color:#0a0806;">${params.org_name}</strong> has invited you to take the <strong style="color:#0a0806;">${params.assessment_title}</strong> assessment on CoderScreen.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 24px;">
              ${emailButton(params.take_link, 'Start assessment')}
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 36px;border-top:1px solid #e5e1dd;">
              <p style="margin:16px 0 0;font-size:12px;line-height:18px;color:#726b65;">If the button doesn't work, copy and paste this link into your browser:<br /><span style="color:#1860fb;word-break:break-all;">${params.take_link}</span></p>
            </td>
          </tr>`),
  };
}

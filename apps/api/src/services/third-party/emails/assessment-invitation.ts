import { emailButton, emailLayout } from '@coderscreen/email/layout';

interface AssessmentInvitationEmailParams {
  org_name: string;
  candidate_name: string;
  assessment_title: string;
  take_link: string;
  start_by?: string | null;
  message?: string | null;
}

// The message is free text from the hiring team, so it must not become markup.
const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const formatDeadline = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });

export function buildAssessmentInvitationEmail(params: AssessmentInvitationEmailParams) {
  const message = params.message?.trim()
    ? `
          <tr>
            <td style="padding:0 36px 24px;">
              <p style="margin:0;padding:14px 18px;background-color:#f8f7f6;border:1px solid #e5e1dd;border-radius:6px;font-size:14px;line-height:22px;color:#0a0806;white-space:pre-wrap;">${escapeHtml(params.message.trim())}</p>
            </td>
          </tr>`
    : '';
  const deadline = params.start_by
    ? `
          <tr>
            <td style="padding:0 36px 24px;">
              <p style="margin:0;font-size:14px;line-height:22px;color:#726b65;">Please start by <strong style="color:#0a0806;">${formatDeadline(params.start_by)}</strong>. The link stops working after that.</p>
            </td>
          </tr>`
    : '';

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
          </tr>${message}${deadline}
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

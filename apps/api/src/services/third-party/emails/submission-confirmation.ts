import { emailLayout } from '@coderscreen/email/layout';

interface SubmissionConfirmationEmailParams {
  candidate_name: string;
  assessment_title: string;
  org_name: string;
}

export function buildSubmissionConfirmationEmail(params: SubmissionConfirmationEmailParams) {
  return {
    subject: `We received your submission for ${params.assessment_title}`,
    html: emailLayout(`
          <tr>
            <td style="padding:36px 36px 16px;">
              <h1 style="margin:0;font-size:20px;font-weight:600;color:#0a0806;">Submission received</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 24px;">
              <p style="margin:0;font-size:14px;line-height:22px;color:#726b65;">Hi <strong style="color:#0a0806;">${params.candidate_name}</strong>, thanks for completing <strong style="color:#0a0806;">${params.assessment_title}</strong>. Your submission has been received.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 36px;border-top:1px solid #e5e1dd;">
              <p style="margin:16px 0 0;font-size:12px;line-height:18px;color:#726b65;">${params.org_name} will review your submission and follow up with any next steps. No further action is needed from you.</p>
            </td>
          </tr>`),
  };
}

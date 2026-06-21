import { emailButton, emailLayout } from '@coderscreen/email/layout';

interface AssessmentSubmissionEmailParams {
  org_name: string;
  candidate_name: string;
  candidate_email: string;
  assessment_title: string;
  score: number | null;
  max_score: number | null;
  submitted_at: string;
  view_link: string;
}

const formatScore = (score: number | null, maxScore: number | null): string => {
  if (score == null || maxScore == null) return 'Not scored';
  return `${score} / ${maxScore}`;
};

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export function buildAssessmentSubmissionEmail(params: AssessmentSubmissionEmailParams) {
  const score = formatScore(params.score, params.max_score);
  const submitted = formatDate(params.submitted_at);

  return {
    subject: `${params.candidate_name} submitted ${params.assessment_title}`,
    html: emailLayout(`
          <tr>
            <td style="padding:36px 36px 8px;">
              <h1 style="margin:0;font-size:20px;font-weight:600;color:#0a0806;">New assessment submission</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 24px;">
              <p style="margin:0;font-size:14px;line-height:22px;color:#726b65;"><strong style="color:#0a0806;">${params.candidate_name}</strong> just submitted <strong style="color:#0a0806;">${params.assessment_title}</strong>.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f7f6;border:1px solid #e5e1dd;border-radius:6px;">
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #e5e1dd;">
                    <p style="margin:0;font-size:12px;color:#726b65;text-transform:uppercase;letter-spacing:0.04em;">Candidate</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#0a0806;">${params.candidate_name} &lt;${params.candidate_email}&gt;</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #e5e1dd;">
                    <p style="margin:0;font-size:12px;color:#726b65;text-transform:uppercase;letter-spacing:0.04em;">Score</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#0a0806;font-weight:600;">${score}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:12px;color:#726b65;text-transform:uppercase;letter-spacing:0.04em;">Submitted</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#0a0806;">${submitted}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 24px;">
              ${emailButton(params.view_link, 'View submission')}
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 36px;border-top:1px solid #e5e1dd;">
              <p style="margin:16px 0 0;font-size:12px;line-height:18px;color:#726b65;">You're receiving this because you're a member of ${params.org_name} on CoderScreen.</p>
            </td>
          </tr>`),
  };
}

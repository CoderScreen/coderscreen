import { emailButton, emailLayout } from '../layout';

export interface AssessmentsLaunchEmailParams {
  /** Where the CTA button points, e.g. https://app.coderscreen.com/assessments */
  ctaUrl: string;
  /** Signed name shown above the footer, e.g. "Kuba" */
  senderName: string;
  /** Physical mailing address, legally required in marketing email (CAN-SPAM). */
  companyAddress: string;
  /** Optional hero screenshot (assessment builder/list). Omitted if not provided. */
  heroImageUrl?: string;
  /** Optional results screenshot (graded submission). Omitted if not provided. */
  resultImageUrl?: string;
}

// Resend Broadcasts fills these merge variables per recipient at send time.
const FIRST_NAME = '{{{FIRST_NAME|there}}}';
const UNSUBSCRIBE_URL = '{{{RESEND_UNSUBSCRIBE_URL}}}';

const p = (html: string) =>
  `<p style="margin:0 0 16px;font-size:15px;line-height:24px;color:#3f3a36;">${html}</p>`;

const imageRow = (src: string, alt: string) => `
          <tr>
            <td style="padding:8px 36px 16px;">
              <img src="${src}" alt="${alt}" width="408" style="width:100%;max-width:408px;height:auto;display:block;border-radius:8px;border:1px solid #e5e1dd;" />
            </td>
          </tr>`;

/**
 * Marketing announcement for the Assessments feature. Returns the subject,
 * preview text, and HTML for a Resend Broadcast. Intended for the
 * existing-customer segment, not a transactional send.
 */
export function buildAssessmentsLaunchEmail(params: AssessmentsLaunchEmailParams) {
  const hero = params.heroImageUrl
    ? imageRow(params.heroImageUrl, 'Building a coding assessment in CoderScreen')
    : '';
  const result = params.resultImageUrl
    ? imageRow(params.resultImageUrl, 'Auto-graded assessment results with a score and breakdown')
    : '';

  return {
    subject: 'Screen candidates before you hop on a call',
    previewText: 'Our new Assessments feature handles the first round for you.',
    html: emailLayout(`
          <tr>
            <td style="padding:36px 36px 8px;">
              ${p(`Hey <strong style="color:#0a0806;">${FIRST_NAME}</strong>,`)}
              ${p(`Quick one. We just shipped something I think you'll actually use.`)}
              ${p(`You already use CoderScreen for live interviews. Now you can have people prove they can code <em>before</em> you ever get on a call with them.`)}
              ${p(`It's called <strong style="color:#0a0806;">Assessments</strong>.`)}
            </td>
          </tr>${hero}
          <tr>
            <td style="padding:8px 36px 0;">
              ${p(`The idea is simple. You build a coding test once, send candidates a link, and they solve real problems in whatever language they want. We grade it automatically. You just open your dashboard and see who's actually good.`)}
              ${p(`No rubrics, no scheduling back and forth, no reading half-finished take-homes at 9pm.`)}
            </td>
          </tr>${result}
          <tr>
            <td style="padding:8px 36px 0;">
              ${p(`A couple of things people already like:`)}
              ${p(`<strong style="color:#0a0806;">Reuse your questions.</strong> Build a library once and see which ones actually tell strong candidates apart.`)}
              ${p(`<strong style="color:#0a0806;">Weight the hard stuff.</strong> Make the tough question worth more, and you get one clear score per person.`)}
            </td>
          </tr>
          <tr>
            <td style="padding:12px 36px 8px;">
              ${emailButton(params.ctaUrl, 'Create your first assessment')}
              <p style="margin:14px 0 0;font-size:13px;line-height:20px;color:#726b65;">Takes about two minutes to set up your first one. Or just reply here and I'll walk you through it.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 36px 28px;">
              ${p(`Cheers,`)}
              ${p(`${params.senderName}`)}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 36px;border-top:1px solid #e5e1dd;">
              <p style="margin:0 0 6px;font-size:12px;line-height:18px;color:#9b938c;">CoderScreen · ${params.companyAddress}</p>
              <p style="margin:0;font-size:12px;line-height:18px;color:#9b938c;">You're receiving this because you have a CoderScreen account. <a href="${UNSUBSCRIBE_URL}" style="color:#9b938c;text-decoration:underline;">Unsubscribe</a></p>
            </td>
          </tr>`),
  };
}

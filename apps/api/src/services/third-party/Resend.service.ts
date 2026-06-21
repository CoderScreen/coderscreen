import { Context } from 'hono';
import { Resend } from 'resend';
import { AppContext } from '@/index';
import { buildAssessmentSubmissionEmail } from './emails/assessment-submission';
import { buildOrgInvitationEmail } from './emails/org-invitation';
import { buildSignupFeedbackEmail } from './emails/signup-feedback';
import { buildSupportMessageEmail } from './emails/support-message';
import { buildVerificationEmail } from './emails/verification';

type TransactionalEmailTypes = 'verification_code' | 'org_invitation' | 'assessment_submission';
type TransactionEmailParams = {
  verification_code: {
    params: {
      verification_url: string;
    };
  };
  org_invitation: {
    params: {
      invited_by_username: string;
      invited_by_email: string;
      org_name: string;
      invite_link: string;
    };
  };
  assessment_submission: {
    params: {
      org_name: string;
      candidate_name: string;
      candidate_email: string;
      assessment_title: string;
      score: number | null;
      max_score: number | null;
      submitted_at: string;
      view_link: string;
    };
  };
};

type TransactionEmailPayload<T extends TransactionalEmailTypes> = T extends TransactionalEmailTypes
  ? TransactionEmailParams[T]['params']
  : never;

const FROM_ADDRESS = 'CoderScreen <team@coderscreen.com>';
const SUPPORT_ADDRESS = 'team@coderscreen.com';

const EMAIL_BUILDERS: {
  [K in TransactionalEmailTypes]: (params: TransactionEmailPayload<K>) => {
    subject: string;
    html: string;
  };
} = {
  verification_code: buildVerificationEmail,
  org_invitation: buildOrgInvitationEmail,
  assessment_submission: buildAssessmentSubmissionEmail,
};

export class ResendService {
  private client: Resend;

  constructor(private readonly ctx: Context<AppContext>) {
    this.client = new Resend(this.ctx.env.INFISCAL_RESEND_API_KEY);
  }

  async sendTransactionalEmail<T extends TransactionalEmailTypes>(
    type: T,
    email: string,
    params: TransactionEmailPayload<T>
  ): Promise<void> {
    const { subject, html } = EMAIL_BUILDERS[type](params as any);

    if (this.ctx.env.NODE_ENV === 'development') {
      console.log('Skipping email in development. Details:', {
        type,
        email,
        subject,
        params,
      });
      return;
    }

    const { error } = await this.client.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendSupportMessage(params: {
    user_name: string;
    user_email: string;
    user_id: string;
    org_id: string | null;
    message: string;
  }): Promise<void> {
    const { subject, html } = buildSupportMessageEmail(params);

    if (this.ctx.env.NODE_ENV === 'development') {
      console.log('Skipping support message email in development. Details:', {
        to: SUPPORT_ADDRESS,
        subject,
        params,
      });
      return;
    }

    const { error } = await this.client.emails.send({
      from: FROM_ADDRESS,
      replyTo: `${params.user_name} <${params.user_email}>`,
      to: SUPPORT_ADDRESS,
      subject,
      html,
    });

    if (error) {
      console.error('Failed to send support message:', error);
      throw new Error(`Failed to send support message: ${error.message}`);
    }
  }

  async sendScheduledFeedbackEmail(email: string, params: { user_name: string }): Promise<void> {
    const { subject, html } = buildSignupFeedbackEmail(params);
    if (this.ctx.env.NODE_ENV === 'development') {
      console.log('Skipping scheduled feedback email in development. Details:', {
        email,
        subject,
        scheduledAt: 'in 7 days',
        params,
      });
      return;
    }

    const { error } = await this.client.emails.send({
      from: 'Kuba from CoderScreen <kuba@coderscreen.com>',
      replyTo: 'team@coderscreen.com',
      to: email,
      subject,
      html,
      scheduledAt: 'in 7 days',
    });

    if (error) {
      console.error('Failed to schedule feedback email:', error);
    }
  }
}

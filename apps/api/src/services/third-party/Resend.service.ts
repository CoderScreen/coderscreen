import { Context } from 'hono';
import { Resend } from 'resend';
import { AppContext } from '@/index';
import { buildOrgInvitationEmail } from './emails/org-invitation';
import { buildVerificationEmail } from './emails/verification';

type TransactionalEmailTypes = 'verification_code' | 'org_invitation';
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
};

type TransactionEmailPayload<T extends TransactionalEmailTypes> = T extends TransactionalEmailTypes
  ? TransactionEmailParams[T]['params']
  : never;

const FROM_ADDRESS = 'CoderScreen <team@coderscreen.com>';

const EMAIL_BUILDERS: {
  [K in TransactionalEmailTypes]: (params: TransactionEmailPayload<K>) => {
    subject: string;
    html: string;
  };
} = {
  verification_code: buildVerificationEmail,
  org_invitation: buildOrgInvitationEmail,
};

export class ResendService {
  private client: Resend;

  constructor(private readonly ctx: Context<AppContext>) {
    this.client = new Resend(this.ctx.env.INFISCAL_RESEND_API_KEY);
  }

  async sendTransactionalEmail<T extends TransactionalEmailTypes>(
    type: T,
    email: string,
    params: TransactionEmailPayload<T>,
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
}

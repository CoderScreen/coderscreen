import { Context } from 'hono';
import { LoopsClient } from 'loops';
import { AppContext } from '@/index';

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

// Create a mapping type that links TransactionalEmailTypes to TransactionEmailParams
type TransactionEmailPayload<T extends TransactionalEmailTypes> = T extends TransactionalEmailTypes
  ? TransactionEmailParams[T]['params']
  : never;

const TRANSACTIONAL_EMAIL_IDS = {
  verification_code: 'cmdnkcnps00180g0i7cb164lm',
  org_invitation: 'cmdnko41u03vl0w0i6zmrme2g',
} as Record<TransactionalEmailTypes, string>;

export class LoopsService {
  private client: LoopsClient;

  constructor(private readonly ctx: Context<AppContext>) {
    this.client = new LoopsClient(this.ctx.env.INFISCAL_LOOPS_API_KEY);
  }

  async createContact(params: { email: string; name: string }) {
    return this.client.createContact(params.email, params);
  }

  async sendTransactionalEmail<T extends TransactionalEmailTypes>(
    type: T,
    email: string,
    params: TransactionEmailPayload<T>
  ): Promise<void> {
    if (this.ctx.env.NODE_ENV !== 'development') {
      await this.client.sendTransactionalEmail({
        transactionalId: TRANSACTIONAL_EMAIL_IDS[type],
        email,
        dataVariables: params,
      });
    }

    console.log('Not sending email in non-production environment. Details', {
      type,
      email,
      params,
    });
  }
}

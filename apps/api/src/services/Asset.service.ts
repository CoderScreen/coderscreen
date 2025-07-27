import { generateId } from '@coderscreen/common/id';
import { AssetEntity, assetTable } from '@coderscreen/db/asset.db';
import { eq } from 'drizzle-orm';
import { Context } from 'hono';
import { useDb } from '@/db/client';
import { AppContext } from '@/index';
import { getSession } from '@/lib/session';

export class AssetService {
  constructor(private readonly ctx: Context<AppContext>) {}

  async uploadImage(base64Data: string) {
    const { user } = getSession(this.ctx, { noActiveOrg: true });
    const db = useDb(this.ctx);

    const assetId = generateId('asset');

    // Extract content type and file extension from base64 data
    const contentTypeMatch = base64Data.match(/^data:([^;]+);base64,/);
    const contentType = contentTypeMatch ? contentTypeMatch[1] : 'image/png';
    const fileType = contentType.split('/')[1] || 'png';
    const key = `${assetId}.${fileType}`;

    const publicUrl = `${this.ctx.env.ASSETS_URL}/${key}`;

    const asset = await db.transaction(async (tx) => {
      const _asset = await tx
        .insert(assetTable)
        .values({
          id: assetId,
          createdAt: new Date().toISOString(),
          userId: user.id,
          url: publicUrl,
          key,
          status: 'active',
        })
        .returning()
        .then((asset) => asset[0]);

      // Convert base64 to binary and upload to r2
      const base64Content = base64Data.replace(/^data:[^;]+;base64,/, '');
      const binaryData = Uint8Array.from(atob(base64Content), (c) => c.charCodeAt(0));

      await this.ctx.env.ASSETS_BUCKET.put(key, binaryData, {
        httpMetadata: {
          contentType,
        },
      });

      return _asset;
    });

    return asset;
  }

  async deleteAsset(asset: AssetEntity) {
    const db = useDb(this.ctx);

    await db.transaction(async (tx) => {
      await this.ctx.env.ASSETS_BUCKET.delete(asset.key);

      await tx.update(assetTable).set({ status: 'deleted' }).where(eq(assetTable.id, asset.id));
    });
  }
}

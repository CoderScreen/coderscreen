import { AppContext } from '@/index';
import { AssetEntity, assetTable } from '@coderscreen/db/asset.db';
import { useDb } from '@/db/client';
import { Context } from 'hono';
import { getSession } from '@/lib/session';
import { generateId } from '@coderscreen/common/id';
import { eq } from 'drizzle-orm';

export class AssetService {
	constructor(private readonly ctx: Context<AppContext>) {}

	async uploadImage(base64Data: string) {
		const { user, orgId } = getSession(this.ctx);
		const db = useDb(this.ctx);

		const assetId = generateId('asset');
		const fileType = base64Data.split(';')[0].split('/')[1];
		const key = `${assetId}.${fileType}`;

		const publicUrl = `${this.ctx.env.ASSETS_URL}/${key}`;

		const asset = await db.transaction(async (tx) => {
			const _asset = await tx
				.insert(assetTable)
				.values({
					id: assetId,
					createdAt: new Date().toISOString(),
					organizationId: orgId,
					userId: user.id,
					url: publicUrl,
					key,
					status: 'active',
				})
				.returning()
				.then((asset) => asset[0]);

			// upload to r2
			await this.ctx.env.ASSETS_BUCKET.put(key, base64Data);

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

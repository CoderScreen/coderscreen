import { TLAsset, TLAssetId } from '@tldraw/tldraw';

// Simple in-memory asset store for multiplayer
const assetCache = new Map<TLAssetId, TLAsset>();

export const multiplayerAssetStore = {
  async getAsset(assetId: TLAssetId): Promise<TLAsset | undefined> {
    return assetCache.get(assetId);
  },

  async storeAsset(asset: TLAsset): Promise<void> {
    assetCache.set(asset.id, asset);
  },

  async deleteAsset(assetId: TLAssetId): Promise<void> {
    assetCache.delete(assetId);
  },
};

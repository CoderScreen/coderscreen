import { AssetRecordType, getHashForString, TLAsset, TLBookmarkAsset } from 'tldraw';

interface UnfurlResponse {
  description?: string;
  image?: string;
  favicon?: string;
  title?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// How does our server handle bookmark unfurling?
export async function getBookmarkPreview({
  url,
  roomId,
}: {
  url: string;
  roomId: string;
}): Promise<TLAsset> {
  // we start with an empty asset record
  const asset: TLBookmarkAsset = {
    id: AssetRecordType.createId(getHashForString(url)),
    typeName: 'asset',
    type: 'bookmark',
    meta: {},
    props: {
      src: url,
      description: '',
      image: '',
      favicon: '',
      title: '',
    },
  };

  try {
    // try to fetch the preview data from the server
    const response = await fetch(
      `${API_URL}/rooms/${roomId}/public/unfurl?url=${encodeURIComponent(url)}`
    );
    const data = (await response.json()) as UnfurlResponse;

    // fill in our asset with whatever info we found
    asset.props.description = data?.description ?? '';
    asset.props.image = data?.image ?? '';
    asset.props.favicon = data?.favicon ?? '';
    asset.props.title = data?.title ?? '';
  } catch (e) {
    console.error(e);
  }

  return asset;
}

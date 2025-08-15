export function normalizeIPFS(uri: string): string {
  if (!uri) return "";
  return uri.startsWith("ipfs://")
    ? uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
    : uri;
}

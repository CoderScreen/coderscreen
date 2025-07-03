export const getRandomColor = (seed?: string) => {
  seed = seed ?? Math.random().toString(36).substring(2, 15);

  // Simple hash function to generate a consistent seed from userId
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the hash to generate a random but consistent hex color
  const r = Math.abs(hash) % 256;
  const g = Math.abs(hash >> 8) % 256;
  const b = Math.abs(hash >> 16) % 256;

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

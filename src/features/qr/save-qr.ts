import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Writes a base64 PNG into the cache and hands it to the system share sheet,
 * which is how "save" works on both platforms without a media-library
 * permission: the user picks Save Image, Files, or anywhere else.
 */
export async function shareQRImage(base64: string, fileName: string): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) return false;

  // A stable name per payload keeps the cache from filling with duplicates.
  const file = new File(Paths.cache, `${fileName}.png`);

  try {
    if (file.exists) file.delete();
    file.create();
    file.write(base64, { encoding: 'base64' });

    await Sharing.shareAsync(file.uri, {
      mimeType: 'image/png',
      dialogTitle: fileName,
      UTI: 'public.png',
    });
    return true;
  } catch (error) {
    console.warn('[qr] could not share the QR image', error);
    return false;
  }
}

/** Filesystem-safe, collision-resistant name derived from the encoded value. */
export function qrFileName(value: string): string {
  const slug = value
    .replace(/^https?:\/\//i, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .toLowerCase();

  return `lifehub-qr-${slug || 'code'}`;
}

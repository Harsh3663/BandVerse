import type { MediaSecurityService } from "@/backend/application/ports/services";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const maxBytesByPrefix: Record<string, number> = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  audio: 30 * 1024 * 1024,
  application: 15 * 1024 * 1024,
};

const dangerousExtensions = [
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".js",
  ".php",
  ".html",
  ".htm",
  ".svg",
];

export function createMediaSecurityService(): MediaSecurityService {
  return {
    validateUpload({ mimeType, sizeBytes, originalName }) {
      const normalizedMime = mimeType.toLowerCase();
      if (!allowedMimeTypes.has(normalizedMime)) {
        return { accepted: false, reason: `MIME type ${mimeType} is not allowed.` };
      }

      const prefix = normalizedMime.split("/")[0] ?? "";
      const maxBytes = maxBytesByPrefix[prefix] ?? 0;
      if (sizeBytes > maxBytes) {
        return {
          accepted: false,
          reason: `File exceeds maximum size of ${maxBytes} bytes for ${prefix}.`,
        };
      }

      const lowerName = originalName.toLowerCase();
      if (dangerousExtensions.some((ext) => lowerName.endsWith(ext))) {
        return { accepted: false, reason: "File extension is not allowed." };
      }

      if (originalName.includes("\0") || originalName.includes("..")) {
        return { accepted: false, reason: "Unsafe file name." };
      }

      return { accepted: true };
    },
  };
}

export const mediaSecurityRecommendations = [
  "Store uploads in private object storage; serve via signed URLs.",
  "Run antivirus / malware scanning asynchronously; quarantine until clean.",
  "Strip EXIF / metadata from images where privacy requires it.",
  "Never serve user uploads from the primary application origin without CSP.",
  "Generate server-side thumbnails; do not trust client dimensions.",
] as const;

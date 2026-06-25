import { Readable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";

const PLACEHOLDER_CLOUD_NAMES = new Set([
  "upload",
  "your-cloud-name",
  "cloud-name",
  "cloudinary",
]);

function normalizeEnvValue(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim() || undefined;
  }

  return trimmed || undefined;
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: normalizeEnvValue(process.env.CLOUDINARY_CLOUD_NAME),
    api_key: normalizeEnvValue(process.env.CLOUDINARY_API_KEY),
    api_secret: normalizeEnvValue(process.env.CLOUDINARY_API_SECRET),
  });
}

export function getCloudinaryErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Cloudinary upload failed";
}

function assertCloudinaryConfig() {
  const cloudName = normalizeEnvValue(process.env.CLOUDINARY_CLOUD_NAME);
  const apiKey = normalizeEnvValue(process.env.CLOUDINARY_API_KEY);
  const apiSecret = normalizeEnvValue(process.env.CLOUDINARY_API_SECRET);

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not configured");
  }

  if (PLACEHOLDER_CLOUD_NAMES.has(cloudName.toLowerCase())) {
    throw new Error(
      'CLOUDINARY_CLOUD_NAME is set to a placeholder value. Copy your real Cloud name from Cloudinary Dashboard → API Keys (for example "dxxxxxxxx").',
    );
  }
}

export async function uploadImage(
  buffer: Buffer,
  userId: string,
): Promise<string> {
  assertCloudinaryConfig();
  configureCloudinary();

  // #region agent log
  fetch("http://127.0.0.1:7611/ingest/1a3fe879-272d-4e9c-baa6-61e06b0e357c", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "20def7",
    },
    body: JSON.stringify({
      sessionId: "20def7",
      runId: "post-fix",
      hypothesisId: "A",
      location: "cloudinary.ts:uploadImage:entry",
      message: "cloudinary upload starting",
      data: {
        cloudNameSet: !!process.env.CLOUDINARY_CLOUD_NAME,
        cloudNameLength: process.env.CLOUDINARY_CLOUD_NAME?.trim().length ?? 0,
        apiKeySet: !!process.env.CLOUDINARY_API_KEY,
        apiSecretSet: !!process.env.CLOUDINARY_API_SECRET,
        bufferLength: buffer.length,
        userIdLength: userId.length,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `trading-journal/trades/${userId}`,
        resource_type: "image",
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          // #region agent log
          fetch(
            "http://127.0.0.1:7611/ingest/1a3fe879-272d-4e9c-baa6-61e06b0e357c",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Debug-Session-Id": "20def7",
              },
              body: JSON.stringify({
                sessionId: "20def7",
                runId: "post-fix",
                hypothesisId: "B",
                location: "cloudinary.ts:uploadImage:callback",
                message: "cloudinary upload failed",
                data: {
                  errorMessage: error?.message ?? "no result",
                  errorName: error?.name ?? null,
                  httpCode:
                    (error as { http_code?: number } | undefined)?.http_code ??
                    null,
                },
                timestamp: Date.now(),
              }),
            },
          ).catch(() => {});
          // #endregion
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        // #region agent log
        fetch(
          "http://127.0.0.1:7611/ingest/1a3fe879-272d-4e9c-baa6-61e06b0e357c",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": "20def7",
            },
            body: JSON.stringify({
              sessionId: "20def7",
              runId: "post-fix",
              hypothesisId: "E",
              location: "cloudinary.ts:uploadImage:success",
              message: "cloudinary upload succeeded",
              data: {
                hasSecureUrl: !!result.secure_url,
                publicIdLength: result.public_id?.length ?? 0,
              },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion

        resolve(result.secure_url);
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

export default cloudinary;

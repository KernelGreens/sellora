import { createHash, createHmac, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type FileStorageProvider = "local" | "s3" | "cloudinary";

export type UploadResult = {
  provider: FileStorageProvider;
  url: string;
  key: string;
};

export class StorageError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "StorageError";
    this.statusCode = statusCode;
  }
}

function getFileStorageProvider(): FileStorageProvider {
  const provider = process.env.FILE_STORAGE?.trim().toLowerCase() ?? "local";

  if (provider === "local" || provider === "s3" || provider === "cloudinary") {
    return provider;
  }

  throw new StorageError(
    "Invalid FILE_STORAGE configuration. Use local, s3, or cloudinary.",
    500
  );
}

function getMaxUploadSizeBytes() {
  const rawValue = Number(process.env.MAX_UPLOAD_SIZE_MB);

  if (Number.isFinite(rawValue) && rawValue > 0) {
    return rawValue * 1024 * 1024;
  }

  return DEFAULT_MAX_UPLOAD_SIZE_BYTES;
}

function getCloudinaryUploadFolder() {
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim();

  if (folder) {
    return folder.replace(/^\/+|\/+$/g, "");
  }

  return "karacarta/product-images";
}

function getFileExtension(file: File) {
  const extensionFromName = path.extname(file.name).toLowerCase();

  if (extensionFromName) {
    return extensionFromName;
  }

  const mimeExtensions: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };

  return mimeExtensions[file.type] ?? ".bin";
}

function createObjectKey(file: File) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  return `product-images/${year}/${month}/${randomUUID()}${getFileExtension(file)}`;
}

function sha256(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function encodePathSegments(value: string) {
  return value
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new StorageError(
      "Upload a JPG, PNG, WEBP, or GIF image.",
      400
    );
  }

  if (file.size === 0) {
    throw new StorageError("Choose an image before uploading.", 400);
  }

  if (file.size > getMaxUploadSizeBytes()) {
    throw new StorageError("Image is too large for upload.", 400);
  }
}

async function uploadToLocalStorage(file: File): Promise<UploadResult> {
  const objectKey = createObjectKey(file);
  const relativePath = objectKey.replace(/^product-images\//, "");
  const targetPath = path.join(process.cwd(), "public", "uploads", relativePath);
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, buffer);

  return {
    provider: "local",
    key: objectKey,
    url: `/uploads/${relativePath}`,
  };
}

async function uploadToCloudinary(file: File): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new StorageError(
      "Cloudinary storage is selected but Cloudinary environment variables are missing.",
      500
    );
  }

  const objectKey = createObjectKey(file);
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = getCloudinaryUploadFolder();
  const publicId = objectKey.replace(/\.[^.]+$/, "");
  const signatureBase = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(signatureBase).digest("hex");
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();

  formData.append(
    "file",
    new Blob([await file.arrayBuffer()], { type: file.type }),
    file.name
  );
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("public_id", publicId);

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as
    | {
        secure_url?: string;
        public_id?: string;
        error?: {
          message?: string;
        };
      }
    | null;

  if (!response.ok || !data?.secure_url || !data.public_id) {
    throw new StorageError(
      data?.error?.message || "Cloudinary upload failed.",
      502
    );
  }

  return {
    provider: "cloudinary",
    key: data.public_id,
    url: data.secure_url,
  };
}

function buildS3RequestConfig(objectKey: string) {
  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const sessionToken = process.env.S3_SESSION_TOKEN;
  const endpoint = process.env.S3_ENDPOINT?.replace(/\/+$/, "");
  const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new StorageError(
      "S3 storage is selected but S3 environment variables are missing.",
      500
    );
  }

  const encodedKey = encodePathSegments(objectKey);

  if (endpoint) {
    const endpointUrl = new URL(endpoint);

    if (forcePathStyle) {
      const requestUrl = `${endpoint}/${bucket}/${encodedKey}`;

      return {
        bucket,
        region,
        accessKeyId,
        secretAccessKey,
        sessionToken,
        requestUrl,
        host: endpointUrl.host,
        canonicalUri: `/${bucket}/${encodedKey}`,
      };
    }

    const requestUrl = `${endpointUrl.protocol}//${bucket}.${endpointUrl.host}/${encodedKey}`;

    return {
      bucket,
      region,
      accessKeyId,
      secretAccessKey,
      sessionToken,
      requestUrl,
      host: `${bucket}.${endpointUrl.host}`,
      canonicalUri: `/${encodedKey}`,
    };
  }

  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const requestUrl = `https://${host}/${encodedKey}`;

  return {
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    sessionToken,
    requestUrl,
    host,
    canonicalUri: `/${encodedKey}`,
  };
}

async function uploadToS3Storage(file: File): Promise<UploadResult> {
  const objectKey = createObjectKey(file);
  const buffer = Buffer.from(await file.arrayBuffer());
  const {
    region,
    accessKeyId,
    secretAccessKey,
    sessionToken,
    requestUrl,
    host,
    canonicalUri,
  } = buildS3RequestConfig(objectKey);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256(buffer);
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const canonicalHeadersList = [
    `content-type:${file.type}`,
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
  ];
  const signedHeadersList = [
    "content-type",
    "host",
    "x-amz-content-sha256",
    "x-amz-date",
  ];

  if (sessionToken) {
    canonicalHeadersList.push(`x-amz-security-token:${sessionToken}`);
    signedHeadersList.push("x-amz-security-token");
  }

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    `${canonicalHeadersList.join("\n")}\n`,
    signedHeadersList.join(";"),
    payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n");

  const signingKey = hmac(
    hmac(
      hmac(hmac(`AWS4${secretAccessKey}`, dateStamp), region),
      "s3"
    ),
    "aws4_request"
  );
  const signature = createHmac("sha256", signingKey)
    .update(stringToSign)
    .digest("hex");
  const authorization = [
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeadersList.join(";")}`,
    `Signature=${signature}`,
  ].join(", ");
  const headers = new Headers({
    Authorization: authorization,
    "Content-Type": file.type,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  });

  if (sessionToken) {
    headers.set("x-amz-security-token", sessionToken);
  }

  const response = await fetch(requestUrl, {
    method: "PUT",
    headers,
    body: buffer,
  });

  if (!response.ok) {
    throw new StorageError("S3 upload failed.", 502);
  }

  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL?.replace(/\/+$/, "");

  return {
    provider: "s3",
    key: objectKey,
    url: publicBaseUrl
      ? `${publicBaseUrl}/${encodePathSegments(objectKey)}`
      : requestUrl,
  };
}

export async function uploadProductImage(file: File) {
  await validateImageFile(file);

  const provider = getFileStorageProvider();

  if (provider === "local") {
    return uploadToLocalStorage(file);
  }

  if (provider === "cloudinary") {
    return uploadToCloudinary(file);
  }

  return uploadToS3Storage(file);
}

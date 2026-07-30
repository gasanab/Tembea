export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGES_PER_REQUEST = 10;
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MAX_VERIFICATION_DOCUMENT_SIZE_BYTES = 8 * 1024 * 1024;
export const MAX_VERIFICATION_DOCUMENTS = 5;
export const ALLOWED_VERIFICATION_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;
export const VERIFICATION_DOCUMENT_ID_PREFIX = "tembea-doc:v1";

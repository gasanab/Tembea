import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from "cloudinary";
import {
  ALLOWED_VERIFICATION_DOCUMENT_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGES_PER_REQUEST,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VERIFICATION_DOCUMENT_SIZE_BYTES,
  VERIFICATION_DOCUMENT_ID_PREFIX,
} from "./uploads.constants";
import { randomUUID } from "crypto";

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private config: ConfigService) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    this.validateImage(file);
    return this.uploadValidatedImage(file);
  }

  async uploadMany(files: Express.Multer.File[]): Promise<string[]> {
    if (!files?.length) {
      throw new BadRequestException("At least one image is required");
    }
    if (files.length > MAX_IMAGES_PER_REQUEST) {
      throw new BadRequestException(
        `A maximum of ${MAX_IMAGES_PER_REQUEST} images may be uploaded at once`,
      );
    }

    // Validate the complete request before uploading any file to avoid partial
    // writes when one item is invalid.
    files.forEach((file) => this.validateImage(file));
    return Promise.all(files.map((file) => this.uploadValidatedImage(file)));
  }

  async uploadVerificationDocument(
    file: Express.Multer.File,
    partnerId: string,
  ): Promise<string> {
    const format = this.validateVerificationDocument(file);
    const folder = this.config.get<string>(
      "CLOUDINARY_UPLOAD_FOLDER",
      "tembea",
    );
    this.configureCloudinary();
    const publicId = `${folder}/verification/${partnerId}/${randomUUID()}`;

    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            type: "authenticated",
            public_id: publicId,
            overwrite: false,
            filename_override: file.originalname
              .replace(/[^A-Za-z0-9._ -]/g, "_")
              .slice(0, 120),
          },
          (
            error?: UploadApiErrorResponse,
            uploaded?: UploadApiResponse,
          ) => {
            if (error) return reject(error);
            if (!uploaded?.public_id) {
              return reject(new Error("Cloudinary returned no document ID"));
            }
            resolve(uploaded);
          },
        );
        stream.end(file.buffer);
      });

      return `${VERIFICATION_DOCUMENT_ID_PREFIX}:${format}:${result.public_id}`;
    } catch {
      this.logger.error("Cloudinary verification document upload failed");
      throw new BadGatewayException("Verification document upload failed");
    }
  }

  verificationDocumentDownloadUrl(documentId: string): string {
    const { format, publicId } = this.parseVerificationDocumentId(documentId);
    this.configureCloudinary();
    return cloudinary.utils.private_download_url(publicId, format, {
      resource_type: "raw",
      type: "authenticated",
      attachment: true,
      expires_at: Math.floor(Date.now() / 1000) + 10 * 60,
    });
  }

  private validateImage(file?: Express.Multer.File): asserts file is Express.Multer.File {
    if (!file || !Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
      throw new BadRequestException("A non-empty image file is required");
    }

    if (
      !ALLOWED_IMAGE_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
      )
    ) {
      throw new BadRequestException("Only JPEG, PNG, WebP, and GIF images are allowed");
    }

    const actualSize = file.buffer.length;
    if (actualSize > MAX_IMAGE_SIZE_BYTES || file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestException("Images must be 5 MB or smaller");
    }

    if (!this.matchesDeclaredImageType(file.mimetype, file.buffer)) {
      throw new BadRequestException("The uploaded file content is not a valid image");
    }
  }

  private matchesDeclaredImageType(mimeType: string, buffer: Buffer): boolean {
    if (mimeType === "image/jpeg") {
      return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }
    if (mimeType === "image/png") {
      return (
        buffer.length >= 8 &&
        buffer.subarray(0, 8).equals(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        )
      );
    }
    if (mimeType === "image/gif") {
      const signature = buffer.subarray(0, 6).toString("ascii");
      return signature === "GIF87a" || signature === "GIF89a";
    }
    if (mimeType === "image/webp") {
      return (
        buffer.length >= 12 &&
        buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
        buffer.subarray(8, 12).toString("ascii") === "WEBP"
      );
    }
    return false;
  }

  private validateVerificationDocument(file?: Express.Multer.File): string {
    if (!file || !Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
      throw new BadRequestException(
        "A non-empty verification document is required",
      );
    }
    if (
      !ALLOWED_VERIFICATION_DOCUMENT_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_VERIFICATION_DOCUMENT_MIME_TYPES)[number],
      )
    ) {
      throw new BadRequestException(
        "Only PDF, JPEG, and PNG verification documents are allowed",
      );
    }
    if (
      file.buffer.length > MAX_VERIFICATION_DOCUMENT_SIZE_BYTES ||
      file.size > MAX_VERIFICATION_DOCUMENT_SIZE_BYTES
    ) {
      throw new BadRequestException(
        "Verification documents must be 8 MB or smaller",
      );
    }

    const isPdf =
      file.mimetype === "application/pdf" &&
      file.buffer.subarray(0, 5).toString("ascii") === "%PDF-";
    const isJpeg =
      file.mimetype === "image/jpeg" &&
      file.buffer.length >= 3 &&
      file.buffer[0] === 0xff &&
      file.buffer[1] === 0xd8 &&
      file.buffer[2] === 0xff;
    const isPng =
      file.mimetype === "image/png" &&
      file.buffer.length >= 8 &&
      file.buffer
        .subarray(0, 8)
        .equals(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        );
    if (!isPdf && !isJpeg && !isPng) {
      throw new BadRequestException(
        "The uploaded file content does not match its declared document type",
      );
    }
    return isPdf ? "pdf" : isJpeg ? "jpg" : "png";
  }

  private parseVerificationDocumentId(documentId: string) {
    const match = documentId.match(
      /^tembea-doc:v1:(pdf|jpg|png):([A-Za-z0-9/_-]+)$/,
    );
    if (!match) {
      throw new BadRequestException("Invalid verification document ID");
    }
    return { format: match[1], publicId: match[2] };
  }

  private configureCloudinary() {
    const cloudName = this.config.get<string>("CLOUDINARY_CLOUD_NAME");
    const apiKey = this.config.get<string>("CLOUDINARY_API_KEY");
    const apiSecret = this.config.get<string>("CLOUDINARY_API_SECRET");
    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException("Upload service is not configured");
    }
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  private async uploadValidatedImage(file: Express.Multer.File): Promise<string> {
    const folder = this.config.get<string>("CLOUDINARY_UPLOAD_FOLDER", "tembea");
    this.configureCloudinary();

    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder,
            allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
            unique_filename: true,
            overwrite: false,
          },
          (
            error?: UploadApiErrorResponse,
            uploaded?: UploadApiResponse,
          ) => {
            if (error) return reject(error);
            if (!uploaded?.secure_url) {
              return reject(new Error("Cloudinary returned no secure URL"));
            }
            resolve(uploaded);
          },
        );
        stream.end(file.buffer);
      });

      return result.secure_url;
    } catch {
      this.logger.error("Cloudinary image upload failed");
      throw new BadGatewayException("Image upload failed");
    }
  }
}

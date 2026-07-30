import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { UploadsService } from "./uploads.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { VerifiedPartnerGuard } from "../../common/guards/verified-partner.guard";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGES_PER_REQUEST,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_VERIFICATION_DOCUMENT_MIME_TYPES,
  MAX_VERIFICATION_DOCUMENT_SIZE_BYTES,
} from "./uploads.constants";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { getPartnerIdOrThrow } from "../../common/utils/partner-context";

const imageFileFilter = (
  _request: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      file.mimetype as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
    )
  ) {
    return callback(
      new BadRequestException("Only JPEG, PNG, WebP, and GIF images are allowed"),
      false,
    );
  }
  callback(null, true);
};

const imageUploadOptions = {
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: MAX_IMAGES_PER_REQUEST },
  fileFilter: imageFileFilter,
};

const verificationDocumentFilter = (
  _request: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (
    !ALLOWED_VERIFICATION_DOCUMENT_MIME_TYPES.includes(
      file.mimetype as (typeof ALLOWED_VERIFICATION_DOCUMENT_MIME_TYPES)[number],
    )
  ) {
    return callback(
      new BadRequestException(
        "Only PDF, JPEG, and PNG verification documents are allowed",
      ),
      false,
    );
  }
  callback(null, true);
};

@ApiTags("uploads")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARTNER)
@Controller("uploads")
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post("image")
  @UseGuards(VerifiedPartnerGuard)
  @ApiOperation({ summary: "Upload a single image to Cloudinary" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file", imageUploadOptions))
  uploadOne(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.uploadImage(file).then((url) => ({ url }));
  }

  @Post("images")
  @UseGuards(VerifiedPartnerGuard)
  @ApiOperation({ summary: "Upload multiple images (max 10)" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FilesInterceptor("files", MAX_IMAGES_PER_REQUEST, imageUploadOptions),
  )
  uploadMany(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadsService.uploadMany(files).then((urls) => ({ urls }));
  }

  @Post("verification-document")
  @ApiOperation({
    summary: "Upload a private verification document (pending partner)",
  })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: MAX_VERIFICATION_DOCUMENT_SIZE_BYTES, files: 1 },
      fileFilter: verificationDocumentFilter,
    }),
  )
  uploadVerificationDocument(
    @CurrentUser() user,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadsService
      .uploadVerificationDocument(file, getPartnerIdOrThrow(user))
      .then((documentId) => ({ documentId }));
  }
}

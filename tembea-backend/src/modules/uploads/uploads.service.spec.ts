import { BadRequestException, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UploadsService } from "./uploads.service";

const pngBuffer = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
]);

function imageFile(
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
  return {
    fieldname: "file",
    originalname: "image.png",
    encoding: "7bit",
    mimetype: "image/png",
    size: pngBuffer.length,
    buffer: pngBuffer,
    destination: "",
    filename: "",
    path: "",
    stream: undefined as never,
    ...overrides,
  };
}

describe("UploadsService", () => {
  const config = {
    get: jest.fn().mockReturnValue(undefined),
  } as unknown as ConfigService;
  const service = new UploadsService(config);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects an empty upload", async () => {
    await expect(service.uploadImage(undefined as never)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("checks the file signature instead of trusting the declared MIME type", async () => {
    const disguisedFile = imageFile({
      buffer: Buffer.from("not an image"),
      size: 12,
    });

    await expect(service.uploadImage(disguisedFile)).rejects.toThrow(
      "uploaded file content is not a valid image",
    );
  });

  it("fails closed when Cloudinary is not configured", async () => {
    await expect(service.uploadImage(imageFile())).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it("validates every file before attempting a multi-upload", async () => {
    await expect(
      service.uploadMany([
        imageFile(),
        imageFile({ mimetype: "application/pdf" }),
      ]),
    ).rejects.toThrow("Only JPEG, PNG, WebP, and GIF images are allowed");

    expect(config.get).not.toHaveBeenCalled();
  });
});

import { PartialType, OmitType } from "@nestjs/mapped-types";
import { CreateGuideProfileDto } from "./create-guide-profile.dto";

export class UpdateGuideProfileDto extends PartialType(
  OmitType(CreateGuideProfileDto, ["listingId"] as const),
) {}

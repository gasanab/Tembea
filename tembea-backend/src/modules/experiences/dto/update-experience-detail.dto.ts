import { PartialType, OmitType } from "@nestjs/mapped-types";
import { CreateExperienceDetailDto } from "./create-experience-detail.dto";

export class UpdateExperienceDetailDto extends PartialType(
  OmitType(CreateExperienceDetailDto, ["listingId"] as const),
) {}

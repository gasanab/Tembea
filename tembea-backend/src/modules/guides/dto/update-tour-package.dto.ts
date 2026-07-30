import { PartialType, OmitType } from "@nestjs/mapped-types";
import { CreateTourPackageDto } from "./create-tour-package.dto";

export class UpdateTourPackageDto extends PartialType(
  OmitType(CreateTourPackageDto, ["guideId"] as const),
) {}

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { VerificationService } from "./verification.service";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PartnerCategory, PartnerStatus, Role } from "@prisma/client";
import {
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Matches,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class UpdatePartnerStatusDto {
  @ApiProperty({ enum: PartnerStatus })
  @IsEnum(PartnerStatus)
  status!: PartnerStatus;
}

class ApplyAsPartnerDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  businessName!: string;

  @ApiProperty({ enum: PartnerCategory })
  @IsEnum(PartnerCategory)
  category!: PartnerCategory;

  @ApiProperty({ description: "Private document IDs returned by the upload API" })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @Matches(/^tembea-doc:v1:(pdf|jpg|png):[A-Za-z0-9/_-]+$/, {
    each: true,
    message: "documents must contain private verification document IDs",
  })
  documents!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  website?: string;
}

@ApiTags("verification")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("verification")
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @Post("apply")
  @ApiOperation({ summary: "Apply to become a partner" })
  apply(@CurrentUser() user, @Body() dto: ApplyAsPartnerDto) {
    return this.verificationService.applyAsPartner(
      user.id,
      dto.businessName,
      dto.category,
      dto.documents,
      dto.phone,
      dto.website,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Get pending partner applications (admin)" })
  getPending(@Query() pagination: PaginationDto) {
    return this.verificationService.getPendingPartners(pagination);
  }

  @Get("all")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Get all partners (admin)" })
  getAll(@Query() pagination: PaginationDto) {
    return this.verificationService.getAllPartners(pagination);
  }

  @Patch(":partnerId/status")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Approve/reject/suspend a partner (admin)" })
  updateStatus(
    @Param("partnerId") partnerId: string,
    @Body() dto: UpdatePartnerStatusDto,
  ) {
    return this.verificationService.updateStatus(partnerId, dto.status);
  }

}

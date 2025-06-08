import { PartialType } from '@nestjs/mapped-types';
import { CreateHomeOfficeDto } from './create-home-office.dto';

export class UpdateHomeOfficeDto extends PartialType(CreateHomeOfficeDto) {}

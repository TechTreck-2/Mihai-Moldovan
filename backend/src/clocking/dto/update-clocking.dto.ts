import { PartialType } from '@nestjs/mapped-types';
import { CreateClockingDto } from './create-clocking.dto';

export class UpdateClockingDto extends PartialType(CreateClockingDto) {}

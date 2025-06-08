import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserPreferenceDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  preferenceName: string;

  preferenceValue: any;
}
import { IsString, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title: string;
}

export class SaveProjectDto {
  @IsString()
  content: string;
}

export class FinishProjectDto {
  @IsOptional()
  @IsString()
  reflection?: string;
}

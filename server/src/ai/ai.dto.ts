import { IsString } from 'class-validator';

export class AiAnalyzeDto {
  @IsString()
  currentText: string;

  @IsString()
  userQuery: string;
}

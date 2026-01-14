import { IsString } from 'class-validator';

export class AiAnalyzeDto {
  @IsString()
  projectId: string;

  @IsString()
  currentText: string;

  @IsString()
  userQuery: string;
}

export class GenerateMapDto {
  @IsString()
  projectId: string;

  @IsString()
  text: string;
}

export class EthicsCheckDto {
  @IsString()
  projectId: string;

  @IsString()
  text: string;
}

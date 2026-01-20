import { IsString, IsOptional, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AiAnalyzeDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsString()
  currentText: string;

  @ApiProperty()
  @IsString()
  userQuery: string;
}

export class GenerateMapDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsString()
  text: string;
}

export class EthicsCheckDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsString()
  text: string;
}

export class CitationDto {
  @ApiProperty()
  @IsString()
  topic: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;
}

export class GrammarCheckDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsString()
  text: string;
}

export class PlagiarismCheckDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsString()
  text: string;
}

export class DevilsAdvocateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false, type: [Object] })
  @IsOptional()
  @IsArray()
  chatHistory?: any[];
}

export class SimpleTextCheckDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class CitationSuggestionsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}

import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEnum, 
  MinLength, 
  MaxLength 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AIEditSuggestionDto {
  @ApiProperty({
    description: 'Type of edit suggestion',
    enum: ['grammar', 'style', 'content'],
  })
  @IsEnum(['grammar', 'style', 'content'])
  type: 'grammar' | 'style' | 'content';

  @ApiProperty({
    description: 'Original text that needs editing',
  })
  @IsString()
  @IsNotEmpty()
  original: string;

  @ApiProperty({
    description: 'Suggested replacement text',
  })
  @IsString()
  @IsNotEmpty()
  suggestion: string;

  @ApiProperty({
    description: 'Position of the text to edit',
  })
  start: number;

  @ApiProperty({
    description: 'End position of the text to edit',
  })
  end: number;

  @ApiProperty({
    description: 'Explanation of why this edit is suggested',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiProperty({
    description: 'Project ID where edit is suggested',
  })
  @IsString()
  @IsOptional()
  projectId?: string;
}

export class ApplyEditDto {
  @ApiProperty({
    description: 'Suggestion ID to apply',
  })
  @IsString()
  @IsNotEmpty()
  suggestionId: string;

  @ApiProperty({
    description: 'Whether user accepts the suggestion',
  })
  @IsEnum(['accept', 'reject'])
  @IsNotEmpty()
  action: 'accept' | 'reject';
}

export class ContextualChatDto {
  @ApiProperty({
    description: 'Chat message',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Project ID for context-aware chat (optional)',
  })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({
    description: 'Chat mode: general or project-specific',
    enum: ['general', 'project-specific'],
  })
  @IsEnum(['general', 'project-specific'])
  @IsOptional()
  mode?: 'general' | 'project-specific';
}

export class UserDetectionDto {
  @ApiProperty({
    description: 'Project ID for context',
  })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({
    description: 'Current user text being typed',
    maxLength: 10000,
  })
  @IsString()
  @IsNotEmpty()
  currentText: string;

  @ApiProperty({
    description: 'Typing pattern to analyze',
  })
  @IsString()
  @IsOptional()
  pattern?: string;
}
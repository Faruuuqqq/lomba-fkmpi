import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SavePaperDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    url: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    projectId?: string;

    @ApiProperty({ required: false })
    @IsObject()
    @IsOptional()
    metadata?: any;
}

export class GetPapersQueryDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    projectId?: string;
}

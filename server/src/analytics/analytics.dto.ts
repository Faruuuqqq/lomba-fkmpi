import { IsString, IsNumber, IsOptional, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogAnalyticsDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    userId?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    feature: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    duration: number;

    @ApiProperty({ required: false })
    @IsObject()
    @IsOptional()
    metadata?: any;
}

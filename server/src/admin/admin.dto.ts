import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export class UpdateUserRoleDto {
    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
}

export class UpdateConfigurationDto {
    @ApiProperty()
    @IsObject()
    @IsNotEmpty()
    config: any;
}

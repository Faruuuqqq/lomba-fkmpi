import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitChallengeDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    challengeId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    answerIndex: number;
}

export class CheckBalanceDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    cost: number;
}

export class RewardWritingDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    wordCount: number;
}

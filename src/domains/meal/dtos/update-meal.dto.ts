import {IsString, IsNumberString, MaxLength, IsNumber, ValidateNested} from 'class-validator';
import {Type} from 'class-transformer';
import {UpdateMealSubsectionDto} from '@letseat/domains/meal/dtos/update-meal-subsection.dto';

export class UpdateMealDto {
	@IsString()
	@MaxLength(16)
	readonly reference?: string;

	@IsString()
	readonly name?: string;

	@IsString()
	readonly description?: string;

	@IsNumberString()
	readonly price?: number;

	@IsNumber()
	readonly productQuantity?: number;

	@ValidateNested()
	@Type(() => UpdateMealSubsectionDto)
	subsections?: UpdateMealSubsectionDto[];
}

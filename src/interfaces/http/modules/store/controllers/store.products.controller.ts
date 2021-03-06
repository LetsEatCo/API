import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	FileInterceptor,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Req,
	UnauthorizedException, UploadedFile,
	UseGuards,
	UseInterceptors
} from '@nestjs/common';
import {CommandBus} from '@nestjs/cqrs';
import {ValidationPipe} from '@letseat/domains/common/pipes/validation.pipe';
import {CreateProductDto} from '@letseat/domains/product/dtos/create-product.dto';
import {Product} from '@letseat/domains/product/product.entity';
import {
	createProductValidatorOptions,
	updateProductValidatorOptions
} from '@letseat/domains/product/pipes/product-validator-pipe-options';
import {AuthEntities} from '@letseat/infrastructure/authorization/enums/auth.entites';
import {AuthGuard} from '@letseat/infrastructure/authorization/guards';
import {
	CreateProductCommand,
	UpdateProductCommand,
	DeleteProductCommand,
	SaveProductPictureUrlCommand
} from '@letseat/application/commands/product';
import {
	GetStoreProductByUuidQuery,
	GetStoreProductsQuery
} from '@letseat/application/queries/store';
import {isUuid} from '@letseat/shared/utils';
import {UpdateProductDto} from '@letseat/domains/product/dtos/update-product.dto';
import {AWSService} from '@letseat/infrastructure/services/aws.service';

@Controller('stores/me/products')
export class CurrentStoreProductsController {
	constructor(private readonly commandBus: CommandBus, private readonly awsService: AWSService) {
	}

	@Post()
	@UseGuards(AuthGuard('jwt'))
	public async createProduct(
		@Req() request: any,
		@Body(new ValidationPipe<Product>(createProductValidatorOptions))
			product: CreateProductDto): Promise<any> {
		return request.user.entity === AuthEntities.Store
			? this.commandBus.execute(new CreateProductCommand(request.user.uuid, product))
			: (() => {
				throw new UnauthorizedException();
			})();
	}

	@Get()
	@UseGuards(AuthGuard('jwt'))
	public async getProducts(@Req() request: any): Promise<any> {
		return request.user.entity === AuthEntities.Store
			? this.commandBus.execute(new GetStoreProductsQuery(request.user.uuid))
			: (() => {
				throw new UnauthorizedException();
			})();
	}

	@Get(':productUuid')
	@UseGuards(AuthGuard('jwt'))
	public async getStoreProductByUuid(
		@Req() request: any,
		@Param('productUuid') productUuid: string
	) {
		return isUuid(productUuid)
			? this.commandBus.execute(new GetStoreProductByUuidQuery(request.user.uuid, productUuid))
			: (() => {
				throw new BadRequestException();
			})();
	}

	@Patch(':uuid')
	@HttpCode(204)
	@UseGuards(AuthGuard('jwt'))
	public async updateProduct(
		@Req() request: any,
		@Body(new ValidationPipe<Product>(updateProductValidatorOptions)) product: UpdateProductDto,
		@Param('uuid') uuid: string): Promise<any> {
		return request.user.entity === AuthEntities.Store && isUuid(uuid)
			? this.commandBus.execute(new UpdateProductCommand(request.user.uuid, uuid, product))
			: (() => {
				throw new UnauthorizedException();
			})();
	}

	@Delete(':uuid')
	@HttpCode(204)
	@UseGuards(AuthGuard('jwt'))
	public async deleteProduct(
		@Req() request: any,
		@Param('uuid') uuid: string): Promise<any> {
		return request.user.entity === AuthEntities.Store && isUuid(uuid)
			? this.commandBus.execute(new DeleteProductCommand(request.user.uuid, uuid))
			: (() => {
				throw new UnauthorizedException();
			})();
	}

	@Post(':uuid/picture')
	@UseInterceptors(FileInterceptor('file'))
	@UseGuards(AuthGuard('jwt'))
	public async uploadMealPicture(
		@Req() request: any,
		@Param('uuid') uuid: string,
		@UploadedFile() file) {
		if (request.user.entity !== AuthEntities.Store) {
			(() => {
				throw new UnauthorizedException();
			})();
		}
		if (!file) {
			(() => {
				throw new BadRequestException('No file uploaded');
			})();
		}
		const uploadImagePromise = this.awsService.uploadImage(file, `lets-eat-co/stores/${request.user.uuid}`, uuid);
		return uploadImagePromise.then(async fileData => {
			return this.commandBus.execute(new SaveProductPictureUrlCommand(request.user.uuid, uuid, fileData.Location));
		}).catch(err => console.log(err));
	}
}

@Controller('stores')
export class StoreProductsController {
	constructor(private readonly commandBus: CommandBus) {
	}

	@Get(':storeUuid/products')
	public async getStoreProducts(
		@Param('storeUuid') storeUuid: string) {
		return isUuid(storeUuid)
			? this.commandBus.execute(new GetStoreProductsQuery(storeUuid, true))
			: (() => {
				throw new BadRequestException();
			})();
	}

	@Get(':storeUuid/products/:productUuid')
	public async getStoreProductByUuid(
		@Param('storeUuid') storeUuid: string,
		@Param('productUuid') productUuid: string) {
		return isUuid(storeUuid) && isUuid(productUuid)
			? this.commandBus.execute(new GetStoreProductByUuidQuery(storeUuid, productUuid, true))
			: (() => {
				throw new BadRequestException();
			})();
	}

}

/* tslint:disable */
import {
	EntityRepository,
	Repository,
	Transaction,
	TransactionManager, createQueryBuilder, getManager, getCustomRepository,
} from 'typeorm';
import {ResourceRepository} from '@letseat/infrastructure/repository/resource.repository';
import {omitDeep} from '@letseat/shared/utils';
import {Ingredient} from '@letseat/domains/ingredient/ingredient.entity';
import {Product} from '@letseat/domains/product/product.entity';
import {ProductIngredient} from '@letseat/domains/product-ingredient/product-ingredient.entity';
import {CreateProductDto} from '@letseat/domains/product/dtos';
import {UpdateProductDto} from "@letseat/domains/product/dtos/update-product.dto";
import {IngredientRepository} from "@letseat/infrastructure/repository/ingredient.repository";

@EntityRepository(ProductIngredient)
export class ProductIngredientRepository extends Repository<ProductIngredient> implements ResourceRepository {
	@Transaction()

	public async findOneByUuid(productIngredientUuid: string, selectId: boolean = false) {
		const productIngredient = await this.findOne({where: {uuid: productIngredientUuid}}) as ProductIngredient;
		return selectId ? productIngredient : omitDeep('id', productIngredient);
	}

	@Transaction()
	public async saveStoreProductIngredients(
		storeUuid: string,
		product: CreateProductDto & Product,
		@TransactionManager() productIngredientRepository: Repository<ProductIngredient>) {
		const savedProduct = await getManager()
			.findOne(Product, {where: {id: product.id}}) as Product;
		product.ingredients.forEach(async (productIng) => {
			const productIngredient = new ProductIngredient();
			const ingredient = await createQueryBuilder(Ingredient, 'ingredient')
				.leftJoinAndSelect('ingredient.store', 'store')
				.where('store.uuid = :storeUuid and ingredient.uuid = :ingredientUuid', {storeUuid, ingredientUuid: productIng.ingredientUuid})
				.getOne() as Ingredient;
			productIngredient.quantity = productIng.quantity;
			productIngredient.product = savedProduct;
			productIngredient.ingredient = ingredient;
			await this.save(productIngredient);
		});
		return
	}

	@Transaction()
	public async updateStoreProductIngredients(
		storeUuid: string,
		productFoundCandidate: Product,
		product: UpdateProductDto | any,
		@TransactionManager() productIngredientRepository: Repository<ProductIngredient>) {

		const ingredientRepository = getCustomRepository(IngredientRepository);

		product.ingredients.forEach(async (productIng) => {

			const ingredientFound = await ingredientRepository.findStoreIngredientByUuid(storeUuid, productIng.ingredientUuid,true);

			if(productIng.quantity && ingredientFound){

				const productIngredientFound = await this.getProductIngredient(productFoundCandidate.id,ingredientFound.id);

				if((Object.keys(productIngredientFound).length !== 0)){
					return await this.updateProductIngredient(productFoundCandidate.id, ingredientFound.id, productIng.quantity);
				}else{

					let newProductIngredient = new ProductIngredient();
					newProductIngredient.quantity = productIng.quantity;
					newProductIngredient.ingredient = ingredientFound;
					newProductIngredient.product = productFoundCandidate;
					return this.save(newProductIngredient);
				}

			}
		});
		return;
	}

	public async productIngredientBelongsToStore(storeUuid: string, productIngredientUuid: string) {
		const store = await createQueryBuilder(ProductIngredient, 'productIngredient')
			.select('store')
			.where('productIngredient.uuid = :uuid', {uuid: productIngredientUuid})
			.leftJoin('productIngredient.product', 'product')
			.leftJoin('product.store', 'store')
			.getRawOne();
		return store.store_uuid === storeUuid;
	}

	public async updateProductIngredient(idProduct: number, idIngredient: number, quantity: number){

		return await createQueryBuilder(ProductIngredient, 'productIngredient')
			.leftJoinAndSelect('productIngredient.product', 'product')
			.leftJoinAndSelect('productIngredient.ingredient','ingredient')
			.where('product.id = :idProduct and ingredient.id = :idIngredient', {idProduct, idIngredient})
			.update(ProductIngredient)
			.set({quantity})
			.execute();

	}

	public async getProductIngredient(idProduct: number, idIngredient: number){

		return await createQueryBuilder(ProductIngredient, 'productIngredient')
			.leftJoinAndSelect('productIngredient.product', 'product')
			.leftJoinAndSelect('productIngredient.ingredient','ingredient')
			.where('product.id = :idProduct and ingredient.id = :idIngredient', {idProduct, idIngredient})
			.execute();
	}
}

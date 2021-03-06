import {StoreController} from './store.controller';
import {StoreKiosksController} from './store-kiosks.controller';
import {StoreVouchersController} from './store.vouchers.controller';
import {CurrentStoreIngredientsController, StoreIngredientsController} from './store-ingredients.controller';
import {CurrentStoreProductsController, StoreProductsController} from './store.products.controller';
import {CurrentStoreMealsController} from './store.meals.controller';
import {CurrentStoreSectionsController} from '@letseat/interfaces/http/modules/store/controllers/store.sections.controller';
import {CurrentStoreOrdersController} from '@letseat/interfaces/http/modules/store/controllers/store.orders.controller';

export const StoreControllers = [
	StoreController,
	StoreKiosksController,
	StoreVouchersController,
	CurrentStoreIngredientsController,
	StoreIngredientsController,
	CurrentStoreProductsController,
	StoreProductsController,
	CurrentStoreMealsController,
	CurrentStoreSectionsController,
	CurrentStoreOrdersController
];
export {
	StoreController,
	StoreKiosksController,
	StoreVouchersController,
	CurrentStoreIngredientsController,
	StoreIngredientsController,
	CurrentStoreProductsController,
	StoreProductsController,
	CurrentStoreMealsController,
	CurrentStoreSectionsController,
	CurrentStoreOrdersController
};

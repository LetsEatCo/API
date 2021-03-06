import {Entity, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany} from 'typeorm';
import {Resource} from '@letseat/domains/resource/resource';
import {Store} from '@letseat/domains/store/store.entity';
import {Product} from '@letseat/domains/product/product.entity';
import {MealSubsection} from '@letseat/domains/meal/meal-subsection.entity';
import {Section} from '@letseat/domains/section/section.entity';

@Entity()
export class Meal extends Resource {
	constructor(args?: any) {
		super();
		return Object.assign(this, args);
	}

	@Column({length: 16})
	reference: string;

	@Column({length: 128})
	name: string;

	@Column('text', {nullable: true})
	description: string;

	@Column('decimal', {precision: 10, scale: 2, unsigned: true})
	price: number;

	@Column({name: 'image_url', length: 256, nullable: true})
	imageUrl?: string;

	@Column('smallint', {default: 1, name: 'product_quantity', unsigned: true})
	productQuantity: number;

	@ManyToOne(() => Store, store => store.meals, {nullable: false, cascade: ['insert'], onDelete: 'CASCADE'})
	@JoinColumn({name: 'id_store'})
	store: Store;

	@ManyToOne(() => Product, product => product.meals, {nullable: false, cascade: ['insert'], onDelete: 'CASCADE'})
	@JoinColumn({name: 'id_product'})
	product: Product;

	@OneToMany(() => MealSubsection, subsection => subsection.meal, {nullable: false, cascade: ['insert']})
	subsections: MealSubsection[];

	@ManyToMany(() => Section, section => section.meals)
	sections: Section[];

	public static register(args: any): Meal {
		return new Meal(args);
	}
}

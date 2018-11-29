import {EntityRepository, Repository} from 'typeorm';
import {Voucher} from '@letseat/domains/voucher/voucher.entity';
import {ResourceRepository} from '@letseat/infrastructure/repository/resource.repository';
import {CreateVoucherDto} from '@letseat/domains/voucher/dtos';
import {Store} from '@letseat/domains/store/store.entity';

@EntityRepository(Voucher)
export class VoucherRepository extends Repository<Voucher> implements ResourceRepository {
	public async findOneByUuid(voucherUuid: string) {
		return this.findOne({where: {uuid: voucherUuid}});
	}

	public async findVoucherByCode(voucherCode: string) {
		return this.findOne({where: {code: voucherCode}});
	}

	public async createVoucher(store: Store, voucher: CreateVoucherDto) {
		const newVoucher = new Voucher(voucher);
		newVoucher.store = store;
		return this.save(newVoucher);
	}

	public async deleteVoucherByUuid(storeUuid: string, voucherUuid: string) {
		return this.createQueryBuilder('voucher')
			.leftJoinAndSelect('voucher.store', 'store')
			.where('store.uuid = :storeUuid', {storeUuid})
			.where('voucher.uuid = :voucherUuid', {voucherUuid})
			.delete()
			.execute();

	}

	public async findStoreVoucherByUuid(storeUuid: string, voucherUuid: string) {
		return this.createQueryBuilder('voucher')
			.leftJoinAndSelect('voucher.store', 'store')
			.where('store.uuid = :storeUuid AND voucher.uuid = :voucherUuid', {storeUuid, voucherUuid})
			.getOne();
	}

	public async isStillValid(voucherCode: string) {
		const voucher = await this.findVoucherByCode(voucherCode) as Voucher;
		const now = new Date();

		return now.getDate() < voucher.expirationDate.getDate();
	}
}
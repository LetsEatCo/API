import request from 'supertest';
import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {StoreKiosksController} from '../controllers';
import * as mocks from './mocks';
import {getRepositoryToken} from '@nestjs/typeorm';
import {AuthService} from '@letseat/infrastructure/authorization';
import {CommandBus, CQRSModule} from '@nestjs/cqrs';
import {Store} from '@letseat/domains/store/store.entity';
import {JwtStrategy} from '@letseat/infrastructure/authorization/strategies/jwt.strategy';
import {CustomExceptionFilter} from '@letseat/domains/common/exceptions';
import {LoggerService} from '@letseat/infrastructure/services';

describe('Store HTTP Requests', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [
				StoreKiosksController
			],
			providers: [
				CQRSModule,
				AuthService,
				CommandBus,
				{
					provide: getRepositoryToken(Store),
					useValue: mocks.storeRepository,
				},
			]
		})
			.overrideProvider(AuthService).useValue(mocks.authService)
			.overrideProvider(CommandBus).useValue({
				register: jest.fn(),
				execute: jest.fn()
			})
			.overrideProvider(JwtStrategy).useClass(mocks.JwtStrategyMock)
			.compile();

		app = module.createNestApplication();
		app.useGlobalFilters(new CustomExceptionFilter());
		const logger = new LoggerService('Server');
		app.useLogger(logger);
		await app.init();
	});

	describe('POST /me/kiosks', () => {
		it('should return a HTTP 201 status code when successful', () => {
			return request(app.getHttpServer())
				.post('/stores/me/kiosks')
				.set('Authorization', `Bearer ${mocks.token}`)
				.send({serialNumber: '2X0NFW-E6M36H-AAFLPC-GPS81M'})
				.expect(201);
		});

		it('should return a HTTP 401 status code when no JWT is present in Authorization header', () => {
			return request(app.getHttpServer())
				.post('/stores/me/kiosks')
				.send({serial: '2X0NFW-E6M36H-AAFLPC-GPS81M'})
				.expect(401);
		});

		it('should return a HTTP 400 status code when incorrect data is sent', () => {
			return request(app.getHttpServer())
				.post('/stores/me/kiosks')
				.set('Authorization', `Bearer ${mocks.token}`)
				.send({serial: '2X0NFW-E6M36H-AAFLPC-GPS81M'})
				.expect(400);
		});
	});

	afterAll(async () => {
		await app.close();
	});
});

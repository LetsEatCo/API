import jwt from 'jsonwebtoken';
import {Injectable} from '@nestjs/common';
import {JwtPayload} from '../interfaces';
import config from 'config';

@Injectable()
export class AuthService {
	public static createToken<T extends any>(resource: T): JwtPayload {
		const payload = {uuid: resource.uuid, email: resource.email};
		let expiresIn: any = '7d';
		const accessToken = jwt.sign(payload, config.get('jwtSecret'), {expiresIn});
		expiresIn = new Date();
		expiresIn.setDate(expiresIn.getDate() as number + 7);
		return {
			iat: Date.now(),
			exp: expiresIn.getTime(),
			jwt: accessToken
		};
	}
}
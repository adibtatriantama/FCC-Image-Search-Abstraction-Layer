import { ERROR_NOT_FOUND, ERROR_UNKNOWN } from '$lib/server/constant';
import { onetable, type ImageType } from '$lib/server/database/onetable';
import type { ImageDto } from '$lib/dto/image.dto';
import type { QueryDto } from '$lib/dto/query.dto';
import type { Model } from 'dynamodb-onetable';
import type { ImageRepo } from '../imageRepo';

const ONE_WEEK_IN_MILLISECOND = 7 * 24 * 60 * 60 * 1000;

export class DynamoDbImageRepo implements ImageRepo {
	private imageModel: Model<ImageType>;

	constructor() {
		this.imageModel = onetable.getModel<ImageType>('Image');
	}

	async findImages(query: QueryDto): Promise<ImageDto[]> {
		try {
			const result = await this.imageModel.get({ ...query });

			if (result) {
				return result.images;
			} else {
				throw new Error();
			}
		} catch (error) {
			throw new Error(ERROR_NOT_FOUND);
		}
	}

	async saveImages(query: QueryDto, images: ImageDto[]): Promise<void> {
		try {
			await this.imageModel.create(
				{
					expireAt: new Date(Date.now() + ONE_WEEK_IN_MILLISECOND),
					images,
					...query
				},
				{ exists: true }
			);
		} catch (error) {
			throw new Error(ERROR_UNKNOWN);
		}
	}
}

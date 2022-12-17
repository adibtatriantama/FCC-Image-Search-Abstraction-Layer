import type { ImageDto } from '../../dto/image.dto';
import type { QueryDto } from '../../dto/query.dto';

export interface ImageRepo {
	findImages(query: QueryDto): Promise<ImageDto[]>;

	saveImages(query: QueryDto, images: ImageDto[]): Promise<void>;
}

import type { ImageDto } from '../../dto/image.dto';
import type { QueryDto } from '../../dto/query.dto';

export interface ImageSearchService {
	searchImage(query: QueryDto): Promise<ImageDto[]>;
}

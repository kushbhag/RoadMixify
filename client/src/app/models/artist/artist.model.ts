import { Image } from '../image.model';

export class Artist {
    href: string;
    id: string;
    images: Image[];
    name: string;
    uri: string;
}
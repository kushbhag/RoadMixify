import { Image } from './image.model';

export class User {
    display_name: string;
    followers: number;
    href: string;
    id: string;
    images: Image[];
    type: string;
    uri: string;

    access_token: string;
    refresh_token: string;
}
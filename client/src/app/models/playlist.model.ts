import { Image } from './image.model';
import { PagingObject } from './paging-object.model';
import { User } from './user.model';

export class Playlist {
    collaborative: boolean;
    description: string;
    href: string;
    id: string;
    images: Image[];
    name: string;
    owner: User;
    public: boolean;
    tracks: PagingObject;
    uri: string;
}
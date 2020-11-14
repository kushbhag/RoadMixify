import { Album } from './album/album.model';

export class Albums {
    constructor(albums: Album[]) {
        this.albums = albums;
    }
    albums: Album[];
}
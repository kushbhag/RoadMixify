import { Artist } from '../artist/artist.model';
import { Image } from '../image.model';
import { PagingObject } from '../paging-object.model';


export class Album {
    album_group: string;
    album_type: string; // Album, single or compilation
    artists: Artist[];
    available_markets: string[];
    href: string;
    id: string;
    images: Image[];
    name: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
    tracks: PagingObject;
    type: string;
    uri: string;
}
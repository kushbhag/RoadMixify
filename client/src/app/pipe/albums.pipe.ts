import { Pipe, PipeTransform } from '@angular/core';
import { Album } from '../models/album/album.model';

@Pipe({
    name: 'albumsOnly'
})
export class AlbumOnlyPipe implements PipeTransform {
    
    transform(value: Album[]) {
        let setNames = new Set<string>();
        let albums = value.filter(album => album.album_group === 'album');
        let finalAlbums = Array<Album>();
        for (let alb of albums) {
            if (!setNames.has(alb.name)) {
                setNames.add(alb.name);
                finalAlbums.push(alb);
            }
        }
        return finalAlbums;
    }
}
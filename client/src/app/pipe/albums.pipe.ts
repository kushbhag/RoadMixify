import { Pipe, PipeTransform } from '@angular/core';
import { Album } from '../models/album/album.model';

@Pipe({
    name: 'albumsOnly'
})
export class AlbumOnlyPipe implements PipeTransform {
    transform(value: Album[]) {
        return [... new Set<string>(value
                        .filter(album => album.album_group === 'album')
                        .map(album => album.name))];
    }
}
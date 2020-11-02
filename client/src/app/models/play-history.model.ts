import { Timestamp } from 'rxjs';
import { Track } from './track.model';

export class PlayHistory {
    track: Track;
    played_at: Date;
}
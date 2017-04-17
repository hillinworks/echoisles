export enum NoteConnection {
    None = 0,
    Slide = 1,
    SlideInFromHigher = 2,
    SlideInFromLower = 3,
    SlideOutToHigher = 4,
    SlideOutToLower = 5,
    Hammer = 6,
    Pull = 7
}

export module NoteConnection {


    export type PostBeatType = NoteConnection.None | NoteConnection.SlideOutToHigher | NoteConnection.SlideOutToLower;
    export type PreBeatType = NoteConnection.None | NoteConnection.SlideInFromHigher | NoteConnection.SlideInFromLower;

    export type PostNoteType = NoteConnection.None | NoteConnection.SlideOutToHigher | NoteConnection.SlideOutToLower;
    export type PreNoteType = NoteConnection.None | NoteConnection.Slide | NoteConnection.SlideInFromHigher | NoteConnection.SlideInFromLower | NoteConnection.Hammer | NoteConnection.Pull;

    export function toNoteConnection(connection: PreBeatType | PostBeatType | PreNoteType | PostNoteType): NoteConnection {
        return connection as NoteConnection;
    }
}
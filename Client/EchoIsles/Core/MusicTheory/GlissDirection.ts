import { NoteConnection } from "./String/NoteConnection";

export enum GlissDirection {
    FromHigher = NoteConnection.SlideInFromHigher as number,
    FromLower = NoteConnection.SlideInFromLower as number,
    ToHigher = NoteConnection.SlideOutToHigher as number,
    ToLower = NoteConnection.SlideOutToLower as number
}

export module GlissDirection {
    export function toNoteConnection(direction: GlissDirection): NoteConnection {
        return direction as number as NoteConnection;
    }
}
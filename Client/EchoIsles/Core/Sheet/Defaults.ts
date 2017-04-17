import { Tempo } from "../MusicTheory/Tempo";
import { Time } from "../MusicTheory/Time";

export module Defaults {
    export const tempo = new Tempo(72);
    export const time = Time.T44;
    export const maxSpeed = 10000;
}
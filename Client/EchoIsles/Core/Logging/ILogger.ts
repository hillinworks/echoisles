import { LogLevel } from "./LogLevel";
import { TextRange } from "../Parsing/TextRange";

export interface ILogger {
    report(level: LogLevel, position: TextRange | undefined, message: string, ...args: any[]): void;
}
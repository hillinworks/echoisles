import { LogLevel } from "./LogLevel";
import { TextRange } from "../Parsing/TextRange";
import { StringUtilities } from "../Utilities/StringUtilities";

export class LogMessage {

    static hint(range: TextRange, message: string, ...args: any[]): LogMessage {
        return new LogMessage(LogLevel.Hint, range, message, ...args);
    }

    static suggestion(range: TextRange, message: string, ...args: any[]): LogMessage {
        return new LogMessage(LogLevel.Suggestion, range, message, ...args);
    }

    static warning(range: TextRange, message: string, ...args: any[]): LogMessage {
        return new LogMessage(LogLevel.Warning, range, message, ...args);
    }

    static error(range: TextRange, message: string, ...args: any[]): LogMessage {
        return new LogMessage(LogLevel.Error, range, message, ...args);
    }

    level: LogLevel;
    range: TextRange;
    message: string;

    constructor(level: LogLevel, range: TextRange, message: string, ...args: any[]) {
        this.level = level;
        this.range = range;
        this.message = StringUtilities.formatString(message, ...args);
    }
}
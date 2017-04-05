import { LogLevel } from "./LogLevel";
import { TextRange } from "../Parsing/TextRange";
import { StringUtilities } from "../Utilities/StringUtilities";

export class LogMessage {

    static hint(range: TextRange | undefined, message: string, ...args: any[]): LogMessage {
        return new LogMessage(LogLevel.Hint, range, message, ...args);
    }

    static suggestion(range: TextRange | undefined, message: string, ...args: any[]): LogMessage {
        return new LogMessage(LogLevel.Suggestion, range, message, ...args);
    }

    static warning(range: TextRange | undefined, message: string, ...args: any[]): LogMessage {
        return new LogMessage(LogLevel.Warning, range, message, ...args);
    }

    static error(range: TextRange | undefined, message: string, ...args: any[]): LogMessage {
        return new LogMessage(LogLevel.Error, range, message, ...args);
    }

    readonly message: string;

    constructor(readonly level: LogLevel, readonly range: TextRange | undefined, message: string, ...args: any[]) {
        this.message = StringUtilities.formatString(message, ...args);
    }
}
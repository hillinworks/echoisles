import { LogLevel } from "./LogLevel";
import { TextRange } from "../Parsing/TextRange";
import { StringUtilities } from "../Utilities/StringUtilities";
import { StringBuilder } from "../Utilities/StringBuilder";

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

    toString(): string {
        const builder = new StringBuilder();
        builder.append("[");
        switch (this.level) {
            case LogLevel.Error:
                builder.append("ERRO"); break;
            case LogLevel.Hint:
                builder.append("HINT"); break;
            case LogLevel.Suggestion:
                builder.append("SUGG"); break;
            case LogLevel.Warning:
                builder.append("WARN"); break;
        }
        builder.append("]");

        if (this.range) {
            builder.append(this.range.toString());
        }

        builder.append(" ");
        builder.append(this.message);

        return builder.toString();
    }
}
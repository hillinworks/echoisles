import { LogMessage } from "../Core/Logging/LogMessage";
import { TextRange } from "../Core/Parsing/TextRange";
import { LogLevel } from "../Core/Logging/LogLevel";
const emptyMessageArray = new Array<LogMessage>();

export enum ParseResultType {
    Success,
    Empty,
    Failed
}

interface IMessageContainer {
    readonly messages: LogMessage[];
}

export interface IParseResult<T> extends IMessageContainer {
    result: ParseResultType;
    value?: T;
}

export class ParseResult<T> implements IParseResult<T> {

    result: ParseResultType;
    value?: T;
    readonly messages: LogMessage[];

    constructor(result: ParseResultType, value?: T, messages?: LogMessage[]) {
        this.result = result;
        this.value = value;
        this.messages = messages || new Array<LogMessage>();
    }

    get isSuccessful(): boolean {
        return this.result === ParseResultType.Success;
    }

    appendMessages(from: IMessageContainer | LogMessage[]) {
        if (from.constructor === Array) {
            this.messages.push(...(from as LogMessage[]));
        } else {
            this.messages.push(...(from as IMessageContainer).messages);
        }
    }
}

export class ParseHelper {

    static success<T>(value: T, ...messages: LogMessage[]) {
        return new ParseResult<T>(ParseResultType.Success, value, messages);
    }

    static empty(...messages: LogMessage[]) {
        return {
            result: ParseResultType.Empty,
            messages: messages
        };
    }

    static fail(range?: TextRange, message?: string, ...args: any[]) {
        return {
            result: ParseResultType.Failed,
            messages: range ? [LogMessage.error(range!, message!, ...args)] : emptyMessageArray
        };
    }

    static isSuccessful(result: { result: ParseResultType }): boolean {
        return result.result === ParseResultType.Success;
    }

    /**
     * relay a parse result's result and messages, but omit its value
     * @param result the parse result to relay
     */
    static relayState<T>(result: IParseResult<T>) {
        return {
            result: result.result,
            messages: result.messages
        };
    }

    private readonly messages = new Array<LogMessage>();

    success<T>(value: T) {
        return new ParseResult<T>(ParseResultType.Success, value, this.messages);
    }

    fail(range?: TextRange, message?: string, ...args: any[]) {
        if (range) {
            this.error(range!, message!, ...args);
        }

        return {
            result: ParseResultType.Failed,
            messages: this.messages
        };
    }

    relay<T>(result: IParseResult<T>) {
        return {
            result: result.result,
            value: result.value,
            messages: this.messages.concat(result.messages)
        };
    }

    relayFailure(messageContainer: IMessageContainer) {
        this.messages.push(...messageContainer.messages);
        return this.fail();
    }

    empty() {
        return {
            result: ParseResultType.Empty,
            messages: this.messages
        };
    }

    hint(range: TextRange, message: string, ...args: any[]): void {
        this.messages.push(new LogMessage(LogLevel.Hint, range, message, ...args));
    }

    suggestion(range: TextRange, message: string, ...args: any[]): void {
        this.messages.push(new LogMessage(LogLevel.Suggestion, range, message, ...args));
    }

    warning(range: TextRange, message: string, ...args: any[]): void {
        this.messages.push(new LogMessage(LogLevel.Warning, range, message, ...args));
    }

    error(range: TextRange, message: string, ...args: any[]): void {
        this.messages.push(new LogMessage(LogLevel.Error, range, message, ...args));
    }

    absorb<T>(result: IParseResult<T>): IParseResult<T> {
        this.messages.push(...result.messages);
        return result;
    }
}
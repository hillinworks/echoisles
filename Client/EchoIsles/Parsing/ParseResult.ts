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

export interface IParseSuccessResult<T> extends IMessageContainer {
    readonly result: ParseResultType.Success;
    readonly value: T;
}

export interface IParseEmptyResult extends IMessageContainer {
    readonly result: ParseResultType.Empty;
    readonly value: undefined;
}

export interface IParseFailedResult extends IMessageContainer {
    readonly result: ParseResultType.Failed;
}

export type ParseNonSuccessfulResult = IParseFailedResult | IParseEmptyResult;

export type ParseResult<T> = IParseSuccessResult<T> | IParseFailedResult;
export type ParseResultMaybeEmpty<T> = ParseResult<T> | IParseEmptyResult;
export type ParseSuccessOrEmptyResult<T> = IParseSuccessResult<T> | IParseEmptyResult;

export class ParseHelper {

    static readonly voidSuccess: IParseSuccessResult<void> = {
        result: ParseResultType.Success,
        value: undefined,
        messages: new Array<LogMessage>(0)
    };

    static success<T>(value: T, ...messages: LogMessage[]): IParseSuccessResult<T> {
        return {
            result: ParseResultType.Success,
            value: value,
            messages: messages
        };
    }

    static assert<T>(result: ParseResultMaybeEmpty<T>): IParseSuccessResult<T> {
        if (!ParseHelper.isSuccessful(result)) {
            throw new Error("assertion failure, this ParseResult should be successful");
        }

        return result;
    }

    static assertNotFailed<T>(result: ParseResultMaybeEmpty<T>): ParseSuccessOrEmptyResult<T> {
        if (!ParseHelper.isSuccessful(result) && !ParseHelper.isEmpty(result)) {
            throw new Error("assertion failure, this ParseResult should be successful");
        }

        return result;
    }

    static empty(...messages: LogMessage[]): IParseEmptyResult {
        return {
            result: ParseResultType.Empty,
            value: undefined,
            messages: messages
        };
    }

    static fail(range?: TextRange, message?: string, ...args: any[]): IParseFailedResult {
        return {
            result: ParseResultType.Failed,
            messages: range ? [LogMessage.error(range!, message!, ...args)] : emptyMessageArray
        };
    }

    static isSuccessful<T>(result: ParseResultMaybeEmpty<T>): result is IParseSuccessResult<T> {
        return result.result === ParseResultType.Success;
    }

    static isEmpty<T>(result: ParseResultMaybeEmpty<T>): result is IParseEmptyResult {
        return result.result === ParseResultType.Empty;
    }

    static isFailed<T>(result: ParseResultMaybeEmpty<T>): result is IParseFailedResult {
        return result.result === ParseResultType.Failed;
    }

    private readonly messages = new Array<LogMessage>();

    success<T>(value: T): IParseSuccessResult<T> {
        return {
            result: ParseResultType.Success,
            value: value,
            messages: this.messages
        };
    }

    voidSuccess(): IParseSuccessResult<void> {
        return this.success(undefined);
    }

    fail(range?: TextRange, message?: string, ...args: any[]): IParseFailedResult {
        if (range) {
            this.error(range!, message!, ...args);
        }

        return {
            result: ParseResultType.Failed,
            messages: this.messages
        };
    }

    empty(): IParseEmptyResult {
        return {
            result: ParseResultType.Empty,
            value: undefined,
            messages: this.messages
        };
    }

    relay<T>(result: ParseResult<T>): ParseResult<T> {

        if (ParseHelper.isSuccessful(result)) {
            return {
                result: result.result,
                value: result.value,
                messages: this.messages.concat(result.messages)
            };
        } else {
            return {
                result: result.result,
                messages: this.messages.concat(result.messages)
            };
        }
    }

    relayFailure(messageContainer: IMessageContainer): IParseFailedResult {
        this.messages.push(...messageContainer.messages);
        return this.fail();
    }


    hint(range: TextRange | undefined, message: string, ...args: any[]): void {
        this.messages.push(new LogMessage(LogLevel.Hint, range, message, ...args));
    }

    suggestion(range: TextRange | undefined, message: string, ...args: any[]): void {
        this.messages.push(new LogMessage(LogLevel.Suggestion, range, message, ...args));
    }

    warning(range: TextRange | undefined, message: string, ...args: any[]): void {
        this.messages.push(new LogMessage(LogLevel.Warning, range, message, ...args));
    }

    error(range: TextRange | undefined, message: string, ...args: any[]): void {
        this.messages.push(new LogMessage(LogLevel.Error, range, message, ...args));
    }

    absorb<T>(result: ParseResultMaybeEmpty<T>): ParseResultMaybeEmpty<T> {
        this.messages.push(...result.messages);
        return result;
    }
}
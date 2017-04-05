import { Scanner } from "../Scanner";
import { ParseResult, ParseHelper } from "../ParseResult";
import { Messages } from "../Messages";
import { CapoDirectiveNode } from "./Tablature/CapoDirectiveNode";
import { ChordDirectiveNode } from "./Tablature/ChordDirectiveNode";
import { AlternateDirectiveNode } from "./AlternateDirectiveNode";
import { KeyDirectiveNode } from "./KeyDirectiveNode";
import { PatternDirectiveNode } from "./PatternDirectiveNode";
import { RhythmDirectiveNode } from "./RhythmDirectiveNode";
import { SectionDirectiveNode } from "./SectionDirectiveNode";
import { TempoDirectiveNode } from "./TempoDirectiveNode";
import { TimeDirectiveNode } from "./TimeDirectiveNode";
import { TuningDirectiveNode } from "./TuningDirectiveNode";
import { DirectiveNode } from "./DirectiveNode";
import { LiteralNode } from "./LiteralNode";

const registeredParsers: { [key: string]: (scanner: Scanner) => ParseResult<DirectiveNode> } = {
    "capo": CapoDirectiveNode.parseBody,
    "chord": ChordDirectiveNode.parseBody,
    "alternate": AlternateDirectiveNode.parseBody,
    "key": KeyDirectiveNode.parseBody,
    "pattern": PatternDirectiveNode.parseBody,
    "rhythm": RhythmDirectiveNode.parseBody,
    "section": SectionDirectiveNode.parseBody,
    "tempo": TempoDirectiveNode.parseBody,
    "time": TimeDirectiveNode.parseBody,
    "tuning": TuningDirectiveNode.parseBody
};

export module DirectiveNodeParser {

    export function registerParser(name: string, bodyParser: (scanner: Scanner) => ParseResult<DirectiveNode>) {
        registeredParsers[name] = bodyParser;
    }

    export function parse(scanner: Scanner): ParseResult<DirectiveNode> {
        const anchor = scanner.makeAnchor();
        const helper = new ParseHelper();
        if (!scanner.expectChar("+")) {
            return helper.fail(scanner.textPointer.asRange(scanner.source),
                Messages.Error_InstructionExpected);
        }

        scanner.skipWhitespaces();

        const name = scanner.readPattern("[\\w\\-]+");
        if (name === undefined) {
            return helper.fail(scanner.lastReadRange, Messages.Error_InstructionExpected);
        }

        const bodyParser = registeredParsers[name!.toLowerCase()];
        if (!bodyParser) {
            return helper.fail(scanner.lastReadRange, Messages.Error_UnknownInstruction);
        }

        const nameNode = LiteralNode.create(`+${name!}`, anchor.range);

        const result = bodyParser(scanner);
        if (ParseHelper.isSuccessful(result)) {
            result.value.nameNode = nameNode;
            result.value.range = anchor.range;
        }

        return helper.relay(result);
    }

}
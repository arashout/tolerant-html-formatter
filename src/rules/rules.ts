import { TagNode, Attribute, Node, TextNode, CommentNode, } from "../ast";

export const INDENT_SIZE = 2; // SPACES

// RT == RuleType, IT == InputType
interface BaseRule<RT extends RuleTypes, IT extends InputType> {
    type: RT;
    name: string;
    description?: string;
    shouldApply: (inputType: IT) => boolean;
    apply: (input: IT, indent: number, childrenCallback: FormatNode) => string;
    tests?: RuleTest[];
}

interface RuleTest {
    actualHTML: string;
    expectedHTML: string;
    description: string;
}

export enum RuleTypes {
    TAG_RULE,
    ATTRIBUTE_RULE,
    TEXT_RULE,
    COMMENT_RULE,
}

type InputType = TagNode | TextNode | CommentNode | Attribute[];
type Rule = TagRule | TextRule | CommentRule | AttributeRule;
export type FormatNode = (node: Node, indent: number) => string;

export interface TagRule extends BaseRule<RuleTypes.TAG_RULE, TagNode> { };
export interface TextRule extends BaseRule<RuleTypes.TEXT_RULE, TextNode> { };
export interface CommentRule extends BaseRule<RuleTypes.COMMENT_RULE, CommentNode> { };
export interface AttributeRule extends BaseRule<RuleTypes.ATTRIBUTE_RULE, Attribute[]> { };

export function indentString(text: string, indent = 0) {
    return ' '.repeat(indent) + text;
}
export function emptyStringFunc(_: Node) { return '' }

/**
 * The arrays for each type of rule are in their own file
 * NOTE: It is required that last rule in the array, always returns true in the shouldApply function (To avoid not knowing how to format something)
 * @param rules 
 * @param input 
 * @param indent 
 * @param cb 
 */
export function applyFirstRule
    <RT extends RuleTypes, IT extends InputType>
    (rules: BaseRule<RT, IT>[], input: IT, indent: number, cb: FormatNode): string {
    const passingRules = rules.filter(r => r.shouldApply(input));
    if (passingRules.length === 0) {
        throw new Error('Should always have one passing rule for input: ' + JSON.stringify(input));
    }
    return passingRules[0].apply(input, indent, cb);
}
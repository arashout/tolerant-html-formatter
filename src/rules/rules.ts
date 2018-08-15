import { Attribute, CommentNode, Node, TagNode, TextNode } from '../ast';
import { formatNode } from '../common/format';

// RT == RuleType, IT == InputType
interface BaseRule<RT extends RuleTypes, IT extends InputType> {
    type: RT;
    name: string;
    description?: string;
    shouldApply: (inputType: IT, parent: Node) => boolean;
    apply: (input: IT, indent: number, ruleTrace: RuleTrace[]) => string;
    tests?: RuleTest[];
}

export interface RuleTest {
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
export type Rule = TagRule | TextRule | CommentRule | AttributeRule;

export interface TagRule extends BaseRule<RuleTypes.TAG_RULE, TagNode> { }
export interface TextRule extends BaseRule<RuleTypes.TEXT_RULE, TextNode> { }
export interface CommentRule extends BaseRule<RuleTypes.COMMENT_RULE, CommentNode> { }
export interface AttributeRule extends BaseRule<RuleTypes.ATTRIBUTE_RULE, Attribute[]> { }

export function indentString(text: string, indent = 0) {
    return ' '.repeat(indent) + text;
}
export function emptyStringFunc(_: Node) { return ''; }

export interface RuleTrace {
    rule_name: string;
    node_string: string;
    meta?: Dictionary<Primitive>;
}

/**
 * The arrays for each type of rule are in their own file
 * NOTE: It is required that last rule in the array, always returns true in
 * the shouldApply function (To avoid not knowing how to format something)
 * @param rules
 * @param input
 * @param indent
 * @param cb
 */
export function applyFirstRule
    <RT extends RuleTypes, IT extends InputType>(
        rules: Array<BaseRule<RT, IT>>, 
        input: IT, 
        indent: number, 
        parent: Node,
        ruleTrace: RuleTrace[]
    ): string {
    const passingRules = rules.filter((r) => r.shouldApply(input, parent));
    if (passingRules.length === 0) {
        throw new Error('Should always have one passing rule for input: ' + JSON.stringify(input));
    }
    ruleTrace.push({rule_name: passingRules[0].name, node_string: JSON.stringify(input, null, 2)});
    return passingRules[0].apply(input, indent, ruleTrace);
}

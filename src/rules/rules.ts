import { Attribute, CommentNode, Node, TagNode, TextNode, RootNode, AttributeNode } from '../ast';

export interface BaseRule<RT extends RuleType, N extends Node> {
    type: RT;
    name: string;
    description?: string;
    shouldApply: ShouldApplyFunc<N>;
    apply: ApplyFunc<N>;
}
// Not great that I have some duplication here, but I don't know how to avoid it
export interface IRule {
    type: RuleType;
    name: string;
    description?: string;
    shouldApply: (inputType: Node, parent: Node) => boolean;
    apply: (input: Node, indent: number) => string;
}

interface ShouldApplyFunc<N extends Node> {(node: N, parent: Node): boolean };
type ApplyFunc<N extends Node> = (node: N, indent: number) => string;

export enum RuleType {
    TAG_RULE,
    ATTRIBUTE_RULE,
    TEXT_RULE,
    COMMENT_RULE,
}

export type Rule = TagRule | TextRule | CommentRule | AttributeRule;

export interface TagRule extends BaseRule<RuleType.TAG_RULE, TagNode> { }
export interface TextRule extends BaseRule<RuleType.TEXT_RULE, TextNode> { }
export interface CommentRule extends BaseRule<RuleType.COMMENT_RULE, CommentNode> { }
export interface AttributeRule extends BaseRule<RuleType.ATTRIBUTE_RULE, AttributeNode> { }

export function indentString(text: string, indent = 0) {
    return ' '.repeat(indent) + text;
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
    <RT extends RuleType, N extends Node>(
        rules: Array<BaseRule<RT, N>>, 
        input: N, 
        indent: number, 
        parent: Node
    ): string {
    const passingRules = rules.filter((r) => r.shouldApply(input, parent));
    if (passingRules.length === 0) {
        throw new Error('Should always have one passing rule for input: ' + JSON.stringify(input));
    }

    return passingRules[0].apply(input, indent);
}

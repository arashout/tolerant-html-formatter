import { TagNode, Attribute, Node, TextNode, CommentNode, NodeTypes } from "./ast";

const INDENT_SIZE = 2; // SPACES

// RT == RuleType, IT == InputType
interface BaseRule<RT extends RuleTypes, IT extends InputType> {
    type: RT;
    name: string;
    shouldApply: (inputType: IT) => boolean;
    apply: (input: IT, indent: number, childrenCallback: FormatNode) => string;
}

enum RuleTypes {
    TAG_RULE,
    ATTRIBUTE_RULE,
    TEXT_RULE,
    COMMENT_RULE,
}

type InputType = TagNode | TextNode | CommentNode | Attribute[];
type Rule = TagRule | TextRule | CommentRule | AttributeRule;
type FormatNode = (node: Node, indent: number) => string;

interface TagRule extends BaseRule<RuleTypes.TAG_RULE, TagNode> { };
interface TextRule extends BaseRule<RuleTypes.TEXT_RULE, TextNode> { };
interface CommentRule extends BaseRule<RuleTypes.COMMENT_RULE, CommentNode> { };
interface AttributeRule extends BaseRule<RuleTypes.ATTRIBUTE_RULE, Attribute[]> { };

function insert(text: string, indent = 0) {
    return ' '.repeat(indent) + text;
}
function emptyStringFunc(_: Node) { return '' }

function applyFirstRule
    <RT extends RuleTypes, IT extends InputType>
    (rules: BaseRule<RT, IT>[], input: IT, indent: number, cb: FormatNode): string {
    const passingRules = rules.filter(r => r.shouldApply(input));
    if (passingRules.length <= 0) {
        throw new Error('Should always have one passing rule for input: ' + JSON.stringify(input));
    }
    return passingRules[0].apply(input, indent, cb);
}

// The order the rules appear in determine their precedence. e.g. rule at index 0 has highest precedence
// NOTE: Each rule array should have a default rule that returns true for the correspond node type at the end of the array (As a fallback)
const tagRules: TagRule[] = [
    {
        type: RuleTypes.TAG_RULE,
        name: 'simpleTagNode',
        shouldApply(tn: TagNode): boolean {
            return tn.children.length === 0;
        },
        apply(tn: TagNode, indent: number, _: FormatNode): string {
            let attributesString = applyFirstRule(attributeRules, tn.attributes, indent, emptyStringFunc);
            attributesString = attributesString ? ' ' + attributesString : '';

            return insert(`<${tn.name}${attributesString}></${tn.name}>\n`, indent);
        }
    },
    {
        type: RuleTypes.TAG_RULE,
        name: 'singleTextChildTagNode',
        shouldApply(tn: TagNode): boolean {
            return tn.children.length === 1 && tn.children[0].type === NodeTypes.TEXT;
        },
        apply(tn: TagNode, indent: number, cb: FormatNode): string {
            let attributesString = applyFirstRule(attributeRules, tn.attributes, indent, emptyStringFunc);
            attributesString = attributesString ? ' ' + attributesString : '';
            const childrenString = tn.children.map(n => cb(n, indent + INDENT_SIZE)).join('');

            return insert(`<${tn.name}${attributesString}>${childrenString}</${tn.name}>\n`, indent);
        }
    },
    {
        type: RuleTypes.TAG_RULE,
        name: 'defaultTagNode',
        shouldApply: (_: TagNode): boolean => true,
        apply: (tn: TagNode, indent: number, cb: FormatNode): string => {
            let attributesString = applyFirstRule(attributeRules, tn.attributes, indent, emptyStringFunc);
            attributesString = attributesString ? ' ' + attributesString : '';
            const childrenString = tn.children.map(n => cb(n, indent + INDENT_SIZE)).join('');

            return [
                `<${tn.name}${attributesString}>`,
                `\n${childrenString}`,
                `</${tn.name}>\n`
            ]
                .map(v => insert(v, indent))
                .join('');
        }
    },
];

const attributeRules: AttributeRule[] = [
    {
        type: RuleTypes.ATTRIBUTE_RULE,
        name: 'attributesOneLine',
        shouldApply: (attributes: Attribute[]): boolean => attributes.length < 3,
        apply: (attributes: Attribute[], _: number): string => {
            if (attributes.length === 0) {
                return '';
            }

            return attributes.map(pair => `${pair.key}="${pair.value}"`).join(' ');
        }
    },
    {
        type: RuleTypes.ATTRIBUTE_RULE,
        name: 'attributePerLine',
        shouldApply: (_: Attribute[]): boolean => true,
        apply: (attributes: Attribute[], indent: number): string => {
            return attributes
                .map(pair => `${pair.key}="${pair.value}"`)
                .map(v => insert(v, indent + INDENT_SIZE))
                .join('\n');
        }
    }
];

const textRules: TextRule[] = [
    {
        type: RuleTypes.TEXT_RULE,
        name: 'textNewLine',
        shouldApply: (tn: TextNode): boolean => tn.value === '\n',
        apply: (_: TextNode, ___: number): string => {
            return '';
        }
    },
    {
        type: RuleTypes.TEXT_RULE,
        name: 'textSameLine',
        shouldApply: (_: TextNode): boolean => true,
        apply: (tn: TextNode, _: number): string => {
            return tn.value;
        }
    },
];


export { applyFirstRule, tagRules, textRules, emptyStringFunc };
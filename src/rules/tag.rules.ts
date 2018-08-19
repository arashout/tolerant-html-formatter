import { NodeTypes, TagNode } from '../ast';
import { INDENT_SIZE, MAX_LINE_LENGTH } from '../config';
import { applyFirstRule, indentString, RuleType, TagRule, IRule } from './rules';

import { cleanStringHTML, squashWhitespace, squashNewlines } from '../common/util';
import { attributeRules } from './attributes.rules';
import { formatNode } from '../common/format';
import { textRules } from './text.rules';
import { traceWrapper } from './rule-trace.service';

// https://www.w3.org/TR/html/syntax.html#writing-html-documents-elements
const voidElements = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
];

type TagRuleNames = 'tagVoid' | 'tagChildless' | 'tagTextChild' | 'tagDefault';

const tagRulesMap = new Map<TagRuleNames, TagRule>([
    ['tagVoid', {
        type: RuleType.TAG_RULE,
        name: 'tagVoid', // https://stackoverflow.com/a/10599002/5258887
        shouldApply(tn: TagNode): boolean {
            return voidElements.indexOf(tn.name) !== -1;
        },
        apply(tn: TagNode, indent: number): string {
            const attributesString = applyFirstRule(attributeRules, tn.attributeNode, indent, tn);
            return indentString(`<${tn.name}${attributesString}/>`, indent) + '\n';
        }
    }],
    ['tagChildless', {
        type: RuleType.TAG_RULE,
        name: 'tagChildless',
        shouldApply(tn: TagNode): boolean {
            return tn.children.length === 0;
        },
        apply(tn: TagNode, indent: number): string {
            const attributesString = applyFirstRule(attributeRules, tn.attributeNode, indent, tn);
            return indentString(`<${tn.name}${attributesString}></${tn.name}>`, indent) + '\n';
        }
    }],
    ['tagTextChild', {
        type: RuleType.TAG_RULE,
        name: 'tagTextChild',
        shouldApply(tn: TagNode): boolean {
            return tn.children.length === 1 && tn.children[0].type === NodeTypes.TEXT;
        },
        apply(tn: TagNode, indent: number): string {
            const attributesString = applyFirstRule(attributeRules, tn.attributeNode, indent, tn);
            let text = formatNode(tn.children[0], 0, tn).trim();

            // CASE 1: We can sameLine everything including the attribute tag
            // CASE 2: We can't sameLine with the attributes but 
            // we can put the text on the same line as the '>' of the start tag,
            // This scenario occurs when the attributeString is multiple lines
            // CASE 3: We can't sameLine anything...
            const startTag = `<${tn.name}${attributesString}>`;
            const endTag = `</${tn.name}>`;
            const singleLineResult = indentString(`${startTag}${text}${endTag}\n`, indent);

            if (singleLineResult.length <= MAX_LINE_LENGTH) {
                return singleLineResult;
            }
            // We will only have a match if the attributeString contains newlines
            const match = attributesString.match(/\n(.+)$/);
            const lastLine = match ? match[1] : null;
            if(lastLine && lastLine.length <= MAX_LINE_LENGTH){
                return indentString(`${startTag}`, indent) + text + endTag + '\n';
            } 
            else {
                // Indent all the strings
                text = squashNewlines(indentString(text, indent + INDENT_SIZE), {trailing: true});
                return `${indentString(startTag, indent)}\n${text}\n${indentString(endTag, indent)}\n`;
            }
        }
    }],
    ['tagDefault', {
        type: RuleType.TAG_RULE,
        name: 'defaultTag',
        shouldApply: (_: TagNode): boolean => true,
        apply: (tn: TagNode, indent: number): string => {
            const attributesString = applyFirstRule(attributeRules, tn.attributeNode, indent, tn);
            const childrenString = tn.children.map((n) => {
                return formatNode(n, indent + INDENT_SIZE, tn);
            }).join('');

            const startTag = indentString(`<${tn.name}${attributesString}>`, indent);
            const endTag = indentString(`</${tn.name}>`, indent);

            return `${startTag}\n${childrenString}${endTag}\n`;
        },
    }]
])
tagRulesMap.forEach(v => traceWrapper(v as IRule));

const tagRules: TagRule[] = Array.from(tagRulesMap.values());

export {tagRules, tagRulesMap};
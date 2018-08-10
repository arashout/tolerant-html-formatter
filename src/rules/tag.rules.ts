import { TagNode, NodeTypes } from "../ast";
import { RuleTypes, TagRule, FormatNode, applyFirstRule, insert, emptyStringFunc, INDENT_SIZE } from "./rules";

import { attributeRules } from "./attributes.rules";

export const tagRules: TagRule[] = [
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
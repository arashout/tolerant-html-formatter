import { Attribute, AttributeNode } from '../ast';
import { INDENT_SIZE, MAX_ATTRIBUTE_LENGTH } from '../config';
import { cleanStringHTML } from '../common/util';
import { AttributeRule, indentString, RuleType, IRule } from './rules';
import { traceWrapper } from './rule-trace.service';

function attributeToString(attribute: Attribute): string {
    return attribute.value === null ? attribute.key : `${attribute.key}="${attribute.value}"`;
}

type AttributeNames = 'attributeOnePerLine' | 'attributeSameLine' | 'attributeOnePerLineTwo';
// Map so that we can directly apply other rules inside of each other
const attributeRulesMap =  new Map<AttributeNames, AttributeRule>([
    ['attributeSameLine',     {
        type: RuleType.ATTRIBUTE_RULE,
        name: 'attributeSameLine',
        shouldApply(at: AttributeNode): boolean {
            return at.attributes.length === 1 || (
                    at.attributes.length < 3 &&
                    at.attributes.every( a => attributeToString(a).length < MAX_ATTRIBUTE_LENGTH)
                );
        },
        apply: (at: AttributeNode, _: number): string => {
            if (at.attributes.length === 0) {
                return '';
            }

            return ' ' + at.attributes.map((a) => attributeToString(a)).join(' ');
        },
    }],
    ['attributeOnePerLineTwo',
        {
            type: RuleType.ATTRIBUTE_RULE,
            name: 'attributeOnePerLineTwo',
            shouldApply: (at: AttributeNode): boolean => at.attributes.length === 2,
            apply: (at: AttributeNode, indent: number): string => {
                return (attributeRulesMap.get('attributeOnePerLine') as AttributeRule).apply(at, indent)
            }
        }],
    ['attributeOnePerLine', {
        type: RuleType.ATTRIBUTE_RULE,
        name: 'attributeOnePerLine',
        shouldApply: (_: AttributeNode): boolean => true,
        apply: (at: AttributeNode, indent: number): string => {
            let attributeString = '';
            for (let i = 0; i < at.attributes.length; i++) {
                const pair = attributeToString(at.attributes[i]);

                if (i === at.attributes.length - 1) {
                    attributeString += `\n${indentString(pair, indent + INDENT_SIZE)}`;
                } else {
                    attributeString += `\n${indentString(pair, indent + INDENT_SIZE)}`;
                }

            }
            return attributeString;
        }
    }],
]);

attributeRulesMap.forEach(v => traceWrapper(v as IRule));
// NOTE: Map keeps insertion order!
const attributeRules: AttributeRule[] = Array.from(attributeRulesMap.values());

export {attributeRulesMap, attributeRules};
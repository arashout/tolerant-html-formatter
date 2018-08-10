import { Attribute } from "../ast";
import { RuleTypes, AttributeRule, insert, INDENT_SIZE } from "./rules";

export const attributeRules: AttributeRule[] = [
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
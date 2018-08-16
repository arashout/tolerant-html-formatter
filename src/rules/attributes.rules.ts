import { Attribute, AttributeNode } from '../ast';
import { INDENT_SIZE, MAX_ATTRIBUTE_LINE_LENGTH } from '../config';
import { cleanStringHTML } from '../common/util';
import { AttributeRule, indentString, RuleType } from './rules';

function attributeToString(attribute: Attribute): string {
    return attribute.value === null ? attribute.key : `${attribute.key}="${attribute.value}"`;
}

type AttributeNames = 'onePerLine';
// Map so that we can directly apply other rules inside of each other
const attributeRulesMap: {[key in AttributeNames]: AttributeRule} = {
    'onePerLine': {
        type: RuleType.ATTRIBUTE_RULE,
        name: 'onePerLine',
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
        },
        tests: [
            {
                actualHTML: `<div a="1" b="2" c="3" d class="flex btn button"></div>`,
                expectedHTML: cleanStringHTML(`
                    <div
                      a="1"
                      b="2"
                      c="3"
                      d
                      class="flex btn button"></div>
                    `),
                description: 'should have 1 attribute per line',
            },
        ],
    },
}

export const attributeRules: AttributeRule[] = [
    {
        type: RuleType.ATTRIBUTE_RULE,
        name: 'sameLine',
        // Might have to pass indent through here
        shouldApply(this: AttributeRule, at: AttributeNode): boolean {
            const formattedString = this.apply(at,0);
            // Essentially we always same-line single attributes
            return at.attributes.length < 3 && (at.attributes.length === 1 || formattedString.length < MAX_ATTRIBUTE_LINE_LENGTH);
        },
        apply: (at: AttributeNode, _: number): string => {
            if (at.attributes.length === 0) {
                return '';
            }

            return ' ' + at.attributes.map((a) => attributeToString(a)).join(' ');
        },
        tests: [
            {
                actualHTML: `<div
                a="1"
                b></div>`,
                expectedHTML: `<div a="1" b></div>`,
                description: 'all attributes should be on the same line',
            },
        ],
    },
    {
        type: RuleType.ATTRIBUTE_RULE,
        name: 'onePerLineTwo',
        shouldApply: (at: AttributeNode): boolean => at.attributes.length === 2,
        apply: (at: AttributeNode, indent: number): string => {
            return attributeRulesMap.onePerLine.apply(at, indent)
        },
        tests: [
            {
                actualHTML: `<div
                a="1"
                b></div>`,
                expectedHTML: `<div a="1" b></div>`,
                description: 'all attributes should be on the same line',
            },
        ],
    },
    attributeRulesMap.onePerLine,
];


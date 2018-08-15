import { TextNode } from '../ast';
import { cleanStringHTML } from '../util';
import { indentString, RuleTypes, TextRule } from './rules';

export const textRules: TextRule[] = [
    {
        type: RuleTypes.TEXT_RULE,
        name: 'newlines',
        shouldApply: (tn: TextNode): boolean =>  /^\n+$/.test(tn.value),
        apply: (_: TextNode, __: number): string => '\n',
        tests: [

        ],
    },
    {
        type: RuleTypes.TEXT_RULE,
        name: 'textSameLine',
        shouldApply: (_: TextNode): boolean => true,
        apply: (tn: TextNode, indent: number): string => indentString(tn.value, indent),
        tests: [
            {
                actualHTML: 'Hello World',
                expectedHTML: 'Hello World',
                description: 'text should be on the same line',
            },
        ],
    },
];

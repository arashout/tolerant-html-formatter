import { TextNode, NodeTypes, Node } from '../ast';
import { cleanStringHTML } from '../util';
import { indentString, RuleTypes, TextRule } from './rules';

export const textRules: TextRule[] = [
    {
        type: RuleTypes.TEXT_RULE,
        name: 'textOnRootNode',
        shouldApply: (_: TextNode, parent: Node): boolean => parent.type === NodeTypes.ROOT,
        apply: (tn: TextNode, __: number): string => {
            const value = tn.value.replace(/^ */, '').replace(/ *$/, '');
            // 1. Squash multiple new-lines
            // 2. Otherwise print with single new-line
            if(/^\n+$/.test(value))  {
                return '\n';
            }
            return tn.value + '\n';
        },
    },
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

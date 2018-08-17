import { TextNode, NodeTypes, Node } from '../ast';
import { cleanStringHTML } from '../common/util';
import { indentString, RuleType, TextRule, IRule } from './rules';
import { traceWrapper } from './rule-trace.service';
import { MAX_LINE_LENGTH } from '../config';

type TextRulesNames = 'textDefault' | 'textSameLine' | 'textRoot' | 'textNewlines';

const textRulesMap = new Map<TextRulesNames, TextRule>(
    [
        ['textNewlines', {
            type: RuleType.TEXT_RULE,
            name: 'textNewLines',
            shouldApply: (tn: TextNode): boolean => /^\n+$/.test(tn.value),
            apply: (_: TextNode, __: number): string => '\n',
        }],
        ['textRoot', {
            type: RuleType.TEXT_RULE,
            name: 'textRoot',
            shouldApply: (_: TextNode, parent: Node): boolean => parent.type === NodeTypes.ROOT,
            apply: (tn: TextNode, __: number): string => {
                const value = tn.value.replace(/^ */, '').replace(/ *$/, '');
                // 1. Squash multiple new-lines
                // 2. Otherwise print with single new-line
                if (/^\n+$/.test(value)) {
                    return '\n';
                }
                return tn.value + '\n';
            },
        }],
        ['textSameLine', {
            type: RuleType.TEXT_RULE,
            name: 'textSameLine',
            shouldApply: (tn: TextNode): boolean => tn.value.length <= MAX_LINE_LENGTH,
            apply: (tn: TextNode, _: number): string => tn.value,
            tests: [
                {
                    actualHTML: 'Hello World',
                    expectedHTML: 'Hello World',
                    description: 'text should be on the same line',
                },
            ],
        }],
        ['textDefault', {
            type: RuleType.TEXT_RULE,
            name: 'textDefault',
            shouldApply: (_: TextNode): boolean => true,
            apply: (tn: TextNode, indent: number): string => indentString(tn.value, indent) + '\n',
        }],
    ]);
textRulesMap.forEach(v => traceWrapper(v as IRule));

// NOTE: Map keeps insertion order!
const textRules: TextRule[] = Array.from(textRulesMap.values());

export { textRulesMap, textRules };
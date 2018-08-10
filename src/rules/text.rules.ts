import { TextNode } from "../ast";
import { RuleTypes, TextRule } from "./rules";

export const textRules: TextRule[] = [
    {
        type: RuleTypes.TEXT_RULE,
        name: 'textNewLine',
        shouldApply: (tn: TextNode): boolean => tn.value === '\n',
        apply: (_: TextNode, ___: number): string => '',
        tests: [
            {actualHTML: "\n", expectedHTML: "", description: "stupid newlines"},
        ]
    },
    {
        type: RuleTypes.TEXT_RULE,
        name: 'textSameLine',
        shouldApply: (_: TextNode): boolean => true,
        apply: (tn: TextNode, _: number): string => tn.value,
        tests: [
            {
                actualHTML: "Hello World",
                expectedHTML: "Hello World",
                description: "text should be on the same line"
            }
        ]
    },
];
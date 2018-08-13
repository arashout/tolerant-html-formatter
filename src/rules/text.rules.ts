import { TextNode } from "../ast";
import { RuleTypes, TextRule, indentString } from "./rules";

export const textRules: TextRule[] = [
    {
        type: RuleTypes.TEXT_RULE,
        name: 'textNewLine',
        shouldApply: (tn: TextNode): boolean => /^[ \n]+$/g.test(tn.value),
        apply: (_: TextNode, ___: number): string => '',
        tests: [
            {actualHTML: "\n", expectedHTML: "", description: "stupid newlines"},
            {actualHTML: "\n\n", expectedHTML: "", description: "stupid newlines2"},
        ]
    },
    {
        type: RuleTypes.TEXT_RULE,
        name: 'textSameLine',
        shouldApply: (_: TextNode): boolean => true,
        apply: (tn: TextNode, indent: number): string => indentString(tn.value, indent),
        tests: [
            {
                actualHTML: "Hello World",
                expectedHTML: "Hello World",
                description: "text should be on the same line"
            }
        ]
    },
];
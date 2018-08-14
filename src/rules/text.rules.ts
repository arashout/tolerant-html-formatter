import { TextNode } from "../ast";
import { RuleTypes, TextRule, indentString } from "./rules";

export const textRules: TextRule[] = [
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
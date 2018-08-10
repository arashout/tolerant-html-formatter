import { generateAST } from "../ast";
import { formatNode } from "../printer";

import { RuleTypes } from "../rules/rules";
import { textRules } from "../rules/text.rules";
import { tagRules } from "../rules/tag.rules";
import { attributeRules } from "../rules/attributes.rules";
import { commentRules } from "../rules/comment.rules";


for (const tr of textRules) {
    if (tr.tests) {
        for (const trt of tr.tests) {
            test(`testing ${RuleTypes[tr.type]} rule: ${tr.name}\n${trt.description}`, () => {
                const rootNode = generateAST(trt.actualHTML);
                expect(formatNode(rootNode, 0)).toBe(trt.expectedHTML);
            });
        }
    }
}

for (const tr of commentRules) {
    if (tr.tests) {
        for (const trt of tr.tests) {
            test(`testing ${RuleTypes[tr.type]} rule: ${tr.name}\n${trt.description}`, () => {
                const rootNode = generateAST(trt.actualHTML);
                expect(formatNode(rootNode, 0)).toBe(trt.expectedHTML);
            });
        }
    }
}

for (const tr of attributeRules) {
    if (tr.tests) {
        for (const trt of tr.tests) {
            test(`testing ${RuleTypes[tr.type]} rule: ${tr.name}\n${trt.description}`, () => {
                const rootNode = generateAST(trt.actualHTML);
                expect(formatNode(rootNode, 0)).toBe(trt.expectedHTML);
            });
        }
    }
}
// NOTE: These are not really unit tests as they depend on the other rules
for (const tr of tagRules) {
    if (tr.tests) {
        for (const trt of tr.tests) {
            test(`testing ${RuleTypes[tr.type]} rule: ${tr.name}\n${trt.description}`, () => {
                const rootNode = generateAST(trt.actualHTML);
                expect(formatNode(rootNode, 0)).toBe(trt.expectedHTML);
            });
        }
    }
}











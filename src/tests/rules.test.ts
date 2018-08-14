import { generateAST } from "../ast";
import { formatNode } from "../printer";

import { RuleTypes, Rule, RuleTrace } from "../rules/rules";
import { textRules } from "../rules/text.rules";
import { tagRules } from "../rules/tag.rules";
import { attributeRules } from "../rules/attributes.rules";
import { commentRules } from "../rules/comment.rules";
import { prettifyRuleTraces } from "../util";


ruleTestsRunner(textRules);
ruleTestsRunner(commentRules);
ruleTestsRunner(attributeRules);
ruleTestsRunner(tagRules);

function ruleTestsRunner(rules: Rule[]){
    for (const r of rules) {
        if (r.tests) {
            for (const rt of r.tests) {
                test(`testing ${RuleTypes[r.type]} rule: ${r.name}\n${rt.description}`, () => {
                    const rootNode = generateAST(rt.actualHTML);
                    // Ugly workaround for custom failure messages
                    const ruleTraces: RuleTrace[] = [];
                    expect(rootNode).not.toBeNull();
                    if(rootNode){
                        const result = formatNode(rootNode, 0, ruleTraces);
                        if (result !== rt.expectedHTML){
                            console.log(prettifyRuleTraces(ruleTraces));
                        }
                        expect(result).toBe(rt.expectedHTML);
                    }
                });
            }
        }
    }
}
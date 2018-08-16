import * as util from 'util';

import { Printer } from '../printer';

import { attributeRules } from '../rules/attributes.rules';
import { commentRules } from '../rules/comment.rules';
import { Rule, RuleType } from '../rules/rules';
import { tagRules } from '../rules/tag.rules';
import { textRules } from '../rules/text.rules';

ruleTestsRunner(textRules);
ruleTestsRunner(commentRules);
ruleTestsRunner(attributeRules);
ruleTestsRunner(tagRules);

function ruleTestsRunner(rules: Rule[]) {
    test(`test-rules-${RuleType[rules[0].type]}`, () => {
        for (const r of rules) {
            if (r.tests) {
                for (const rt of r.tests) {
                    const p = new Printer();
                    const result = p.run(rt.actualHTML);
                    // Ugly workaround for custom failure messages
                    if (result.output !== rt.expectedHTML) {
                        console.log(util.inspect(result.ruleTraces), false, null);
                    }
                    expect(result.output).toBe(rt.expectedHTML);
                }
            }
        }
    });
}

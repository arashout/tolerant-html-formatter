import { RuleTrace } from "./rules/rules";

export function assertNever(x: never): never {
    throw new Error("Unexpected object: " + x);
}

type stringFunc =  (input: string) => string; // LOL
/**
 * Function that removes hanging indentation off of HTML
 * made with string templates, and trims the leading/trailing newlines
 * @param input 
 */
export function cleanStringHTML(input: string): string{
    const stripIndent: stringFunc = require('strip-indent');
    return stripIndent(input).trim();
}

export function prettyPrintRuleTraces(ruleTraces: RuleTrace[]){
    
    for (const rt of ruleTraces) {
        const node = JSON.parse(rt.node_string);
        console.log(rt.rule_name, '\n', node);
    }
}
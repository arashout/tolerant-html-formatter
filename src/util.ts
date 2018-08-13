import { RuleTrace } from "./rules/rules";
import { Node, NodeTypes } from "./ast";

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

// TODO: Fix this type
export function prettifyRuleTraces(ruleTraces: RuleTrace[]){
    const prettifiedRuleTraces = [];
    for (const rt of ruleTraces) {
        const node = JSON.parse(rt.node_string) as Node;
        if(node.type === NodeTypes.TAG || node.type === NodeTypes.ROOT){
            delete node.children;
        }
        prettifiedRuleTraces.push({
            name: rt.rule_name,
            node: node,
        });
    }
    return prettifiedRuleTraces;
}
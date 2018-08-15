import { RuleTrace } from "./rules/rules";
import { Node, NodeTypes } from "./ast";

export function assertNever(x: never): never {
    throw new Error("Unexpected object: " + x);
}

type stringFunc =  (s: string) => string; // LOL
/**
 * Function that removes hanging indentation off of HTML
 * made with string templates, and trims the leading/trailing newlines
 * @param s 
 */
export function cleanStringHTML(s: string): string{
    const stripIndent: stringFunc = require('strip-indent');
    return stripIndent(s).trim();
}

interface PrettyRuleTrace {
    name: string,
    node: Node,
    meta?: Dictionary<Primitive>
}

export function prettifyRuleTraces(ruleTraces: RuleTrace[]): PrettyRuleTrace[]{
    const prettifiedRuleTraces = [];
    for (const rt of ruleTraces) {
        const node = JSON.parse(rt.node_string) as Node;
        // It's not helpful to see the children of the Node, so we delete it to make the logs easier to read
        if(node.type === NodeTypes.TAG || node.type === NodeTypes.ROOT){
            delete node.children;
        }
        let prettyRuleTrace = {
            name: rt.rule_name,
            node: node,
        };
        if(rt.meta){
            prettyRuleTrace = Object.assign(prettyRuleTrace, {meta: rt.meta});
        }

        prettifiedRuleTraces.push(prettyRuleTrace);
    }
    return prettifiedRuleTraces;
}

export function squashWhitespace(s: string): string{
    return s.replace(/[\n\s]+/g, ' ');
}
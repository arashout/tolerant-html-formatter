import { Node, NodeTypes, TagNode } from "../ast";
import { Rule, RuleType, BaseRule, IRule } from "./rules";

export interface RuleTrace {
    rule_name: string;
    node: Node;
}

class RuleTracer {
    private ruleTraces: RuleTrace[] = [];
    constructor() { }

    public addTrace(node: Node, rule: IRule): void {
        this.ruleTraces.push({ rule_name: rule.name, node });
    }

    public getTraces(pretty: boolean) {
        if (pretty) {
            return this.ruleTraces.map((rt) => {
                // It's not helpful to see the children of the Node, so we delete it to make the logs easier to read
                if (rt.node.type === NodeTypes.TAG || rt.node.type === NodeTypes.ROOT) {
                    delete rt.node.children;
                }
                return rt;
            });
        }
        
        return this.ruleTraces;
    }

    public clearTraces(){
        this.ruleTraces = [];
    }
}

// TODO: If not using debug mode, do not instansiate tracer
export const ruleTracer = new RuleTracer();

export function traceWrapper(rule: IRule): IRule {
    const applyRef = rule.apply;
    rule.apply = function(input: Node, indent: number): string {
        ruleTracer.addTrace(input, rule);
        return applyRef(input, indent);
    }
    return rule;

}
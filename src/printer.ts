import { Node, generateAST, NodeTypes } from './ast';
import { formatNode } from './common/format';
import { ruleTracer, RuleTrace } from './rules/rule-trace.service';

interface PrinterResult {
    output: string;
    ruleTraces: RuleTrace[];
    astNode?: Node;
}

export class Printer {
    public run(sourceHTML: string): PrinterResult {
        ruleTracer.clearTraces();
        const rootNode = generateAST(sourceHTML);
        let output = '';
        if (rootNode) {
            // TODO: Using rootNode as the parent is a bit of a hack
            output = formatNode(rootNode, 0, rootNode);
        }
        const ruleTraces = ruleTracer.getTraces(true);
        return {
            output,
            ruleTraces,
            astNode: rootNode ? rootNode : { type: NodeTypes.ROOT, children: [] } ,
        };
    }
}
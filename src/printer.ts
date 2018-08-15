import { Node, generateAST } from './ast';
import { formatNode} from './common/format'; 
import { RuleTrace } from './rules/rules';

interface PrinterResult {
    output: string;
    ruleTraces: RuleTrace[];
    astNode?: Node;
}

export class Printer {
    public run(sourceHTML: string): PrinterResult {
        const rootNode = generateAST(sourceHTML);
        const ruleTraces: RuleTrace[] = [];
        if (rootNode) {
            return {
                // TODO: Using rootNode as the parent is a bit of a hack
                output: formatNode(rootNode, 0, rootNode, ruleTraces),
                ruleTraces,
                astNode: rootNode,
            };
        } else {
            return {
                output: '',
                ruleTraces,
            };
        }
    }
}
import * as ast from './ast';
import { assertNever } from './util';

import { applyFirstRule, emptyStringFunc, RuleTrace } from './rules/rules';
import { tagRules } from './rules/tag.rules';
import { textRules } from './rules/text.rules';
import { commentRules } from './rules/comment.rules';

interface PrinterResult {
    output: string,
    ruleTraces: RuleTrace[],
    astNode?: ast.Node,
}
export class Printer {
    run(sourceHTML: string): PrinterResult {
        const rootNode = ast.generateAST(sourceHTML);
        const ruleTraces: RuleTrace[] = [];
        if(rootNode){
            return { 
                output: formatNode(rootNode, 0, ruleTraces), 
                ruleTraces,
                astNode: rootNode,
            }
        } else {
            return {
                output: '', 
                ruleTraces,
            };
        }
    }
}

export function formatNode(node: ast.Node, indent: number, ruleTrace: RuleTrace[]): string {
    switch (node.type) {
        case ast.NodeTypes.ROOT:
            return node.children.map( n => formatNode(n, indent, ruleTrace)).join('').trim();
        case ast.NodeTypes.TAG:
            return applyFirstRule(tagRules, node, indent, formatNode, ruleTrace);
        case ast.NodeTypes.TEXT:
            return applyFirstRule(textRules, node, indent, emptyStringFunc, ruleTrace);
        case ast.NodeTypes.COMMENT:
            return applyFirstRule(commentRules, node, indent, emptyStringFunc, ruleTrace);
        default:
            assertNever(node);
            throw new Error('Reach end of node types');
    }
}
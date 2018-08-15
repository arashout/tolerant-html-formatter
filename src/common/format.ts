import { assertNever } from '../util';
import { Node, NodeTypes } from '../ast';
import { commentRules } from '../rules/comment.rules';
import { applyFirstRule, emptyStringFunc, RuleTrace } from '../rules/rules';
import { tagRules } from '../rules/tag.rules';
import { textRules } from '../rules/text.rules';

export function formatNode(node: Node, indent: number, parent: Node, ruleTrace: RuleTrace[]): string {
    switch (node.type) {
        case NodeTypes.ROOT:
            return node.children.map( (n) => formatNode(n, indent, parent, ruleTrace)).join('').trim();
        case NodeTypes.TAG:
            return applyFirstRule(tagRules, node, indent, parent, ruleTrace);
        case NodeTypes.TEXT:
            return applyFirstRule(textRules, node, indent, parent, ruleTrace);
        case NodeTypes.COMMENT:
            return applyFirstRule(commentRules, node, indent, parent, ruleTrace);
        default:
            assertNever(node);
            throw new Error('Reach end of node types');
    }
}

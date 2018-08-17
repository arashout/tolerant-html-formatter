import { assertNever } from './util';
import { Node, NodeTypes } from '../ast';
import { commentRules } from '../rules/comment.rules';
import { applyFirstRule} from '../rules/rules';
import { tagRules } from '../rules/tag.rules';
import { textRules } from '../rules/text.rules';
import { attributeRules } from '../rules/attributes.rules';

export function formatNode(node: Node, indent: number, parent: Node): string {
    switch (node.type) {
        case NodeTypes.ROOT:
            return node.children.map( (n) => formatNode(n, indent, parent)).join('').trim();
        case NodeTypes.TAG:
            return applyFirstRule(tagRules, node, indent, parent);
        case NodeTypes.TEXT:
            return applyFirstRule(textRules, node, indent, parent);
        case NodeTypes.COMMENT:
            return applyFirstRule(commentRules, node, indent, parent);
        case NodeTypes.ATTRIBUTE:
            return applyFirstRule(attributeRules, node, indent, parent);
        default:
            assertNever(node);
            throw new Error('Reach end of node types');
    }
}

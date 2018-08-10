import * as ast from './ast';
import { assertNever } from './util';
import { applyFirstRule, tagRules, textRules, emptyStringFunc } from './rules';

export function formatNode(node: ast.Node, indent: number): string {
    switch (node.type) {
        case ast.NodeTypes.TAG:
            return applyFirstRule(tagRules, node, indent, formatNode);
        case ast.NodeTypes.TEXT:
            return applyFirstRule(textRules, node, indent, emptyStringFunc);
        case ast.NodeTypes.COMMENT:
            return formatCommentNode(node);
        case ast.NodeTypes.NEWLINE:
            return 'newline';
        default:
            assertNever(node);
            throw new Error('Reach end of node types');
    }
}

function formatCommentNode(commentNode: ast.CommentNode): string {
    return ''
    // return `<!-- ${commentNode.value} -->`
}
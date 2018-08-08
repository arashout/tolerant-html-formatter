import * as ast from './ast';
import { assertNever } from './util';

export function formatNode(node: ast.Node): string {
    switch (node.type) {
        case ast.NodeTypes.TAG:
            return formatTagNode(node);
        case ast.NodeTypes.TEXT:
            return formatTextNode(node);
        case ast.NodeTypes.COMMENT:
            return formatCommentNode(node);
        case ast.NodeTypes.NEWLINE:
            return 'newline';
        default:
            assertNever(node);
            throw new Error('Reach end of node types');
    }
}

function formatTagNode(tagNode: ast.TagNode): string {
    let attributesString = '';

    if(tagNode.attributes.length > 0){
        attributesString = tagNode.attributes.map( pair => {
            return `${pair.key}="${pair.value}"`
        }).join(' ');
        attributesString = ' ' + attributesString;
    }


    const childrenString = tagNode.children.map(n => formatNode(n)).join('');

    return `<${tagNode.name}${attributesString}>${childrenString}</${tagNode.name}>`
}

function formatTextNode(textNode: ast.TextNode): string {
    return textNode.value;
}

function formatCommentNode(commentNode: ast.CommentNode): string {
    return `<!-- ${commentNode.value} -->`
}
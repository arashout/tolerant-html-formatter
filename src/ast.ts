import * as cheerio from "cheerio";

interface AbstractNode {
    type: NodeTypes;
}

export enum NodeTypes {
    ROOT = 'root', // Wrapper to allow multiple top level nodes
    TAG = 'tag',
    TEXT = 'text',
    COMMENT = 'comment',
}

export type Node = RootNode | TagNode | TextNode | CommentNode

export interface RootNode extends AbstractNode {
    type: NodeTypes.ROOT;
    children: Node[];
}
export interface TagNode extends AbstractNode {
    type: NodeTypes.TAG;
    children: Node[];
    attributes: { key: string, value: string }[];
    name: string; // This cannot be an enum because of arbitary tag names
}

export interface TextNode extends AbstractNode {
    type: NodeTypes.TEXT;
    value: string;
}

export interface CommentNode extends AbstractNode {
    type: NodeTypes.COMMENT;
    value: string;
}

export interface Attribute {
    key: string;
    value: string;
}


function parserNodeToASTNode(pn: parser.Node): Maybe<Node> {
    switch (pn.type) {
        case 'tag':
            // Internal root element
            if (pn.name === NodeTypes.ROOT) {
                return {
                    type: NodeTypes.ROOT,
                    children: [],
                }
            } else {
                return {
                    type: NodeTypes.TAG,
                    name: pn.name,
                    children: [],
                    attributes: pn.attribs ? attributeMapToArray(pn.attribs) : [],
                };
            }
        case 'comment':
            return {
                type: NodeTypes.COMMENT,
                value: pn.data.trim() as string,
            };
        case 'text':
            let value = String.raw`${pn.data}`.replace(/^[ ]+|[ ]+$/g, '')
            if (value !== '' && value !== '\n') {
                // If it is pure whitespace node
                if(/^[\n\s]+$/g.test(value)){
                    // We get an extra newline on each text node which, we usually trim
                    // except in the case where the entire string is whitespace 
                    value = value.replace(' ', '').slice(0, -1);
                    return {
                        type: NodeTypes.TEXT,
                        value: value,
                    }
                } else {
                    return {
                        type: NodeTypes.TEXT,
                        value: value.trim(),
                    }
                }
            }
    }
}

/**
 * Converts a dictionary object into a ES6 Map
 * @param obj 
 */
function attributeMapToArray(obj: Dictionary<string>): Attribute[] {
    const attributeArray: Attribute[] = [];
    for (const key of Object.keys(obj)) {
        attributeArray.push({ key, value: obj[key] });
    }
    return attributeArray;
}

export function generateAST(htmlString: string): Maybe<Node> {
    function traverse(pe: any, parent?: TagNode) {
        const node = parserNodeToASTNode(pe);

        if (node) {
            if (parent) {
                parent.children.push(node)
            }

            if (pe.children) {
                // If it has children, it has to be a TagNode
                const tagNode = node as TagNode;
                for (let i = 0; i < pe.children.length; i++) {
                    const cpn = pe.children[i];
                    traverse(cpn, tagNode);
                }
            }
        }

        return node;
    };
    // Use our own root element to wrap everything! 
    // So it is possible to deal with multiple top-level nodes
    htmlString = `<root>\n${htmlString}\n</root>`;

    // Cheerio need to fix their types, ignoreWhitespace is valid!
    const $ = cheerio.load(htmlString, { ignoreWhitespace: false, xmlMode: true } as any);
    const rootCheerioElement = $("*").get()[0];
    return traverse(rootCheerioElement);
}


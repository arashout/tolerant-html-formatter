import * as cheerio from "cheerio";
import util from 'util';

interface AbstractNode {
    type: NodeTypes;
    lineInformation: LineInformation;
}

interface LineInformation {
    lineNumber: number;
    lineLength: number;
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


function cheerioElementToNode(ce: CheerioElement, htmlString: string): Maybe<Node> {
    const lineInfo = getLineInfo(ce, htmlString);
    switch (ce.type) {
        case 'tag':
            // Internal root element
            if (ce.name === NodeTypes.ROOT) {
                return {
                    type: NodeTypes.ROOT,
                    children: [],
                    lineInformation: lineInfo
                }
            } else {
                return {
                    type: NodeTypes.TAG,
                    name: ce.name,
                    children: [],
                    attributes: attributeMapToArray(ce.attribs),
                    lineInformation: lineInfo
                };
            }
        case 'comment':
            return {
                type: NodeTypes.COMMENT,
                value: ce.data as string,
                lineInformation: lineInfo
            };
        case 'text':
            const value = String.raw`${ce.data}`.trim();
            if (value !== '') {
                return {
                    type: NodeTypes.TEXT,
                    // Remove all leading spaces
                    value: value,
                    lineInformation: lineInfo
                }
            }
    }
}


function getLineInfo(cheerioElement: CheerioElement, htmlString: string): LineInformation {
    const startIndex = cheerioElement.startIndex || 0; // If no startIndex, it is the root
    const splits = htmlString.substr(0, startIndex).split('\n');

    return {
        lineNumber: splits.length - 1, // Subtract 1 because of internal root element
        lineLength: splits[splits.length - 1].length,
    };
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


export function generateAST(htmlString: string): Node {
    function traverse(ce: CheerioElement, parent?: TagNode) {
        const node = cheerioElementToNode(ce, htmlString);
        if (node) {
            if (parent) {
                parent.children.push(node)
            }

            if (ce.children) {
                // If it has children, it has to be a TagNode
                const tagNode = node as TagNode;
                for (const cce of ce.children) {
                    traverse(cce, tagNode);
                }
            }
        }

        return node || { type: NodeTypes.ROOT, children: [], lineInformation: { lineLength: 0, lineNumber: 0 } };
    };
    // Use our own root element to wrap everything! 
    // So it is possible to deal with multiple top-level nodes
    htmlString = `<root>\n${htmlString}\n</root>`;

    const $ = cheerio.load(htmlString, { withStartIndices: true, xmlMode: true });
    const rootCheerioElement = $("*").get()[0];
    return traverse(rootCheerioElement);
}


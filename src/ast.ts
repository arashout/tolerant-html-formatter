import * as cheerio from "cheerio";

interface AbstractNode {
    type: NodeTypes;
    lineInformation: LineInformation;
}

interface LineInformation {
    lineNumber: number;
    lineLength: number;
}

export enum NodeTypes {
    TAG = 'tag',
    TEXT = 'text',
    COMMENT = 'comment',
    NEWLINE = 'newline',
}

export type Node = TagNode | TextNode | CommentNode | NewlineNode;

export interface TagNode extends AbstractNode{
    type: NodeTypes.TAG;
    children: Node[];
    attributes: {key: string, value: string}[];
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

export interface NewlineNode extends AbstractNode {
    type: NodeTypes.NEWLINE;
    count: number;
}

export interface Attribute {
    key: string;
    value: string;
}


function cheerioElementToNode(ce: CheerioElement, htmlString: string): Node {
    const lineInfo = getLineInfo(ce, htmlString);
    if (ce.type === 'tag') {
        return {
            type: NodeTypes.TAG,
            name: ce.name,
            children: [],
            attributes: attributeMapToArray(ce.attribs),
            lineInformation: lineInfo
        };
    } else if (ce.type === 'comment') {
        return {
            type: NodeTypes.COMMENT,
            value: ce.data as string,
            lineInformation: lineInfo,
        };
    } else {
        return {
            type: NodeTypes.TEXT,
            value: ce.data as string,
            lineInformation: lineInfo
        };
    }
}

function getLineInfo(cheerioElement: CheerioElement, htmlString: string): LineInformation {
    const startIndex = cheerioElement.startIndex || 0; // If no startIndex, it is the root
    const splits = htmlString.substr(0, startIndex).split('\n');

    return {
        lineNumber: splits.length,
        lineLength: splits[splits.length - 1].length,
    };
}

/**
 * Function for debugging
 * @param ce 
 * @param htmlString 
 */
function printCheerioElement(ce: CheerioElement, htmlString: string): void {
    if (ce.name) {
        console.log('name', ce.name, ce.attribs, getLineInfo(ce, htmlString));
    } else {
        if (ce.data) {
            console.log('noname', ce.type, ce.data, getLineInfo(ce, htmlString));
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
        attributeArray.push({key, value: obj[key]});
    }
    return attributeArray;
}


export function generateAST(htmlString: string): Node {
    function traverse(ce: CheerioElement, parent?: TagNode) {

        const node = cheerioElementToNode(ce, htmlString);
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

        return node;
    };

    const $ = cheerio.load(htmlString, { withStartIndices: true, xmlMode: true });

    const cheerioElement = $("*").get();
    // This root element is guranteed to be a tag!
    /** 
     * TODO: Handle the case where comments are the first thing inside the document
     * Currently they are ignore
    **/
    const rootCheerioElement = cheerioElement[0];
    return traverse(rootCheerioElement);
}


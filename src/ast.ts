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


function parserNodeToASTNode(pn: parser.Node, htmlString: string): Maybe<Node> {
    switch (pn.type) {
        case 'tag':
            // Internal root element
            if (pn.name === NodeTypes.ROOT) {
                return {
                    type: NodeTypes.ROOT,
                    children: [],
                }
            } else {
                const attributes = pn.attribs ? attributeMapToArray(pn.attribs) : [];
                return {
                    type: NodeTypes.TAG,
                    name: pn.name,
                    children: [],
                    attributes
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
        const node = parserNodeToASTNode(pe, htmlString);

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
    // Also setting xmlMode removes automatic wrapping of html, body tags
    const $ = cheerio.load(htmlString, { 
        ignoreWhitespace: false, 
        xmlMode: true,
        withStartIndices: true,
        withEndIndices: true,
    } as CheerioOptionsInterface);
    const rootCheerioElement = $("*").get()[0];
    return traverse(rootCheerioElement);
}
// /**
//  * Exported for testing
//  * @param rawTagHTML 
//  */
// export function findDirectives(rawTagHTML: string): Attribute[] {
//     // Step 1: Squash all the white-space
//     const tagHTML = rawTagHTML.replace(/\s+/g, ' ');

//     // Step 2: Find the stuff just within the opening tag to make the problem easier
//     let isInsideQuotes = false;
//     let endOpeningTagIndex = 0;
//     for (let i = 0; i < tagHTML.length; i++) {
//         const c = tagHTML[i];

//         if(c === '>' && !isInsideQuotes){
//             endOpeningTagIndex = i;
//             break;
//         } else if(c === '"'){
//             isInsideQuotes = !isInsideQuotes;
//         }
//     }
//     const openingTagHTML = tagHTML.slice(0, endOpeningTagIndex + 1);

//     // Step 3: Find all the directives (words with spaces around them OR word with space at start and > at end)
//     const findDirectivesRegex = /(?:\s(\w+)\s)|(?:\s(\w+))>$/g
//     let match: RegExpExecArray | null;
//     const directives: Attribute[] = [];

//     while (match = findDirectivesRegex.exec(openingTagHTML)) {
//         // Caveat, the regex above also matches `class="flex btn primary"` the "btn" portion so I need to weed those out
//         let countQuotes = 0; // If there are an odd number of quotes we know we found a false positive
//         for (let i = match.index; i < openingTagHTML.length; i++) {
//             const c = openingTagHTML[i];
//             if(c === '"'){
//                 countQuotes++;
//             }
//         }
//         if(countQuotes % 2 === 0){
//             directives.push({key: match[1] || match[2], value: ''});
//         }
//     }
    
//     return directives;
// }
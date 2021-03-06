import * as cheerio from 'cheerio';

interface AbstractNode {
    type: NodeTypes;
}

export enum NodeTypes {
    ROOT = 'root', // Wrapper to allow multiple top level nodes
    TAG = 'tag',
    TEXT = 'text',
    COMMENT = 'comment',
    ATTRIBUTE = 'attribute'
}

export type Node = RootNode | TagNode | TextNode | CommentNode | AttributeNode;

export interface AttributeNode extends AbstractNode {
    type: NodeTypes.ATTRIBUTE;
    attributes: Attribute[];
}
export interface RootNode {
    type: NodeTypes.ROOT;
    children: Node[];
}
export interface TagNode {
    type: NodeTypes.TAG;
    children: Node[];
    attributeNode: AttributeNode; // Damn, man I hate this but I need it to make the TypeScript compiler happy
    name: string; // This cannot be an enum because of arbitary tag names
    raw: string;
}

export interface TextNode {
    type: NodeTypes.TEXT;
    value: string;
}

export interface CommentNode {
    type: NodeTypes.COMMENT;
    value: string;
}

export interface Attribute {
    key: string;
    value: string | null;
}

export type ParentNode = TagNode | RootNode;

function parserNodeToASTNode(pn: parser.Node, htmlString: string): Maybe<Node> {
    switch (pn.type) {
        case 'tag':
            // Internal root element
            if (pn.name === NodeTypes.ROOT) {
                return {
                    type: NodeTypes.ROOT,
                    children: [],
                };
            } else {
                // TODO: This slice might be expensive, might want to convert to an array to avoid copying new string?
                // const raw = htmlString.slice(pn.startIndex, (pn.endIndex as number) +1)
                const attributes = dictToArray(findDirectives(htmlString.slice(pn.startIndex, (pn.endIndex as number) +1), pn.attribs ? pn.attribs : {}));
                return {
                    type: NodeTypes.TAG,
                    name: pn.name,
                    children: [],
                    raw: htmlString.slice(pn.startIndex as number, pn.endIndex as number + 1),
                    attributeNode: {
                        type: NodeTypes.ATTRIBUTE,
                        attributes,
                    },
                };
            }
        case 'comment':
            return {
                type: NodeTypes.COMMENT,
                value: pn.data.trim() as string,
            };
        case 'text':
            let value = String.raw`${pn.data}`.replace(/^[ ]+|[ ]+$/g, '');
            if (value !== '' && value !== '\n') {
                // If it is pure whitespace node
                if (/^[\n\s]+$/g.test(value)) {
                    // We get an extra newline on each text node which, we usually trim
                    // except in the case where the entire string is whitespace
                    value = value.replace(' ', '').slice(0, -1);
                    return {
                        type: NodeTypes.TEXT,
                        value,
                    };
                } else {
                    return {
                        type: NodeTypes.TEXT,
                        value: value.trim(),
                    };
                }
            }
    }
}

/**
 * Converts a dictionary into an array of key value pairs
 * @param obj
 */
function dictToArray(obj: Dictionary<string | null>): Attribute[] {
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
                parent.children.push(node);
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
    }
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
    const rootCheerioElement = $('*').get()[0];
    return traverse(rootCheerioElement);
}

/**
 *
 * @param rawTagHTML
 * @param attributesMap
 */
export function findDirectives(rawTagHTML: string, attributesMap: Dictionary<string>): Dictionary<string | null> {
    // Step 1: Squash all the white-space
    const tagHTML = rawTagHTML.replace(/\s+/g, ' ');

    // Step 2: Find the stuff just within the opening tag to make the problem easier
    let isInsideQuotes = false;
    let endOpeningTagIndex = 0;
    for (let i = 0; i < tagHTML.length; i++) {
        const c = tagHTML[i];

        if (c === '>' && !isInsideQuotes) {
            endOpeningTagIndex = i;
            break;
        } else if (c === '"') {
            isInsideQuotes = !isInsideQuotes;
        }
    }
    const openingTagHTML = tagHTML.slice(0, endOpeningTagIndex + 1);

    // Step 3: Find all the directives (words with spaces around them OR word with space at start and > at end)
    const findDirectivesRegex = /(?:\s([-\w]+)\s)|(?:\s([-\w]+))>$/g;
    const newAttributesMap: Dictionary<string | null> = Object.assign({}, attributesMap);

    while (true) {
        const match = findDirectivesRegex.exec(openingTagHTML);
        if (match === null) {
            break;
        }
        // Caveat, the regex above also matches `class="flex btn primary"` the "btn" portion so I need to weed those out
        let countQuotes = 0; // If there are an odd number of quotes we know we found a false positive
        for (let i = match.index; i < openingTagHTML.length; i++) {
            const c = openingTagHTML[i];
            if (c === '"') {
                countQuotes++;
            }
        }
        if (countQuotes % 2 === 0) {
            const key = match[1] || match[2];
            newAttributesMap[key] = null; // Null indicates a directive!
        }
    }
    return newAttributesMap;
}

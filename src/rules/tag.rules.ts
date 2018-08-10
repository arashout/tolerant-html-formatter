import { TagNode, NodeTypes } from "../ast";
import { RuleTypes, TagRule, FormatNode, applyFirstRule, indentString, emptyStringFunc, INDENT_SIZE } from "./rules";

import { attributeRules } from "./attributes.rules";
import { cleanStringHTML } from "../util";

// https://www.w3.org/TR/html/syntax.html#writing-html-documents-elements
const voidElements = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
];

export const tagRules: TagRule[] = [
    {
        type: RuleTypes.TAG_RULE,
        name: 'voidTag',
        shouldApply(tn: TagNode): boolean {
            return voidElements.indexOf(tn.name) !== -1;
        },
        apply(tn: TagNode, indent: number, _: FormatNode): string {
            const attributesString = applyFirstRule(attributeRules, tn.attributes, indent, emptyStringFunc);
            return indentString(`<${tn.name}${attributesString}>\n`, indent);
        },
        tests: [
            {
                actualHTML: `<input a="whatAnAttribute">`,
                expectedHTML: `<input a="whatAnAttribute">`,
                description: "do not screw up simple input tag"
            },
            {
                actualHTML: `<input a="whatAnAttribute" b="2" c="3">`,
                expectedHTML: cleanStringHTML(`
                <input a="whatAnAttribute"
                  b="2"
                  c="3">`),
                description: "do not screw up more complicated input tag"
            },
        ]
    },
    {
        type: RuleTypes.TAG_RULE,
        name: 'simpleTag',
        shouldApply(tn: TagNode): boolean {
            return tn.children.length === 0;
        },
        apply(tn: TagNode, indent: number, _: FormatNode): string {
            const attributesString = applyFirstRule(attributeRules, tn.attributes, indent, emptyStringFunc);
            return indentString(`<${tn.name}${attributesString}></${tn.name}>\n`, indent);
        },
        tests: [
            {
                actualHTML: `<div a="whatAnAttribute"></div><div></div>`,
                expectedHTML: `<div a="whatAnAttribute"></div>\n<div></div>`,
                description: "2 simple tags"
            },
        ]
    },
    {
        type: RuleTypes.TAG_RULE,
        name: 'singleTextChildTag',
        shouldApply(tn: TagNode): boolean {
            return tn.children.length === 1 && tn.children[0].type === NodeTypes.TEXT;
        },
        apply(tn: TagNode, indent: number, cb: FormatNode): string {
            const attributesString = applyFirstRule(attributeRules, tn.attributes, indent, emptyStringFunc);
            const childrenString = tn.children.map(n => cb(n, indent + INDENT_SIZE)).join('');
            return indentString(`<${tn.name}${attributesString}>${childrenString}</${tn.name}>\n`, indent);
        },
        tests: [
            {
                actualHTML: `<div a="1">This is text</div>`,
                expectedHTML: `<div a="1">This is text</div>`,
                description: "simple text node"
            },
            // TODO: What should the behavior be here? 
            // Should I be replacing newlines or is that disregarding what the author intended?
            {
                actualHTML: `<div a="1">\nThis\nis text\n</div>`,
                expectedHTML: `<div a="1">\nThis\nis text\n</div>`,
                description: "screw up simple text node"
            },
        ]
    },
    {
        type: RuleTypes.TAG_RULE,
        name: 'defaultTag',
        shouldApply: (_: TagNode): boolean => true,
        apply: (tn: TagNode, indent: number, cb: FormatNode): string => {
            const attributesString = applyFirstRule(attributeRules, tn.attributes, indent, emptyStringFunc);
            const childrenString = tn.children.map(n => cb(n, indent + INDENT_SIZE)).join('');

            const openingTagString = indentString(`<${tn.name}${attributesString}>`);
            const closingTagString = indentString(`</${tn.name}>\n`)
            return `${openingTagString}\n${childrenString}${closingTagString}`;
        },
        tests: [
            // TODO: This one is completely broken
            {
                actualHTML: `<div a="1"><p>Hello <span>Goodbye</span></p></div>`,
                expectedHTML: cleanStringHTML(`
                <div a="1">
                  <p>Hello <span>Goodbye</span></p>
                </div>`),
                description: "default print"
            },
        ]
    },
];


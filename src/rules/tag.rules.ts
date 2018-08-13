import { TagNode, NodeTypes } from "../ast";
import { RuleTypes, TagRule, FormatNode, applyFirstRule, indentString, emptyStringFunc, INDENT_SIZE, MAX_LINE_LENGTH, RuleTrace } from "./rules";

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

// TODO: These rules will be the biggest, how can I avoid this? Should I sub-group by tag Name?
export const tagRules: TagRule[] = [
    {
        type: RuleTypes.TAG_RULE,
        name: 'voidTag',
        shouldApply(tn: TagNode): boolean {
            return voidElements.indexOf(tn.name) !== -1;
        },
        apply(tn: TagNode, indent: number, _: FormatNode, ruleTraces: RuleTrace[]): string {
            const attributesString = applyFirstRule(attributeRules, tn.attributes, indent, emptyStringFunc, ruleTraces);
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
        apply(tn: TagNode, indent: number, _: FormatNode, ruleTraces: RuleTrace[]): string {
            const attributesString = applyFirstRule(attributeRules, tn.attributes, indent, emptyStringFunc, ruleTraces);
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
        apply(tn: TagNode, indent: number, cb: FormatNode, ruleTraces: RuleTrace[]): string {
            const attributesString = applyFirstRule(attributeRules, tn.attributes, indent, emptyStringFunc, ruleTraces);
            let childrenString = cb(tn.children[0], 0, ruleTraces);
            const formattedString = indentString(`<${tn.name}${attributesString}>${childrenString}</${tn.name}>\n`, indent);
            // Q: I have a feeling I'm going to repeat this chunk of code a bunch, should I wrap it somehow?
            if(formattedString.length <= MAX_LINE_LENGTH){
                return formattedString;
            } else {
                // Indent all the strings
                const startTag = indentString(`<${tn.name}${attributesString}>\n`, indent);
                childrenString = indentString(childrenString + '\n', indent + INDENT_SIZE);
                const endTag = indentString(`</${tn.name}>\n`, indent);
                return startTag + childrenString + endTag;
            }
        },
        tests: [
            {
                actualHTML: `<div a="1">This is text</div>`,
                expectedHTML: `<div a="1">This is text</div>`,
                description: "simple text node"
            },
            // Q: What should the behavior be here? Should I be replacing newlines or is that disregarding what the author intended?
            {
                actualHTML: `<div a="1">\nThis\nis text\n</div>`,
                expectedHTML: `<div a="1">\nThis\nis text\n</div>`,
                description: "screw up simple text node"
            },
            {
                actualHTML: `<div a="1">Super long stringggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg</div>`,
                expectedHTML: cleanStringHTML(`<div a="1">\n  Super long stringggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg\n</div>`),
                description: "break text node onto a new line"
            },
        ]
    },
    {
        type: RuleTypes.TAG_RULE,
        name: 'defaultTag',
        shouldApply: (_: TagNode): boolean => true,
        apply: (tn: TagNode, indent: number, cb: FormatNode, ruleTraces: RuleTrace[]): string => {
            const attributesString = applyFirstRule(attributeRules, tn.attributes, indent, emptyStringFunc, ruleTraces);
            const childrenString = tn.children.map(n => cb(n, indent + INDENT_SIZE, ruleTraces)).join('');

            const startTag = indentString(`<${tn.name}${attributesString}>`, indent);
            const endTag = indentString(`</${tn.name}>`, indent)

            return `${startTag}\n${childrenString}${endTag}\n`;
        },
        tests: [
            // TODO: Nice finally getting somewhere!
            {
                actualHTML: `<button ng-click="$ctrl.openTagForm()" ff-show=">developer" class="flex btn btn-primary mt2"
                style="white-space: nowrap;">Create Tag</button>`,
                expectedHTML: cleanStringHTML(`
                <button ng-click="$ctrl.openTagForm()"
                  ff-show=">developer"
                  class="flex btn btn-primary mt2"
                  style="white-space: nowrap;">
                  Create Tag
                </button>`),
                description: "default print"
            },
        ]
    },
];


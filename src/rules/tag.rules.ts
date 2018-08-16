import { NodeTypes, TagNode } from '../ast';
import { INDENT_SIZE, MAX_LINE_LENGTH } from '../config';
import { applyFirstRule, indentString, RuleType, TagRule, IRule } from './rules';

import { cleanStringHTML, squashWhitespace } from '../common/util';
import { attributeRules } from './attributes.rules';
import { formatNode } from '../common/format';
import { textRules } from './text.rules';
import { traceWrapper } from './rule-trace.service';

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
    // {
    //     type: RuleTypes.TAG_RULE,
    //     name: 'pre',
    //     shouldApply(tn: TagNode): boolean {
    //         return tn.name === 'pre';
    //     },
    //     apply(tn: TagNode, indent: number): string {
    //         const attributesString = applyFirstRule(attributeRules, tn.attributes, indent, tn);
    //         return tn.raw + '\n';
    //     },
    //     tests: [
    //     ],
    // },
    {
        type: RuleType.TAG_RULE,
        name: 'voidTag', // https://stackoverflow.com/a/10599002/5258887
        shouldApply(tn: TagNode): boolean {
            return voidElements.indexOf(tn.name) !== -1;
        },
        apply(tn: TagNode, indent: number): string {
            const attributesString = applyFirstRule(attributeRules, tn.attributeNode, indent, tn);
            return indentString(`<${tn.name}${attributesString}/>`, indent) + '\n';
        },
        tests: [
            {
                actualHTML: `<input a="whatAnAttribute">`,
                expectedHTML: `<input a="whatAnAttribute"/>`,
                description: 'do not screw up simple input tag',
            },
            {
                actualHTML: `<input a="whatAnAttribute" b="2" c="3">`,
                expectedHTML: cleanStringHTML(`
                <input
                  a="whatAnAttribute"
                  b="2"
                  c="3"/>`),
                description: 'do not screw up more complicated input tag',
            },
        ],
    },
    {
        type: RuleType.TAG_RULE,
        name: 'simpleTag',
        shouldApply(tn: TagNode): boolean {
            return tn.children.length === 0;
        },
        apply(tn: TagNode, indent: number): string {
            const attributesString = applyFirstRule(attributeRules, tn.attributeNode, indent, tn);
            return indentString(`<${tn.name}${attributesString}></${tn.name}>`, indent) + '\n';
        },
        tests: [
            {
                actualHTML: `<div a="whatAnAttribute"></div><div></div>`,
                expectedHTML: `<div a="whatAnAttribute"></div>\n<div></div>`,
                description: '2 simple tags',
            },
        ],
    },
    {
        type: RuleType.TAG_RULE,
        name: 'singleTextChildTag',
        shouldApply(tn: TagNode): boolean {
            return tn.children.length === 1 && tn.children[0].type === NodeTypes.TEXT;
        },
        apply(tn: TagNode, indent: number): string {
            const attributesString = applyFirstRule(attributeRules, tn.attributeNode, indent, tn);
            let text = formatNode(tn.children[0], 0, tn);

            // TODO: Should I be counting indentation?
            const singleLineResult = indentString(`<${tn.name}${attributesString}>${squashWhitespace(text)}</${tn.name}>`, indent);
            if (singleLineResult.length <= MAX_LINE_LENGTH) {
                return singleLineResult + '\n';
            } else {
                // Indent all the strings
                const startTag = indentString(`<${tn.name}${attributesString}>\n`, indent);
                text = indentString(text + '\n', indent + INDENT_SIZE);
                const endTag = indentString(`</${tn.name}>`, indent);
                return startTag + text + endTag + '\n';
            }
        },
        tests: [
            {
                actualHTML: `<div a="1">This is text</div>`,
                expectedHTML: `<div a="1">This is text</div>`,
                description: 'simple text node',
            },
            {
                actualHTML: `<div a="1">Super long stringggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg</div>`,
                expectedHTML: cleanStringHTML(`<div a="1">\n  Super long stringggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg\n</div>`),
                description: 'break text node onto a new line',
            },
            {
                actualHTML: `<i>icon\nWith Newline\n What Happens</i>`,
                expectedHTML: `<i>icon With Newline What Happens</i>`,
                description: 'squash multiple lines into single lines if we can',
            },
        ],
    },
    {
        type: RuleType.TAG_RULE,
        name: 'defaultTag',
        shouldApply: (_: TagNode): boolean => true,
        apply: (tn: TagNode, indent: number): string => {
            const attributesString = applyFirstRule(attributeRules, tn.attributeNode, indent, tn);
            const childrenString = tn.children.map((n) => {
                if(n.type === NodeTypes.TEXT){
                    return textRules[0].apply(n, indent + INDENT_SIZE);
                } else {
                    return formatNode(n, indent + INDENT_SIZE, tn);
                }
            }).join('');

            const startTag = indentString(`<${tn.name}${attributesString}>`, indent);
            const endTag = indentString(`</${tn.name}>`, indent);

            return `${startTag}\n${childrenString}${endTag}\n`;
        },
        tests: [
            {
                actualHTML: `<button ng-click="$ctrl.openTagForm()"
                ff-show=">developer" class="flex btn btn-primary mt2"
                style="white-space: nowrap;">Create Tag</button>`,
                expectedHTML: cleanStringHTML(`
                <button
                  ng-click="$ctrl.openTagForm()"
                  ff-show=">developer"
                  class="flex btn btn-primary mt2"
                  style="white-space: nowrap;">
                  Create Tag
                </button>`),
                description: 'default print',
            },
        ],
    },
].map( r  => traceWrapper(r as IRule)) as TagRule[];

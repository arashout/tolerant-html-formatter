import { Attribute } from "../ast";
import { RuleTypes, AttributeRule, indentString } from "./rules";
import { INDENT_SIZE } from '../config';
import { cleanStringHTML } from "../util";

function attributeToString(attribute: Attribute): string {
    return attribute.value === '' ? attribute.key : `${attribute.key}="${attribute.value}"`;
}

export const attributeRules: AttributeRule[] = [
    {
        type: RuleTypes.ATTRIBUTE_RULE,
        name: 'attributesOneLine',
        shouldApply: (attributes: Attribute[]): boolean => attributes.length < 3,
        apply: (attributes: Attribute[], _: number): string => {
            if (attributes.length === 0) {
                return '';
            }

            return ' ' + attributes.map(a => attributeToString(a)).join(' ');
        },
        tests: [
            {
                actualHTML: `<div 
                a="1" 
                b></div>`,
                expectedHTML: `<div a="1" b></div>`,
                description: 'all attributes should be on the same line'
            }
        ]
    },
    {
        type: RuleTypes.ATTRIBUTE_RULE,
        name: 'attributePerLine',
        shouldApply: (_: Attribute[]): boolean => true,
        apply: (attributes: Attribute[], indent: number): string => {
            let attributeString = '';
            for (let i = 0; i < attributes.length; i++) {
                let pair = attributeToString(attributes[i]);
                
                if(i === attributes.length -1){
                    attributeString += `\n${indentString(pair, indent + INDENT_SIZE)}`
                } else {
                    attributeString += `\n${indentString(pair, indent + INDENT_SIZE)}`
                }
                
            }
            return attributeString;
        }, 
        tests: [
            {
                actualHTML: `<div a="1" b="2" c="3" d class="flex btn button"></div>`,
                expectedHTML: cleanStringHTML(`
                    <div
                      a="1"
                      b="2"
                      c="3"
                      d
                      class="flex btn button"></div>
                    `),
                description: 'should have 1 attribute per line'
            }
        ]
    },
];
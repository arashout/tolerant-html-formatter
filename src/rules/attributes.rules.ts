import { Attribute } from "../ast";
import { RuleTypes, AttributeRule, indentString } from "./rules";
import { INDENT_SIZE } from '../config';
import { cleanStringHTML } from "../util";



export const attributeRules: AttributeRule[] = [
    {
        type: RuleTypes.ATTRIBUTE_RULE,
        name: 'attributesOneLine',
        shouldApply: (attributes: Attribute[]): boolean => attributes.length < 3,
        apply: (attributes: Attribute[], _: number): string => {
            if (attributes.length === 0) {
                return '';
            }

            return ' ' + attributes.map(attribute => `${attribute.key}="${attribute.value}"`).join(' ');
        },
        tests: [
            {
                actualHTML: `<div 
                a="1" 
                b="2"></div>`,
                expectedHTML: `<div a="1" b="2"></div>`,
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
                const attribute = attributes[i];
                let pair = `${attribute.key}="${attribute.value}"`;
                
                if(i === 0){
                    attributeString += ` ${pair}\n`
                } else if(i === attributes.length -1){
                    attributeString += `${indentString(pair, indent + INDENT_SIZE)}`
                } else {
                    attributeString += `${indentString(pair, indent + INDENT_SIZE)}\n`
                }
                
            }
            return attributeString;
        }, 
        tests: [
            {
                actualHTML: `<div a="1" b="2" c="3"></div>`,
                expectedHTML: cleanStringHTML(`
                    <div a="1"
                      b="2"
                      c="3"></div>
                    `),
                description: 'should have 1 attribute per line'
            }
        ]
    },

];
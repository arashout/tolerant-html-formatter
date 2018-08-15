import { Attribute } from "../ast";
import { RuleTypes, AttributeRule, indentString, Rule, emptyStringFunc } from "./rules";
import { INDENT_SIZE, MAX_LINE_LENGTH } from '../config';
import { cleanStringHTML } from "../util";

function attributeToString(attribute: Attribute): string {
    return attribute.value === '' ? attribute.key : `${attribute.key}="${attribute.value}"`;
}

export const attributeRules: AttributeRule[] = [
    {
        type: RuleTypes.ATTRIBUTE_RULE,
        name: 'sameLine',
        shouldApply: function(this: AttributeRule, attributes: Attribute[], indent?: number):boolean{
            const formattedString = this.apply(attributes, indent || INDENT_SIZE, emptyStringFunc, []);
            // TODO: Going to have to ask Crob about how exactly he wants the attributes to behave
            // console.log(formattedString);
            // console.log(formattedString.length);
            return attributes.length < 3;
        },
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
        ],
    },
    {
        type: RuleTypes.ATTRIBUTE_RULE,
        name: 'onePerLineTwo',
        shouldApply: function(attributes: Attribute[]):boolean{
            return attributes.length === 2;
        },
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
        ],
    },
    {
        type: RuleTypes.ATTRIBUTE_RULE,
        name: 'onePerLine',
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
        ],
    },
]
import { findDirectives } from "./ast";

const testTable: {
    html: string, 
    attributeMap: Dictionary<string>,
    expected: Dictionary<string | null>}[] = [
    {
        html: `<div a="1" b="2" c="3" d class="flex btn button"></div>`,
        attributeMap: {a:"1", b:"2", c:"3", d: "", class:"flex btn button"},
        expected: {a:"1", b:"2", c:"3", d:null, class:"flex btn button"}
    },
    {
        html: `<div a="1" b="2" c="" d></div>`,
        attributeMap: {a:"1", b:"2", c:"", d:""},
        expected: {a:"1", b:"2", c:"", d:null}
    },
    {
        html:`<div single-attribute-though-it-is-very-long-oh-yes-it-is-very-long-oh-deary-me></div>`,
        attributeMap: {'single-attribute-though-it-is-very-long-oh-yes-it-is-very-long-oh-deary-me': ''},
        expected: {'single-attribute-though-it-is-very-long-oh-yes-it-is-very-long-oh-deary-me': null},
    }
];

test('test-findDirectives', ()=>{
    for (const testCase of testTable) {
        expect(findDirectives(testCase.html, testCase.attributeMap)).toEqual(testCase.expected);
    }
})

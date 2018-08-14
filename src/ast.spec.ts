import { findDirectives } from './ast';

// TODO: Add the button test to this
const testTable = [
    {
        html: `<div abc="<>2" at b="4" at1 d="fsda" at2>
        <div at3></div>
        </div>`,
        expected: [
            {key: 'at', value: ''},
            {key: 'at1', value: ''},
            {key: 'at2', value: ''},
        ]
    }
]

for (const testCase of testTable) {
    test(`directive`, () => {
        expect(findDirectives(testCase.html)).toEqual(testCase.expected);
    })
}
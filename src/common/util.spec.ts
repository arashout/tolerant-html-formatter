import { squashNewlines } from "./util";

const testCases = [
    {
        actual: '\n\nBlah\n\n',
        options: {trailing: true},
        expected: '\n\nBlah\n',
    },
];

test('test-util-squashNewlines', () => {
    for (const testCase of testCases) {
        expect(squashNewlines(testCase.actual, testCase.options)).toBe(testCase.expected);
    }
})
export function assertNever(x: never): never {
    throw new Error('Unexpected object: ' + x);
}

type stringFunc =  (s: string) => string; // LOL
/**
 * Function that removes hanging indentation off of HTML
 * made with string templates, and trims the leading/trailing newlines
 * @param s
 */
export function cleanStringHTML(s: string): string {
    const stripIndent: stringFunc = require('strip-indent');
    return stripIndent(s).trim();
}

export function squashWhitespace(s: string): string {
    return s.replace(/[\n\s]+/g, ' ');
}

export function squashNewlines(s: string, options: {leading?: boolean, trailing?: boolean}): string {
    if(!options.leading && !options.trailing){
        return s.replace(/^\n+/, '\n').replace(/\n+$/, '\n')
    }
    if (options.leading){
        s = s.replace(/^\n+/, '\n');
    }
    if (options.trailing){
        s = s.replace(/\n+$/, '\n');
    }
    return s;
}
import * as fs from 'fs';
import * as path from 'path';

import { Printer } from '../printer';
import { assertNever } from '../common/util';

const integrationDir = path.resolve(__dirname, 'integration/');
const fileNames = fs.readdirSync(integrationDir);
const baseFileNames = fileNames
    .map( (fn) => fn.split('-')[1])
    .filter( (fn) => fn.endsWith('.html'))
    .filter( (fn, i, a) => a.indexOf(fn) === i);

type filePrefixes = 'source-' | 'output-' | 'actual-';

const baseTestPath = path.resolve(__dirname, 'integration');

for (const baseName of baseFileNames) {
    const sourceHTML = fs.readFileSync(getFilePath('source-', baseName, 'html'), {encoding: 'utf8'});
    const expectedHTML = fs.readFileSync(getFilePath('output-', baseName, 'html'), {encoding: 'utf8'});

    test(`test-integration-${baseName}`, () => {
        // Get rid of previous debugging files
        try {
            fs.unlink(getFilePath('actual-', baseName, 'html'), ()=>null);
            fs.unlink(getFilePath('actual-', baseName, 'rule-traces'),()=>null);
            fs.unlink(getFilePath('actual-', baseName, 'ast'), ()=>null);
        } catch (_) {}

        const printer  = new Printer();
        const result = printer.run(sourceHTML);
        // Ugly workaround for getting on fail debugging information
        if (result.output !== expectedHTML) {
            fs.writeFileSync(getFilePath('actual-', baseName, 'html'), result.output);
            fs.writeFileSync(
                getFilePath('actual-', baseName, 'rule-traces'),
                JSON.stringify({ ruleTraces: result.ruleTraces }, null, 2),
            );
            fs.writeFileSync(
                getFilePath('actual-', baseName, 'ast'),
                JSON.stringify(result.astNode, null, 2),
            );
        }
        expect(result.output).toBe(expectedHTML);
    });
}

function getFilePath(
    prefix: filePrefixes,
    baseName: string,
    contentType: 'ast' | 'rule-traces' | 'html',
): string {
        // Exhaustive switch works with nested switch statements!
        switch (prefix) {
            case 'actual-':
                switch (contentType) {
                    case 'html':
                        return path.resolve(baseTestPath, `${prefix}${baseName}`);
                    case 'ast':
                        return path.resolve(baseTestPath, `${prefix}ast-${path.basename(baseName, '.html') + '.json'}`);
                    case 'rule-traces':
                        return path.resolve(baseTestPath, `${prefix}rt-${path.basename(baseName, '.html') + '.json'}`);
                    default:
                        return assertNever(contentType);
                }
            case 'output-':
                return path.resolve(baseTestPath, `${prefix}${baseName}`);
            case 'source-':
                return path.resolve(baseTestPath, `${prefix}${baseName}`);
            default:
                return assertNever(prefix);
        }
}

import * as path from 'path';
import * as fs from 'fs';

import { generateAST } from "../ast";
import { formatNode, Printer } from "../printer";

import { RuleTrace } from "../rules/rules";
import { prettifyRuleTraces } from '../util';

const integrationDir = path.resolve(__dirname, 'integration/')
const fileNames = fs.readdirSync(integrationDir);
const baseFileNames = fileNames
    .map( fn => fn.split('-')[1])
    .filter( fn => fn.endsWith('.html'))
    .filter( (fn, i, a) => a.indexOf(fn) === i);

const sourcePrefix = 'source-';
const expectedPrefix = 'output-';
const actualPrefix = 'actual-';
const basePath = path.resolve(__dirname,'integration');

for(const baseName of baseFileNames){
    const sourceHTML = fs.readFileSync(path.resolve(__dirname, 'integration', `${sourcePrefix}${baseName}`), {encoding:'utf8'});
    const expectedHTML = fs.readFileSync(path.resolve(__dirname, 'integration', `${expectedPrefix}${baseName}`), {encoding:'utf8'});

    test(`test-integration-${baseName}`, ()=> {
        // TODO: Probably should clean this up
        // Get rid of previous debugging files
        try {
            fs.unlinkSync(path.resolve(basePath, `${actualPrefix}${baseName}`));
            fs.unlinkSync(path.resolve(basePath,`${actualPrefix}rt-${path.basename(baseName,'.html') + '.json'}`));
            fs.unlinkSync(path.resolve(basePath,`${actualPrefix}ast-${path.basename(baseName,'.html') + '.json'}`));
        } catch (_) {}

        const printer  = new Printer();
        const result = printer.run(sourceHTML);
        // Ugly workaround for getting on fail debugging information
        if(result.output !== expectedHTML){
            fs.writeFileSync(path.resolve(__dirname,'integration',`${actualPrefix}${baseName}`), result.output);
            fs.writeFileSync(
                path.resolve(basePath,`${actualPrefix}rt-${path.basename(baseName,'.html') + '.json'}`), 
                JSON.stringify({ ruleTraces: prettifyRuleTraces(result.ruleTraces) }, null, 2)
            );
            fs.writeFileSync(
                path.resolve(basePath,`${actualPrefix}ast-${path.basename(baseName,'.html') + '.json'}`), 
                JSON.stringify(result.astNode, null, 2)
            );
        }
        expect(result.output).toBe(expectedHTML);
    })
}

// function getFilePath(
//     type: 'actual' | 'expected' | 'source', 
//     contentType: 'ast' | 'rule-traces' | 'html'): string {
    

// }
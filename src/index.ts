import * as fs from 'fs';
import * as path from 'path'
import globby from 'globby';

import * as util from 'util';

import { generateAST } from './ast';
import { formatNode, Printer } from './printer';
import { RuleTrace } from './rules/rules';
import { prettifyRuleTraces } from './util';


const htmlString: string = fs.readFileSync('src/tests/integration/b.html', 'utf8');

const rootNode = generateAST(htmlString);
const ruleTraces: RuleTrace[] = [];
if (rootNode) {
    fs.writeFileSync('out_ast.json', JSON.stringify(rootNode, null, 2));
    fs.writeFileSync('out.html', formatNode(rootNode, 0, ruleTraces));
    fs.writeFileSync('out_ruletraces.json', JSON.stringify({ ruleTraces: prettifyRuleTraces(ruleTraces) }, null, 2));
    console.log('Results printed out to out files');
}
else {
    console.error('Unable to parse HTML!');
}

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

interface CLIOptions {
    overwrite: boolean;
    debug: boolean;
}
export class HTMLFormatter {
    async run(input: string, options: CLIOptions) {
        const paths = await globby(input);
        const tasks = [];

        for (let i = 0; i < paths.length; ++i) {
            const t = readFileAsync(paths[i], { encoding: 'utf8' }).then(source => {
                console.log(path.relative(__dirname, paths[i]));

                const result = new Printer().run(source);
                if (result.output === '') {
                    console.error('Could not parse HTML from: ' + path);
                } else {
                    return this.writeFile(paths[i], result.output, options.overwrite);
                }

            });

            tasks.push(t);
        }

        return Promise.all(tasks).then(() => {
            console.log('✨  Done!');
        });
    }

    private writeFile(writePath: string, content: string, overwrite: boolean): Promise<void> {
        let p: string;

        if (overwrite) {
            p = writePath;
        } else {
            p = path.resolve(path.dirname(writePath), 'out_' + path.basename(writePath));
        }

        return writeFileAsync(p, content);
    }
}
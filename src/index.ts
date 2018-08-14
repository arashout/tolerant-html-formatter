import * as fs from 'fs';
import * as path from 'path'
import globby from 'globby';

import * as util from 'util';

import { Printer } from './printer';
import { prettifyRuleTraces } from './util';

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

interface CLIOptions {
    overwrite: boolean;
    debug: boolean;
}
export class HTMLFormatter {
    async run(input: string, options: CLIOptions) {
        const paths = await globby(input);
        const tasks: Promise<void>[] = [];

        for (const currentPath of paths) {
            await readFileAsync(currentPath, { encoding: 'utf8' }).then(source => {
                console.log('Reading HTML from: ', path.relative(__dirname, currentPath));

                const result = new Printer().run(source);
                if (result.output === '') {
                    console.error('Could not parse HTML from: ' + currentPath);
                } else {
                    // TODO: Should these in a method (Had a hard time coming up with a good name)
                    if (options.overwrite) {
                        tasks.push(writeFileAsync(currentPath, result.output));
                    } else {
                        const p = path.resolve(path.dirname(currentPath), 'out_' + path.basename(currentPath));
                        tasks.push(writeFileAsync(p, result.output));
                    }

                    if (options.debug) {
                        let p = path.resolve(path.dirname(currentPath), 'out_rt_' + path.basename(currentPath,'.html') + '.json');
                        tasks.push(writeFileAsync(p, JSON.stringify({ ruleTraces: prettifyRuleTraces(result.ruleTraces) }, null, 2)));

                        p = path.resolve(path.dirname(currentPath), 'out_ast_' + path.basename(currentPath,'.html') + '.json');
                        tasks.push(writeFileAsync(p, JSON.stringify(result.astNode, null, 2)));

                    }

                }

            })
                .catch(reason => {
                    console.error('Failed to read file: ' + reason);
                })
        }

        return Promise.all(tasks).then(() => {
            console.log('✨  Done!');
        });
    }
}
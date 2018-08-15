import cmd from 'commander';
import { HTMLFormatter } from '.';
const pj = require('../package.json');
console.log(pj.version);

export function run(args: string[]) {
    cmd
        .version(pj.version, '-v, --version')
        .arguments('<input>')
        .option('-w, --write', 'rewrites all processed files in place')
        .option('-d, --debug', 'also outputs rule traces')
        .action((input: string, options: any) => {
            new  HTMLFormatter().run(input, options);
        });

    cmd.parse(args);
}

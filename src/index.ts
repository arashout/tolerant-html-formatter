import fs = require('fs');
import util from 'util';

import { generateAST } from './ast';
import { formatNode } from './printer';
import { RuleTrace } from './rules/rules';
import { prettifyRuleTraces } from './util';


const htmlString: string = fs.readFileSync('src/tests/integration/b.html', 'utf8');

const rootNode = generateAST(htmlString);
const ruleTraces: RuleTrace[] = [];
fs.writeFileSync('out_ast.json', JSON.stringify(rootNode, null, 2));
fs.writeFileSync('out.html', formatNode(rootNode, 0, ruleTraces));
fs.writeFileSync('out_ruletraces.json', JSON.stringify({ruleTraces: prettifyRuleTraces(ruleTraces)}, null, 2));
import fs = require('fs');
import util from 'util';

import { generateAST } from './ast';
import { formatNode } from './printer';


const htmlString: string = fs.readFileSync('tests/a.html', 'utf8');

const rootNode = generateAST(htmlString);
// console.log(util.inspect(rootNode, false, null));


console.log(formatNode(rootNode));
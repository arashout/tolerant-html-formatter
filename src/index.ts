import fs = require('fs');
import util from 'util';

import { generateAST } from './ast';
import { formatNode } from './printer';


const htmlString: string = fs.readFileSync('src/tests/integration/b.html', 'utf8');

const rootNode = generateAST(htmlString);

fs.writeFileSync('out.html', formatNode(rootNode, 0));
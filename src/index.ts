import fs = require('fs');
import util from 'util';

import { generateAST } from './ast';
import { formatNode } from './printer';


const htmlString: string = fs.readFileSync('tests/actual/a.html', 'utf8');

const rootNode = generateAST(htmlString);
// console.log(util.inspect(rootNode, false, null));


fs.writeFileSync('out.html', formatNode(rootNode, 0));

const testsActualDir = './tests/actual';
const testsExpectedDir = '.'
fs.readdirSync(testsActualDir).forEach(file => {
    console.log(file);
})
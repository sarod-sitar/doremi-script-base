#!/usr/bin/env node
fs=require('fs');
require('./sargam_parser.js')
parser=SargamParser
x=parser.parse(fs.readFileSync('/dev/stdin').toString())
process.stdout.write(sys.inspect(x,false,null))

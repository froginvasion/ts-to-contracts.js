ts-to-contracts.js
==================

#Introduction
This is a work in progress.
To explain what it actually does: I expanded the esprima parser to accept Typescript syntax and parse it to a format so that I have enough information in order to know what it means. Then I use falafel to operate a transformation on that AST source code. Since the parser holds ranges in it's AST, we don't need to actually regenerate the code, which would also mean adapting a generator. Instead, we use falafel to update the source code and transform it to our liking.

The goal is to transform Typescript to Javascript with contracts applied.

#Installing
* Run `npm install`

#Usage
To transform a Typescript file to a contracted JavaScript file, do the following
* `./bin/ts-to-contracts [path-to-typescript-file].ts (-m [modulename])`

Now a `js` file is created in the same location. 
Options:
* -m [modulename] 
The `-m` option assumes an external typescript module. I.e. it will try to `require` the module, and then export a contracted version of the library.

##Run in node.js
Either use one of the following options to run the file in node.
* `./bin/node file.js`

or

* `node --harmony_proxies --harmony-collections file.js`

##Run in browser

To run the file in the browser, you will need to add [contracts.js](https://github.com/disnet/contracts.js) library in your script tags. It has been added to the dependencies of this projecet, since the output is not runnable without it. In a regular installation this will be:

* `<script language="javascript" src="node_modules/contracts.js/lib/contracts.js" />`
* Load your own file using a script tag, or use require.js. 

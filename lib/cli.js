'use strict';

const fs = require('fs');
const axios = require('axios');
const pkg = require('../package.json');
const cli = require('commander');
const yaml = require('js-yaml').safeLoad;
const CodeGen = require('./codegen').CodeGen;

function readJson(file) {
	return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

cli
	.version(pkg.version)
	.option('-c, --config [config]', 'Config file [apigen-config.json]', 'apigen-config.json')
	.parse(process.argv);

var templatesFolder = __dirname + '/../templates/nevlabs/';
var classTemplate = templatesFolder + '/class.mustache';
var methodTemplate = templatesFolder + '/method.mustache';
var typeTemplate = templatesFolder + '/type.mustache';

console.log('generating client');

var config = readJson(cli.config);
var outputFile = config.outputFile;
var input = config.swaggerLocation;

axios.get(input)
	.then(function (response) {
		var swagger = response.data;
		var source = CodeGen.getCustomCode({
			lint: false,
			moduleName: 'ModuleName',
			className: 'ClassName',
			swagger: swagger,
			mustache: {
				baseUrl: config.baseUrl || ''
			},
			template: {
				class: fs.readFileSync(classTemplate, 'utf-8'),
				method: fs.readFileSync(methodTemplate, 'utf-8'),
				type: fs.readFileSync(typeTemplate, 'utf-8')
			}
		});
		fs.writeFileSync(outputFile, source, 'UTF-8');
		console.log('done!');
	})
	.catch(function (error) {
		console.log('Couldn\'t download swagger.json');
		console.log(error);
	});
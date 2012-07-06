/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Dynamically loads VMUI scripts based on need
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var VMUI = new Class({
	Implements: [Events, Options],

	options: {
		assets: [
		         {name: 'CheckboxReplace', source: 'Form/Replace/Checkbox.js', selectors: 'input[type=checkbox]'},
		         {name: 'RadioReplace', source: 'Form/Replace/Radio.js', selectors: 'input[type=radio]'},
		         {name: 'SelectReplace', source: 'Form/Replace/Select.js', selectors: 'select'},
		         //{name: 'Lighter', source: 'Lighter/Lighter.js', selectors: 'pre'},
		],
		relativePath: '../JavaScript'
		
	},

	/**
	 * @param object - options - The options object
	 */
	initialize: function(options){
		this.setOptions(options);
		this.loadScripts();
	},	
	
	loadScripts: function(){
		var self = this;
		Array.each(this.options.assets, function(script){
			if ($$(script.selectors).length){		
				Asset.javascript(self.options.relativePath+'/'+script.source, {
					 onLoad: function(){
						 if (script.name == 'Lighter'){
							Asset.javascript(self.options.relativePath+'/Lighter/Loader.js');			
							$$('pre').light();
						 } else {
							 var plugin = new window[script.name](script.selectors);
						 }
					 }
				 });
			}
		});
	}
});

window.addEvent('domready', function() {
	var loader = new VMUI();

	var lighter = new Lighter({
		loader:   new Loader({
			stylesheets: '../JavaScript/Lighter/',
//			scripts:     '../Build/Fuels/'
		}),
		parser:   new Parser.Smart({ strict: true }),
		compiler: new Compiler.List(),
		mode: 'ol'
	});

	$$('pre').each(function(el) {
		lighter.light(el);
	});
});

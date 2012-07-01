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
		         {source: 'Form/Replace/Checkbox.js', selectors: 'input[type=checkbox]'},
		         {source: 'Form/Replace/Select.js', selectors: 'select'}
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
				 Asset.javascript(self.options.relativePath+'/'+script.source);
			}
		});
	}
});

window.addEvent('domready', function() {
	var loader = new VMUI();
});

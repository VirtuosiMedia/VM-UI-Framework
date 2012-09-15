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
		         {name:'CheckboxReplace', source:'Form/Replace/Checkbox.js', selectors:'input[type=checkbox]'},
		         {name:'RadioReplace', source:'Form/Replace/Radio.js', selectors:'input[type=radio]'},
		         {name:'SelectReplace', source:'Form/Replace/Select.js', selectors:'select'},
		         {name:'Lighter', source:'Lighter/Lighter.js', selectors:'pre'},
		         {name:'Tabs', source:'Navigation/Tabs.js', selectors:'.tabs, .tabsVertical'},
		         {
		        	 name:'Charts', 
		        	 source:'Data/Charts.js', 
		        	 selectors:'.chartLine, .chartScatter, .chartArea, .chartBar, .chartPie'
		         },
		         {name:'Pin', source:'Layout/Pin.js', selectors:'.pin'}
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
				if (self.checkExists(script.name)){
					Asset.javascript(self.options.relativePath+'/'+script.source, {
						 onLoad: function(){
							 if (script.name == 'Lighter'){
								self.loadLighter(script.selectors);
							 } else {
								 var plugin = new window[script.name](script.selectors);
							 }
						 }
					 });
				} else {
					 var plugin = new window[script.name](script.selectors);
				}
			}
		});
	},

	checkExists: function(name){
		return (typeof name !== 'undefined');
	},

	loadLighter: function(selectors){
		var self = this;
		var assets = [
		     'Lighter/Lighter.js', 'Lighter/Loader.js', 'Lighter/Parser.js', 'Lighter/Parser/Smart.js',
		     'Lighter/Compiler.js', 'Lighter/Compiler/List.js', 'Lighter/Compiler/Inline.js', 'Lighter/Fuel.js',
		     'Lighter/Wick.js',
		];
		self.loadLighterAsset(assets, 0, selectors);
	},	
	
	/**
	 * This method forces the lighter assets to load sequentially, avoiding the occasional loading error
	 */
	loadLighterAsset: function(assets, index, selectors){
		var self = this;
		var last = assets.length;
		if (index != last){		
			if (self.checkExists(assets[index])){
				Asset.javascript(self.options.relativePath+'/'+assets[index], {
					onLoad: function(){
						index++;
						self.loadLighterAsset(assets, index, selectors);
					}
				});
			} else {
				index++;
				self.loadLighterAsset(assets, index, selectors);				
			}
		} else {
			this.igniteLighter(selectors);
		}
	},

	igniteLighter: function(selectors){
		var lighter = new Lighter({
			loader:   new Loader({}),
			parser:   new Parser.Smart({ strict: true }),
			compiler: new Compiler.List(),
			mode: 'ol'
		});
		
		$$(selectors).each(function(el) {
			lighter.light(el);
		});	
	}
});
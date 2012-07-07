/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Replaces an element containing code with syntax highlighting.
* Documentation: http://www.virtuosimedia.com
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Highlighter = new Class({

	Implements: [Events, Options],

	options: {
		relativePath: '../JavaScript',
		supportedLanguages: ['Html'],
		tabsToSpaces: 5,
		
	},

	/**
	 * @param string - selector - The selector for the pre element(s) to be replaced
	 * @param object - options - The options object
	 */
	initialize: function(selector, options){
		this.setOptions(options);
		this.element = $$(selector);
		this.loadedParsers = [];
		this.getLanguage();
	},

	getLanguage: function(){
		var self = this;
		this.element.each(function(element, index){
			var elClasses = (element.get('class').length > 0) ? element.get('class').split(' ') : null;
			var language = null;
			if (elClasses){
				elClasses.each(function(elClass){
					elClass = elClass.charAt(0).toUpperCase() + elClass.slice(1).toLowerCase();
					if (self.options.supportedLanguages.contains(elClass)){
						language = elClass;
						return;
					} 		
				});
			}
			if (language){
				self.loadParser(element, 'Parser');
				self.loadParser(element, language);
			}
		});
	},
	
	loadParser: function(element, language){
		var self = this;
		if (!this.loadedParsers.contains(language)){
			var parser = (language != 'Parser') ? 'Parser/'+language : language;
			Asset.javascript(this.options.relativePath+'/Code/'+parser+'.js', {
				onLoad: function(){
					self.getCode(element, language);
				}
			});
			this.loadedParsers.push(language);
		}  else {
			this.getCode(element, language);
		}
	},
	
	getCode: function(element, language){
		var code = element.get('html').split("\n");
		if (code[(code.length-1)] == ''){
			code.pop();
		}
		code = this.parseTabs(code);
		code = this.parseCode(code, language);
		this.createList(element, code);
	},

	parseCode: function(code, language){
		 var parser = new Parser();
		 return parser.parse(code);
	},
	
	parseTabs: function(code){
		var tabs = '';
		for (var i=0; i<= this.options.tabsToSpaces; i++){
			tabs += '&nbsp;';
		}
		code.each(function(line, index){
			code[index] = line.replace(/\t/, tabs).replace(' ', '&nbsp;');
		});
		return code;
	},
	
	createList: function(element, code){
		var list = new Element('ol', {'class': 'highlighter'});
		code.each(function(line){
			new Element('li', {'html': line}).inject(list);
		});
		list.inject(element, 'after');
		element.setStyle('display', 'none');
	}
});
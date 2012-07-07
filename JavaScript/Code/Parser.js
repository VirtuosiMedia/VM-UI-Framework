/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Base parser for code syntax highlighting, meant to be extended by specific languages.
* Documentation: http://www.virtuosimedia.com
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Parser = new Class({

	initialize: function(rules){
		this.rules = [
		    {type: 'regex', match: /(\&lt;[a-zA-Z0-9\/]+)(.*?)(\&gt;{1})/gi, replace: "<span class=\"codeKeyword\">$1</span>$2<span class=\"codeKeyword\">$3</span>"},
//		    {type: 'regex', match: /("|')(.*?)("|')/gi, replace: "$1<span class=\"codeString\">$2</span>$3"},
		];
	},
	
	parse: function(code){
		var self = this;
		code.each(function(line, index){
			self.rules.each(function(rule){
				code[index] = line.replace(rule.match, rule.replace);
			});
		});
		return code;		
	}
});
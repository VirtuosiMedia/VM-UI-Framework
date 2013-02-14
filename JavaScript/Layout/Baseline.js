/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012-13, Virtuosi Media
* @license: MIT License
* @description: Dynamically calculates a vertical baseline and applies it to non-conforming objects
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Baseline = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selectors - The selectors for the pinned elements
	 */
	initialize: function(selectors){
		var self = this;
		this.emSize = parseInt($$('body')[0].getStyle('line-height'));
		this.locate(selectors);
		this.locate.delay(1, this, selectors); //Get any elements that are slow to render
		window.addEvent('resize', function(){self.locate(selectors);});
	},

	locate: function(selectors){
		$$(selectors).each(function(el){this.applyMargin(el);}, this);
	},
	
	applyMargin: function(el){
		var height = el.getSize().y;
		var modulus = height % this.emSize;
		var margin = this.emSize - modulus;
		//Vertical align is added to fix http://stackoverflow.com/questions/9359121/
		el.setStyles({'vertical-align': 'bottom', 'margin-bottom': margin}); 
	}
});
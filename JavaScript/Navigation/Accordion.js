/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Creates an accordion menu
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Accordion = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selectors - The selectors for the accordions
	 */
	initialize: function(selectors){
		var self = this;
		this.slides = [], this.togglers = [], this.elements = [];
		Array.each(selectors, function(accordion, index){
			self.togglers[index] = accordion.getChildren('li').getChildren('a').flatten();
			self.elements[index] = accordion.getChildren('li').getChildren('a+*').flatten();
			self.slides[index] = {};
			self.setSlides(index);
			self.setTogglers(index);
		});
	},
		
	setSlides: function(accordionIndex){
		this.elements[accordionIndex].each(function(item, index){
			this.slides[accordionIndex][index] = new Fx.Slide(item, {'mode':'vertical'});
		}.bind(this));
	},

	setTogglers: function(accordionIndex){
		this.togglers[accordionIndex].each(function(toggler, index){
			if (!toggler.getParent('li').hasClass('active')){
				this.slides[accordionIndex][index].hide();
			}
			toggler.addEvent('click', function(e){
				e.stop();
				this.slides[accordionIndex][index].toggle();
			}.bind(this));
		}.bind(this));	
	}
});
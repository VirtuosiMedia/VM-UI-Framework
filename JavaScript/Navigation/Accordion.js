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
	 * @param string - selectors - The selectors for the notifications
	 */
	initialize: function(selectors){
		this.togglers = $$(selectors + '>li>a');
		this.elements = $$(selectors + '>li>a+*');
		this.slides = {};
		this.setSlides();
		this.setTogglers();
	},
		
	setSlides: function(){
		this.elements.each(function(item, index){
			this.slides[index] = new Fx.Slide(item, {'mode':'vertical'});
		}.bind(this));
	},

	setTogglers: function(){
		this.togglers.each(function(toggler, index){
			if (!toggler.getParent('li').hasClass('active')){
				this.slides[index].hide();
			}
			toggler.addEvent('click', function(e){
				e.stop();
				this.slides[index].toggle();
			}.bind(this));
		}.bind(this));	
	}
});
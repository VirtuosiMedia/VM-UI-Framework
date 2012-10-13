/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Creates dropdown menus
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Dropdown = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selectors - The selectors for the notifications
	 */
	initialize: function(selectors){
		this.triggers = $$(selectors);
		this.dropdowns = $$(selectors.split(',').join('>a+*, ') + '>a+*');
		this.setDropdowns();
		this.setTriggers();
	},

	setDropdowns: function(){
		this.dropdowns.each(function(dropdown, index){
			var pos = dropdown.getCoordinates();
			dropdown.dispose().setStyles({
				'margin-top': -5000,
				opacity: 0,
				position: 'absolute',
				overflow: 'hidden',
				height: 0
			}).inject(this.triggers[index]).set('morph', {duration: 200});
		}, this);
	},
	
	setTriggers: function(){
		var self = this;
		this.triggers.each(function(trigger, index){
			trigger.addEvents({
				mouseenter: function(){self.show(index);},
				mouseleave: function(){self.hide(index);},
				click: function(e){
					e.stop();
					self.toggle(index);
				}
			});
		});	
	},
	
	show: function(index){
		this.dropdowns[index].setStyle('margin-top', 0).morph({height: null, opacity: 1});
	},
	
	hide: function(index){
		this.dropdowns[index].setStyle('margin-top', -5000).morph({height: 0, opacity: 0});
	},
	
	toggle: function(index){
		var toggle = (this.dropdowns[index].getStyle('height').toInt() == 0) ? this.show(index) : this.hide(index);
	}
});
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
		this.dropdowns = dropdowns = [];
		Array.each(selectors, function(dropdown){
			dropdowns.push(dropdown.getElement('>a+*'));
		});
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
				mouseleave: function(e){self.hide.delay(500, self, [index, e.target])},
				click: function(e){
					e.stop();
					self.toggle(index, e);
				}
			});
		});	
	},
	
	show: function(index){//Most of these calculations are to prevent the dropdown from causing a horizontal scrollbar
		var dropdown = this.dropdowns[index];
		var position = ((window.getSize().x < 768) && (!dropdown.getPrevious('[class*=button]'))) ? 'relative' : 'absolute';
		if (dropdown.getParent().get('class') != 'megaDropdown'){
			var padding = parseInt(dropdown.getFirst('li a').getStyle('padding-right')) - parseInt(dropdown.getStyle('border-right-width'));
			var overlap = window.getSize().x - dropdown.getCoordinates().right - padding;
			if (overlap < 0){
				dropdown.setStyle('right', (window.getSize().x - dropdown.getParent().getCoordinates().right));
			} 
		}
		dropdown.setStyles({'margin-top': 0, position: position}).morph({height: null, opacity: 1});
	},
	
	hide: function(index, target, type){
		if ((target.getNext('ul') != this.dropdowns[index])||(target == this.dropdowns[index].getPrevious('a'))||(type == 'click')){
			this.dropdowns[index].setStyles({'margin-top': -5000, position: 'absolute', right: null}).morph({height: 0, opacity: 0});
		} 
	},
	
	toggle: function(index, e){
		var toggle = (this.dropdowns[index].getStyle('height').toInt() == 0) ? this.show(index) : this.hide(index, e.target, 'click');
	}
});
/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Adds events to buttons
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Button = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selectors - The selectors for the button
	 */
	initialize: function(selectors){
		var buttons = $$(selectors);
		var self = this;
		Array.each(buttons, function(button){
			button.addEvents({
				click: function(e){
					if (this.get('href') == '#'){ e.preventDefault();}
					
					var state = this.getData('state');
					if (!state.contains('disabled')){
						if (state == 'active'){
							self.deactivate(this);
						} else {
							self.activate(this);
						}
					}
				},
				activate: function(){self.activate(this)},
				deactivate: function(){self.deactivate(this)},
				enable: function(){self.enable(this)},
				disable: function(){self.disable(this)},	
			})
		});
	},
	
	activate: function(button){button.setData('state', 'active').fireEvent('activated');},
	
	deactivate: function(button){button.setData('state', '').fireEvent('deactivated');},
	
	enable: function(button){button.setData('state', button.getData('state').replace('disabled', '').trim());},
	
	disable: function(button){button.setData('state', button.getData('state') + ' disabled');}	
});
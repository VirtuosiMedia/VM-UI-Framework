/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Toggles content visibility with a trigger element
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Reveal = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selectors - The selectors for the button
	 */
	initialize: function(selectors){
		var togglers = $$(selectors);
		var self = this;
		Array.each(togglers, function(toggler){
			var content = $(toggler.get('href').replace('#', ''));
			var transition = toggler.getData('transition');
			
			if (transition != 'slide'){
				if (toggler.getData('startState') !== 'open'){
					content.setStyle('display', 'none');
				}				
			} else {
				content = new Fx.Slide(content.get('id')).hide();
				if (toggler.getData('startState') != 'open'){content.hide();}
			}
			
			toggler.addEvent('click', function(e){
				e.stop();
				self.toggleContent(content, transition);
				self.swapText(toggler);
			});
		});
	},
	
	swapText: function(toggler){
		if (toggler.hasData('toggleText')){
			var newText = toggler.getData('toggleText');
			var oldText = toggler.get('text');
			toggler.set('text', newText).setData('toggleText', oldText);
		}
	},
	
	toggleContent: function(content, transition){
		if (transition == 'slide'){
			content.toggle();
		} else {
			if (content.getStyle('display') == 'none'){
				content.setStyle('display', 'block');
			} else{
				content.setStyle('display', 'none');
			}
		}
	}
});
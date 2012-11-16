/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Creates tooltips
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Tips = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selectors - The selectors for the notifications
	 */
	initialize: function(selectors){
		var tips = $$(selectors);
		var self = this;
		Array.each(tips, function(tip){
			var startEvent = (tip.hasData('event')) ? tip.getData('event') : 'mouseover';
			var endEvent = (startEvent == 'mouseover') ? 'mouseout' : 'mouseover';
			var endTip = (startEvent == 'mouseover') ? tip : $$('html');
			tip.addEvent(startEvent, function(e){
				e.stop();
				self.addTip(tip);
			});
			if (startEvent == 'mouseover'){
				tip.addEvent('mouseout', function(e){self.removeTip(tip);});				
			} else {
				$$('html').addEvent('click', function(e){
					if (!e.target.hasClass('tipContainer')){
						self.removeTip(tip);
					}
				});
			}
		});
	},
	
	addTip: function(tip){
		var title = (tip.hasData('title')) ? tip.getData('title') : null;
		var content = (tip.hasData('content')) ? tip.getData('content') : null;
		content = (content) ? content : this.getContent(tip);
		var transition = (tip.getData('transition') == 'fade') ? 'in' : 'show';
		
		var titleEl = (title) ? new Element('h6', {'class':'title', html: title}) : '';
		var contentEl = (content) ? new Element('div', {'class':'content', html: content}) : '';
		var container = new Element('div', {'class': tip.get('class')+'Container',});
		container.adopt(titleEl, contentEl).inject(tip, 'after');
		this.setPosition(container, tip).fade(transition);
	},
	
	removeTip: function(tip){
		var tooltip = tip.getNext('[class$=Container]');
		if (tooltip){
			var transition = (tip.getData('transition') == 'fade') ? 'out' : 'hide';
			tooltip.fade(transition).dispose.delay(500, tooltip);
		}
	},

	getContent: function(tip){
		var source = (tip.hasData('target')) ? tip.getData('target') : null;
		return (source) ? $$(source).get('html') : false;
	},

	setPosition: function(container, tip){
		var pos = tip.getCoordinates();
		var tipSize = container.getSize(); 
		var offset = (tip.hasData('offset')) ? tip.getData('offset').toInt() + 10 : 10;
		var location = tip.get('class').hyphenate().split('-').getLast();
		location = (['top', 'bottom', 'left', 'right'].contains(location)) ? location : 'top';

		if (['bottom', 'top'].contains(location)) {
			var x = pos.left - ((tipSize.x - pos.width)/2); //Centers the tip
			var y = (location == 'top') ? pos.top - tipSize.y - offset : pos.bottom + offset;
		} else {
			var x = (location == 'left') ? pos.left - tipSize.x - offset : pos.right + offset;
			var y = pos.top - ((tipSize.y - pos.height)/2); //Centers the tip
		}
		
		return container.setStyles({top: y, left: x});
	}
	
});
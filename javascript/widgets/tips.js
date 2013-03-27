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
	 * @param string - selectors - The selectors for the tips
	 */
	initialize: function(selectors){
		var tips = $$(selectors);
		var self = this;
		tips.each(function(tip){
			self.addTipEvents(tip);
		});
		window.addEvent('resize', function(){
			tips.each(function(tip){
				var container = $$('.' + tip.get('class') + 'Container').dispose();
			});
		});
	},
	
	addTipEvents: function(tip){
		var self = this;
		tip.addEvents({
			mouseover: function(e){
				e.stop();
//				self.addTip(tip);
			}, 
//			mouseout: function(e){self.removeTip(tip);},
			click: function(e){
				e.stop();
				if (!e.target.hasClass('openTip')){
					self.addTip(tip);	
				} else {
					self.removeTip(tip);
				}
			}
		});
	},
	
	addTip: function(tip){
		var self = this;
		var title = (tip.hasData('title')) ? tip.getData('title') : null;
		var content = (tip.hasData('content')) ? tip.getData('content') : null;
		content = (content) ? content : this.getContent(tip);
		var transition = (tip.getData('transition') == 'fade') ? 'in' : 'show';
		
		var titleEl = (title) ? new Element('h6', {'class':'title', html: title}) : '';
		var contentEl = (content) ? new Element('div', {'class':'content', html: content}) : '';
		var container = new Element('div', {'class': tip.get('class')+'Container', styles: {
			'z-index': 100000
		}}).addEvent('click', function(e){
			e.stop();
			self.removeTip(this)
		});
		container.adopt(titleEl, contentEl).inject(document.body);
		this.setPosition(container, tip).fade(transition);
		tip.addClass('openTip');
	},
	
	removeTip: function(tip){
		var tooltip = $$('[class*=tip][class*=Container]');
		if (tooltip){
			var transition = (tip.getData('transition') == 'fade') ? 'out' : 'hide';
			tooltip.fade(transition).dispose.delay(500, tooltip);
		}
		tip.removeClass('openTip');
	},

	getContent: function(tip){
		var source = (tip.hasData('target')) ? tip.getData('target') : null;
		return (source) ? $$(source).get('html') : false;
	},

	setPosition: function(container, tip){
		var win = window.getSize();
		var scroll = window.getScroll();
		var pos = tip.getCoordinates();
		var tipSize = container.getSize(); 
		var offset = (tip.hasData('offset')) ? tip.getData('offset').toInt() + 10 : 10;
		var location = tip.get('class').hyphenate().split('-').getLast();
		location = (['top', 'bottom', 'left', 'right'].contains(location)) ? location : 'top';
		
		if ((window.matchMedia) && (window.matchMedia('screen and (max-width: 767px), screen and (max-device-width: 767px)').matches)){
			var x = 2.5;
			var y = pos.top - tipSize.y - 30;
			var width = window.width - 20;
			return container.setStyles({top: y, left: x, width: width});
		} else if (['bottom', 'top'].contains(location)){
			var x = pos.left - ((tipSize.x - pos.width)/2); //Centers the tip
			var y = (location == 'top') ? pos.top - tipSize.y - offset : pos.bottom + offset;
		} else {
			var x = (location == 'left') ? pos.left - tipSize.x - offset : pos.right + offset;
			var y = pos.top - ((tipSize.y - pos.height)/2); //Centers the tip
		}
		
		//This fixes tips that go off screen
		var offLeft = (x < 0);
		var offRight = ((x + tipSize.x) > win.x);
		
		if (offLeft || offRight){ 
			if (offLeft){
				x = pos.left;
				container.addClass('offscreenLeftTip');
			} else {
				x = pos.right - tipSize.x;
				container.addClass('offscreenRightTip');	
			}
		}

		var offTop = (y < scroll.y);
		var offBottom = (y + tipSize.y + offset > scroll.y + win.y);		
		
		if (offTop||offBottom||offLeft||offRight){
			container.removeClass('offscreenBottomTip');
			if (offTop){
				var y = pos.bottom + offset;
				container.addClass('offscreenTopTip');
			} else {
				var y = pos.top - tipSize.y - offset;
				container.addClass('offscreenBottomTip');
			}
			
			if (['left', 'right'].contains(location)){
				container.removeClass('offscreenLeftTip').removeClass('offscreenRightTip');
				if (location == 'left'){
					x = pos.left;
					container.addClass('offscreenLeftTip');	
				} else {
					x = pos.right - tipSize.x;
					container.addClass('offscreenRightTip');
				}
			}
		}
		return container.setStyles({top: y, left: x});
	}	
});
/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Creates pinned elementes
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Pin = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selectors - The selectors for the pinned elements
	 */
	initialize: function(selectors){
		this.boundaries = [];
		this.widths = [];
		this.emSize = parseInt($$('body')[0].getStyle('line-height'));
		Array.each($$(selectors), function(pinned, index){
			this.createPin.delay(50, this, [pinned, index]);
		}, this);
	},
	
	createPin: function(pinned, index){
		var dim = this.calculatePinPos(pinned, index);
		pinned.setStyle('z-index', 100001);		
		pinned.getParent().setStyles({display: 'block',	position: 'relative'});
		this.setPin(pinned, dim, index);
		
		window.addEvents({
			scroll: function(){this.setPin(pinned, dim, index);}.bind(this),
			resize: function(){this.setPin.delay(100, this, [pinned, this.calculatePinPos(pinned, index), index]);}.bind(this)
		}, this);
	},

	calculatePinPos: function(pinned, index){
		var dim = pinned.getCoordinates();
		var bottom =  pinned.getParent().getCoordinates().top + pinned.getParent().getComputedSize().height;
		var pinHeight = dim.height + parseInt(pinned.getStyle('margin-top')) + parseInt(pinned.getStyle('margin-bottom')); 
		this.boundaries[index] = bottom - pinHeight - this.emSize;
		this.widths[index] = pinned.setStyles({top: pinned.getCoordinates(pinned.getParent()).top, position: 'static', width: 'auto'}).getSize().x;
		return dim;
	},
	
	setPin: function(pinned, dim, index){
		var winPos = window.getScroll().y;
		if (winPos <= dim.top + 1){
			pinned.setStyles({position:'static'}).addClass('pinTop').removeClass('pinScroll').removeClass('pinBottom').fireEvent('pinTop');
		} else {
			if ((winPos <= this.boundaries[index])){
				pinned.setStyles({
					position:'fixed', top: 0, bottom: null, width: this.widths[index]
				}).addClass('pinScroll').removeClass('pinTop').removeClass('pinBottom').fireEvent('pinScroll');;
			} else {
				pinned.setStyles({position: 'absolute', bottom: 0, top: null}).addClass('pinBottom').removeClass('pinScroll').removeClass('pinTop').fireEvent('pinBottom');;			
			}			
		}		
	}
});
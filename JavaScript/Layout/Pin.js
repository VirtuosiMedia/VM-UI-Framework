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
		this.coordinates = [];
		this.boundaries = [];
		this.emSize = parseInt($$('body')[0].getStyle('line-height'));
		Array.each($$(selectors), function(pinned, index){
			this.createPin(pinned, index);
		}, this);
	},
	
	createPin: function(pinned, index){
		var self = this;
		this.coordinates[index] = pinned.getCoordinates();
		this.boundaries[index] = pinned.getParent().getCoordinates();

		pinned.getParent().setStyles({
			display: 'block', 
			width: self.boundaries[index].width+'px', 
			height: self.boundaries[index].height+'px',
			position: 'relative'
		});
		
		window.addEvent('scroll', function(){
			var winPos = this.getScroll().y;
			var pinHeight = self.coordinates[index].height + parseInt(pinned.getStyle('margin-top')) + parseInt(pinned.getStyle('margin-bottom')); 
			var pinPos = self.boundaries[index].bottom - pinHeight - self.emSize;
			if (winPos >= self.coordinates[index].top){
				pinned.setStyles({position:'fixed',	top: 0});
			}
			
			if (winPos < (self.coordinates[index].top - self.emSize)){
				pinned.setStyles({position:'static'});
			}
						
			if (winPos >= pinPos){
				pinned.setStyles({position: 'absolute', bottom: 0, top: null});
			}
		});
	}
});
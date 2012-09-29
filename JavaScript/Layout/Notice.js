/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Adds functionality to notifications
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Notice = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selectors - The selectors for the notifications
	 */
	initialize: function(selectors){
		Array.each($$(selectors), function(notice, index){
			this.setupNotice(notice, index);
		}, this);
	},
	
	setupNotice: function(notice, index){
		var options = notice.getDataAll();
		var openNotice = function(){notice.setStyles({opacity: 0, display: 'block'}).fade('in');};
		var deleteNotice = function(){notice.dispose();};
		var closeNotice = function(){notice.fade('out');deleteNotice.delay(1000);};
		
		if (options.closetime){closeNotice.delay(options.closetime);}
		if (options.opentime){openNotice.delay(options.opentime);}
		notice.getChildren('.close').addEvent('click', function(e){e.stop(); closeNotice();});
	}
});
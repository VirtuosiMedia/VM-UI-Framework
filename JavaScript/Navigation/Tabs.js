/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Creates tab menus and content
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Tabs = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selector - The selector for the checkbox element(s) to be replaced
	 * @param object - options - The options object
	 */
	initialize: function(selectors){
		var self = this;
		Array.each($$(selectors), function(tabMenu){
			self.triggerTabMenu(tabMenu);
		});
	},
	
	triggerTabMenu: function(tabMenu){
		var trigger = (tabMenu.getData('trigger')) ? tabMenu.getData('trigger') : 'click';
		var history = (tabMenu.getData('history')) ? tabMenu.getData('history') : false;
		var links = tabMenu.getChildren('li a');
		var self = this;

		links.addEvent(trigger, function(e){
			if (!history) { e.stop(); }
			links.removeClass('active');
			this.set('class', 'active');
			self.loadTab(this.get('href').substring(1), this.getData('targetUrl'));
		});
	},
	
	loadTab: function(tabId, targetUrl){
		$(tabId).getSiblings().removeClass('active');
		$(tabId).addClass('active');
		if (targetUrl){
			$(tabId).set('load', {
				evalScripts: true,
				onRequest: function(){
					console.log(targetUrl);
					$(tabId).set('html', '<p>Loading...</p>');
				},
				onSuccess: function(responseText, a, responseHTML){
					$(tabId).set('html', responseHTML);
				},
				onFailure: function(){
					$(tabId).set('html', '<p>Tab content could not be loaded.</p>')
				}
			});
			$(tabId).load(targetUrl);
		}
	}
});
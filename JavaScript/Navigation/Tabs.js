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
	 * @param string - selectors - The selectors for the tab menu list
	 */
	initialize: function(selectors){
		var self = this;
		this.cachedTabs = [];
		Array.each($$(selectors), function(tabMenu){
			self.triggerTabMenu(tabMenu, selectors);
		});
	},
	
	triggerTabMenu: function(tabMenu, selectors){
		var trigger = (tabMenu.getData('trigger')) ? tabMenu.getData('trigger') : 'click';
		var history = (tabMenu.getData('history')) ? tabMenu.getData('history') : false;
		var self = this;

		$$(selectors).addEvent(trigger+':relay(li a)', function(e){
			if (!history) { e.stop(); }
			this.getParent('ul').getChildren('li a').removeClass('active');
			this.set('class', 'active');
			self.loadTab(this);
		});
	},
	
	loadTab: function(tab){
		var tabId = tab.get('href').substring(1);
		$(tabId).getSiblings().removeClass('active');
		$(tabId).addClass('active');
		if (!this.cachedTabs.contains(tabId)){
			this.loadAjaxTab(tab, tabId, tab.getData('targetUrl'));
		}
	},
	
	loadAjaxTab: function(tab, tabId, targetUrl){
		if ((targetUrl)&&(targetUrl.test(/^[^http]/))){
			$(tabId).set('load', {
				evalScripts: true,
				onRequest: function(){
					$(tabId).set('html', '<p>Loading...</p>');
				},
				onSuccess: function(responseText, responseElements, responseHTML){
					$(tabId).set('html', responseHTML);
				},
				onFailure: function(){
					$(tabId).set('html', '<p>Tab content could not be loaded.</p>')
				}
			});
			$(tabId).load(targetUrl);
			this.cachedTabs.push(tabId);
		} else if ((targetUrl)&&(targetUrl.test(/^http/))){
			var content = new Element('iframe', {
				'src': targetUrl
			});
			$(tabId).empty().adopt(content);
			this.cachedTabs.push(tabId);
		}		
	}
});
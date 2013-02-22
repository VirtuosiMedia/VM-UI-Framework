/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012-13, Virtuosi Media
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
			self.createTabMenu(tabMenu, selectors);
			if (self.isMobile()){
				self.setMobileTabs(tabMenu);
			}			
		});		
	},
	
	createTabMenu: function(tabMenu, selectors){
		var trigger = (tabMenu.hasData('trigger')) ? tabMenu.getData('trigger') : 'click';
		var delegators = [];
		selectors.each(function(item){ delegators.push('.' + item.get('class') + '>li>a');});
		var self = this;

		tabMenu.addEvent(trigger+':relay(' + delegators.join(', ') + ')', function(e){
			e.stop();
			this.getParent('ul').getChildren('li a').removeClass('active');
			this.set('class', 'active');
			self.loadTab(this);
		});

		window.addEvent('resize', function(){
			if (self.isMobile()){
				self.setMobileTabs(tabMenu);
			} else {
				self.unsetMobileTabs(tabMenu);
			}
		});
	},
	
	isMobile: function(){
		if (window.matchMedia){
			return window.matchMedia('(max-device-width: 767px)').matches;
		} else {
			return screen.width <= 768;
		}			
	},
	
	loadTab: function(tab){
		var tabId = tab.get('href').substring(1);
		var tabContainer = $(tabId);
		tabContainer.getSiblings().removeClass('active');
		tab.getParent().getParent().getElements('.mobileTabContent').removeClass('active');
		
		if (!this.cachedTabs.contains(tabId)){
			this.loadAjaxTab(tab, tabId, tab.getData('targetUrl'));
		}

		tab.addClass('active');
		tabContainer.addClass('active');
	},
	
	loadAjaxTab: function(tab, tabId, targetUrl){
		if ((targetUrl)&&(targetUrl.test(/^[^http]/))){
			var self = this;
			$(tabId).set('load', {
				evalScripts: true,
				onRequest: function(){
					$(tabId).set('html', '<p>Loading...</p>');
				},
				onSuccess: function(responseText, responseElements, responseHTML){
					$(tabId).set('html', responseHTML);
					$(document.body).fireEvent('ajaxUpdate', $(tabId));
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
	},

	setMobileTabs: function(tabMenu){
		var tabs = tabMenu.getChildren('li');
		var tabContainer = tabMenu.getNext('.tabContent, .pillTabContent');
		var contents = tabContainer.getChildren();
		contents.each(function(content, index){
			content.addClass('mobileTabContent').inject(tabs[index]);
		});
		tabContainer.empty();
	},
	
	unsetMobileTabs: function(tabMenu){
		var contents = tabMenu.getElements('.mobileTabContent');
		var tabContainer = tabMenu.getNext('.tabContent, .pillTabContent');
		contents.each(function(content){
			content.removeClass('.mobileTabContent').inject(tabContainer);
		});
		tabMenu.getElements('.mobileTabContent').dispose();
	}
});
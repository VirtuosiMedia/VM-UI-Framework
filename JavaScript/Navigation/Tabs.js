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
			self.createTabMenu(tabMenu, selectors);
			if (self.isMobile()){
				self.setMobileTabs(tabMenu);
			}			
		});		
	},
	
	createTabMenu: function(tabMenu, selectors){
		var trigger = (tabMenu.hasData('trigger')) ? tabMenu.getData('trigger') : 'click';
		var history = (tabMenu.hasData('history')) ? tabMenu.getData('history') : false;
		var delegators = [];
		selectors.each(function(item){ delegators.push('.' + item.get('class') + '>li>a');});
		var self = this;

		tabMenu.addEvent(trigger+':relay(' + delegators.join(', ') + ')', function(e){
			if (!history) { e.stop(); }
			this.getParent('ul').getChildren('li a').removeClass('active');
			this.set('class', 'active');
			self.loadTab(this);
		});

		window.addEvent('resize', function(){
			if (self.isMobile()){
				self.setMobileTabs(tabMenu);
			} else {
				self.unsetMobileTabs();
			}
		});
	},

	isMobile: function(){
		return (window.getCoordinates().width <= 768);
	},	
	
	loadTab: function(tab){
		var tabId = tab.get('href').substring(1)
		var tabContainer = $(tabId);
		tabContainer.getSiblings().removeClass('active').removeClass('activeMobile');
		
		if (!this.cachedTabs.contains(tabId)){
			this.loadAjaxTab(tab, tabId, tab.getData('targetUrl'));
		}
		
		if (this.isMobile()){
			tabContainer.addClass('activeMobile');
			if ((!tab.hasData('targetUrl'))||(this.cachedTabs.contains(tabId))){
				this.loadMobileTab(tab, tabContainer);
			}
		} else {
			tabContainer.addClass('active');	
		}
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
					if (self.isMobile()){
						self.loadMobileTab(tab, $(tabId));
					}
				},
				onFailure: function(){
					$(tabId).set('html', '<p>Tab content could not be loaded.</p>')
					if (self.isMobile()){
						self.loadMobileTab(tab, $(tabId));
					}					
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

	loadMobileTab: function(tab, tabContainer){
		tab.getParent().getParent().getElements('.mobileTabContent').dispose();
		var tabContent = tabContainer.clone().addClass('mobileTabContent');
		if (tab.getSiblings('.mobileTabContent').length == 0){
			tabContent.inject(tab, 'after');
		}
		$(document.body).fireEvent('ajaxUpdate', tabContent);
	},
	
	setMobileTabs: function(tabMenu){
		this.loadTab(tabMenu.getElement('.active'));
		$$('.tabContent, .pillTabContent').getChildren().each(function(children){
			children.each(function(child){
				if (child.hasClass('active') == true){
					child.removeClass('active').addClass('activeMobile');
				}
			});
		});
	},
	
	unsetMobileTabs: function(){
		$$('.tabContent, .pillTabContent').getChildren().each(function(children){
			children.each(function(child){
				if (child.hasClass('activeMobile')){
					child.removeClass('activeMobile').addClass('active');
				}
			});
		});
		$$('.mobileTabContent').dispose();
	}
});
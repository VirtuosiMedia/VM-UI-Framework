/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Creates mobile menus
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var MobileMenu = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selectors - The selectors for the menu
	 */
	initialize: function(selectors){
		this.menus = $$(selectors);
		var self = this;
		
		if (self.isMobile()){
			self.createMobileMenus();
		}		
		window.addEvent('resize', function(){
			if (self.isMobile()){
				self.adjustFloatingMenus(true);
				if ($$('.mobileMenuTrigger').length == 0){self.createMobileMenus();}
			} else {
				self.adjustFloatingMenus(false);
				self.resetMobileMenus();
			}
		});		
	}, 

	isMobile: function(){
		if (window.matchMedia){
			return window.matchMedia('(max-device-width: 960px)').matches;
		} else {
			return screen.width <= 960;
		}			
	},
	
	createMobileMenus: function(){
		var self = this;
		var buttonContainer = new Element('ul', {id: 'mobileButtonContainer', 'class': 'buttonGroup', styles: {float: 'right'}});
		Array.each(this.menus, function(menu, index){
			menu.setStyles({overflow: 'hidden', height: 0});
			menu.getParent('[class*=col]').setStyle('margin-bottom', 0);
			var text = (menu.hasData('text')) ? menu.getData('text') : 'Menu';
			var button = new Element('span', {
				'class': 'contrastButton mobileMenuTrigger',
				html: text,
				events: {
					click: function(){
						if (menu.getStyle('height') == '0px'){
							self.menus.setStyle('height', 0);
							$$('.mobileMenuTrigger').setData('state', null);
							menu.setStyle('height', 'auto');
							this.setData('state', 'active');
							if ($$('.navbarContainer')[0].hasClass('fixed')){
								$$('.navbarContainer')[0].setStyle('position', 'static');
							}
						} else {
							menu.setStyle('height', 0);
							this.setData('state', null);
							self.resetFixedMenus();
						}
					}
				}
			})
			var li = new Element('li').adopt(button).inject(buttonContainer);
		});
		buttonContainer.inject(this.menus[0], 'before');
	},

	resetFixedMenus: function(){
		if (($$('.navbarContainer').length > 0) && ($$('.navbarContainer')[0].hasClass('fixed'))){
			$$('.navbarContainer')[0].setStyle('position', 'fixed');
		}			
	},
	
	resetMobileMenus: function(){
		this.resetFixedMenus();
		this.menus.setStyles({height: 'auto', overflow: null});
		if ($('mobileButtonContainer')) {$('mobileButtonContainer').dispose();}		
	},
	
	adjustFloatingMenus: function(mobile){
		var floaters = (mobile) 
			? $$('.floatingNav [class*=col]').setStyle('padding', 0) 
			: $$('.floatingNav [class*=col]').setStyle('padding', '0 1em');
	}
});
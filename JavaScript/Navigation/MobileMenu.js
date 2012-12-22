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
		
		if (window.getCoordinates().width <= 768){
			self.createMobileMenus();
		}		
		window.addEvent('resize', function(){
			if (window.getCoordinates().width <= 768){
				if ($$('.mobileMenuTrigger').length == 0){self.createMobileMenus();}
			} else {
				self.resetMobileMenus();
			}
		});		
	}, 
	
	createMobileMenus: function(){
		Array.each(this.menus, function(menu){
			menu.setStyles({overflow: 'hidden', height: 0});
			menu.getParent('[class*=col]').setStyle('margin-bottom', 0);
			var text = (menu.hasData('text')) ? menu.getData('text') : 'Menu';
			var button = new Element('span', {
				'class': 'buttonInverted mobileMenuTrigger',
				text: text,
				events: {
					click: function(){
						if (menu.getStyle('height') == '0px'){
							menu.setStyle('height', 'auto');
						} else {
							console.log('close')
							menu.setStyle('height', 0);
						}
					}
				}
			}).inject(menu, 'before');
		});		
	},
	
	resetMobileMenus: function(){
		this.menus.setStyle('height', 'auto');
		$$('.mobileMenuTrigger').dispose();
	}
});
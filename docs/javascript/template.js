/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2013, Virtuosi Media
* @license: MIT License
* @description: Loads the proper CSS templates
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Template = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - relativePath - The relative path to the master templates directory from the current page
	 */
	initialize: function(relativePath){
		var template = Cookie.read('vmui-docs-template');
		template = (template) ? template.toLowerCase() : 'sketch';
		var defaultTemplate = $$('link[rel=stylesheet]')[0].get('href');
		var numDynamicTemplates = $$('.dynamicTemplate').length
		
		if ((!defaultTemplate.contains(template))||(numDynamicTemplates > 0)){
			$$('link[rel=stylesheet]').dispose();
			new Asset.css(relativePath + 'templates/' + template + '/css/import.css', {
				'class': 'dynamicTemplate',
				onLoad: function(){ //This is for plugins that execute before the stylesheet it loaded
					document.fireEvent('templateLoaded');
				}
			});
			new Asset.css(relativePath.substr(3) + 'css/' + template + '/docs.css', {'class': 'dynamicTemplate'});
		} else {
			document.fireEvent('templateLoaded'); //When the default template is The Chosen One
		}
	}	
});
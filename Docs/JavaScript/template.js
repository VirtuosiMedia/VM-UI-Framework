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
		template = (template) ? template : 'Sketch';
		var defaultTemplate = $$('link[rel=stylesheet]')[0].get('href');
		var numDynamicTemplates = $$('.dynamicTemplate').length
		
		if ((!defaultTemplate.contains(template))||(numDynamicTemplates > 0)){
			$$('link[rel=stylesheet]').dispose();
			new Asset.css(relativePath + 'Templates/' + template + '/CSS/import.css', {'class': 'dynamicTemplate'});
			new Asset.css(relativePath.substr(3) + 'CSS/' + template + '/docs.css', {'class': 'dynamicTemplate'});
		}
	}	
});
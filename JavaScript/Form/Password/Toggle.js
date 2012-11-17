/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Toggles a password visibility
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var PasswordToggle = new Class({

	Implements: [Events, Options],

	/**
	 * @param array - selectors - An array of element objects for the password fields to be converted
	 */
	initialize: function(selectors){
		var self = this;
		Array.each(selectors, function(pass){
			var toggleId = pass.get('name') + 'Toggle';
			var label = new Element('label', {html: '<span> Show Password</span>', 'for': toggleId, 'class': 'toggleLabel'});
			var check = new Element('input', {
				type:'checkbox', name: toggleId, id: toggleId,
				events: {
					change: function(){
						var type = (this.checked) ? 'text' : 'password';
						$$('[name=' + this.get('name').replace('Toggle', '') + ']').set('type', type);
					}
				}
			}).inject(label, 'top');
			label.inject(pass, 'after');
			$(document.body).fireEvent('ajaxUpdate', label);
		});
	}
});
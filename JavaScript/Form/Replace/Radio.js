/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Replaces a radio element with a custom display
* Documentation: http://www.virtuosimedia.com
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var RadioReplace = new Class({

	Implements: [Events, Options],

	options: {
		activeClass: 'active',
		checkedClass: 'checked',
		uncheckedClass: 'unchecked',
		cloneClasses: false
	},

	/**
	 * @param string - selector - The selector for the checkbox element(s) to be replaced
	 * @param object - options - The options object
	 */
	initialize: function(selector, options){
		this.setOptions(options);
		this.radios = $$(selector);
		this.replaceRadios();
	},

	replaceRadios: function(){
		var self = this;
		Array.each(this.radios, function(box){
			var replaceId = (box.get('id')) ? box.get('id')+'Replace' : box.get('name')+'Replace';
			var replaceClass = (box.checked) ? self.options.checkedClass : self.options.uncheckedClass;
			replaceClass = (self.options.cloneClasses) ? replaceClass+' '+box.get('class') : replaceClass;
			var replacement = new Element('a', {
				'id': replaceId,
				'class': replaceClass + ' radioReplace',
				'data-name': box.get('name'),
				'tabindex': box.get('tabindex'),
				events: {
					'click': function(){ 
						box.checked = (box.checked) ? true : false;
						if (box.getParent('label')){
							$(replaceId).toggleClass(self.options.checkedClass).toggleClass(self.options.uncheckedClass);
						}
						box.fireEvent('change');
						this.fireEvent('focus');
					},
					'focus': function(){
						this.toggleClass(self.options.activeClass);
						box.fireEvent('focus');
					},
					'blur': function(){
						this.toggleClass(self.options.activeClass);
						box.fireEvent('blur');
					}, 
					'keydown': function(e){
						if (e.key == 'space'){
							box.checked = (box.checked) ? false : true;
							box.fireEvent('change');
						}
					}
				}
			});
			if (!box.getNext('a.radioReplace')){ //Prevents duplication
				replacement.inject(box, 'after');
			}
			box.addEvent('change', function(e){
				$$('input[name='+this.get('name')+'] + .checked').set('class', self.options.uncheckedClass + ' radioReplace');
				$$('input[value='+this.get('value')+'] + .unchecked').set('class', self.options.checkedClass + ' radioReplace');
			}).setStyle('display', 'none');
			box.getParent('label').addEvent('click', function(){replacement.fireEvent('click');});
		});
	}
});
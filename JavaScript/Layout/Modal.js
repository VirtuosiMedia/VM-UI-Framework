/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Creates a modal window
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Modal = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selectors - The selectors
	 */
	initialize: function(selectors){
		Array.each($$(selectors), function(trigger, index){
			this.setTrigger(trigger, index);
		}, this);
	},
	
	setTrigger: function(trigger){
		var self = this;
		var options = trigger.getDataAll();
		var triggerEvent = (options.event) ? options.event : 'click';
		trigger.addEvent(triggerEvent, function(e){	
			e.stop();
			self.currentTrigger = this;
			self.open();
		});
	},
	
	createOverlay: function(){
		var displayHeight = window.getSize();
		var self = this;
		var overlay = new Element('div', {
			'id': 'overlay',
			styles: {
				height: displayHeight.y
			},
			events: {
				click: function(){
					self.close();
				}
			}
		}, this);
		if (!this.currentTrigger.getData('hideOverlay')){
			overlay.inject($(document.body));
		}
	},
	
	createModal: function(){
		var size = window.getSize(); 
		var modal = new Element('div', {'id': 'modal', styles: {top: -2000}});
		modal.inject($(document.body));
		this.getModalContent();
		
		var dimensions = modal.getSize();
		var topVal = ((size.y - dimensions.y)/2) + 'px';
		var leftVal = ((size.x - dimensions.x)/2) + 'px';
		
		if (this.currentTrigger.getData('noFx') == 'true'){
			modal.setStyles({top: topVal, left: leftVal});
		} else {
			modal.set('tween', {fps: 200, duration: 'short', transition: Fx.Transitions.Expo.easeOut});
			modal.setStyle('left', leftVal).tween('top', topVal);
		}
		this.setCloseTriggers();
	},
	
	getModalContent: function(){
		var trigger = this.currentTrigger;
		var target = (trigger.getData('target')) ? trigger.getData('target') : trigger.get('href');
		var self = this;
		
		if (target.split('')[0] === '#'){
			var newId = $$(target)[0].get('id') + 'Copy';
			$('modal').adopt($$(target)[0].clone().set('id', newId).setStyle('display', 'block'));
		} else if (target.test(/^[^http]/)){
			var content = new Element('div', {'id': 'ajaxModal'}).inject($('modal'));
			$('ajaxModal').set('load', {
				evalScripts: true,
				onRequest: function(){
					$('ajaxModal').set('html', '<p>Loading...</p>');
				},
				onSuccess: function(responseText, responseElements, responseHTML){
					$('ajaxModal').set('html', responseHTML);
					var leftVal = ((window.getSize().x - $('modal').getSize().x)/2) + 'px';
					$('modal').setStyle('left', leftVal);
					self.setCloseTriggers();
					$(document.body).fireEvent('ajaxUpdate', $('ajaxModal'));
				},
				onFailure: function(){
					$('ajaxModal').set('html', '<p>Modal content could not be loaded.</p>')
				}
			});
			$('ajaxModal').load(target);			
		} else if (target.test(/^http/)){
			var content = new Element('iframe', {src: target, styles: {height: '100%', width: '100%'}});
			$('modal').setStyles({width: '80%', height: 500, padding: '0px 5px 5px 0px'}).adopt(content);				
		} else {
			var content = new Element('div', {
				html: 'Modal content could not be found.',
				styles: {padding: '1em'}
			}).inject($('modal'));
		}
	},
	
	setCloseTriggers: function(){
		var self = this;
		$$('#modal .close').addEvent('click', function(e){
			e.stop();
			self.close();
		});
		$$('#modal .save').addEvent('click', function(e){
			e.stop();
			self.fireModalEvent('modalSaved');		
			self.close();
		});		
	},

	fireModalEvent: function(event){
		var modalId = $('modal').getChildren()[0].get('id');
		if (modalId) { $(modalId.replace('Copy', '')).fireEvent(event); }		
	},
	
	open: function(){
		this.createOverlay();
		this.createModal();
		this.fireModalEvent('modalOpened');
	},
	
	close: function(){
		this.fireModalEvent('modalClosed');
		$('overlay').dispose();
		$('modal').dispose();
	},
	
	toggle: function(){
		($('overlay')) ? this.close() : this.open();
	}
});
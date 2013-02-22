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
		this.setWindowEvents();
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
				click: function(){self.close();},
			}
		}, this);
		if (!this.currentTrigger.getData('hideOverlay')){
			overlay.inject($(document.body));
		}
	},
	
	createModal: function(){
		var modal = new Element('div', {'id': 'modal', styles: {top: -2000}}).inject($(document.body));
		this.getModalContent();
		this.positionModal();
		this.setCloseTriggers();
	},

	positionModal: function(){
		var size = window.getSize();
		var modal = $('modal');
		if (this.isMobile()){
			var topVal = 0, leftVal = 0, height = size.y + 'px';
		} else {
			var dimensions = modal.getSize();
			var topVal = ((size.y - dimensions.y)/2) + 'px';
			var leftVal = ((size.x - dimensions.x)/2) + 'px';
			var height = modal.hasClass('iframeModal') ? size.y/2 : 'auto';
		}
		
		modal.setStyle('height', height);
		var headerHeight = (modal.getElement('.modal .modalHeader')) ? modal.getElement('.modal .modalHeader').getSize().y : 0;
		var footerHeight = (modal.getElement('.modal .modalFooter')) ? modal.getElement('.modal .modalFooter').getSize().y : 0;
		var contentHeight = (modal.getSize().y > size.y/2) ? modal.getSize().y - headerHeight - footerHeight - 22 : 'auto';
		
		if (modal.getElement('.modal .modalContent')){
			modal.getElement('.modal .modalContent').setStyle('height', contentHeight);
		}
		
		if (this.currentTrigger.getData('noFx') == 'true'){
			modal.setStyles({top: topVal, left: leftVal});
		} else {
			modal.set('tween', {fps: 200, duration: 'short', transition: Fx.Transitions.Expo.easeOut});
			modal.setStyles({left: leftVal}).tween('top', topVal);
		}		
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
			var content = new Element('iframe', {src: target});
			var iframeClose = new Element('a', {'class': 'iframeClose close', text: 'X'});
			$('modal').addClass('iframeModal').adopt(content, iframeClose);				
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
	
	setWindowEvents: function(){
		var self = this;
		window.addEvent('resize', function(){
			if ($('overlay')){
				$('overlay').setStyle('height', this.getSize().y);
				self.positionModal();
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
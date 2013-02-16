/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2011, Virtuosi Media
* @license: MIT License
* @description: Replaces a select form element
* Documentation: http://www.virtuosimedia.com
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var SelectReplace = new Class({

	Implements: [Events, Options],

	options: {
		activeClass: 'active',
		activeLiClass: 'activeLi',
		containerClass: 'selectContainer',
		displayClass: 'display',
		expandedClass: 'expanded',
		liClass: 'selectLi',
		listClass: 'selectList',
		optgroupClass: 'selectOptgroup',
		triggerActiveHtml: '&#9650;',
		triggerClass: 'trigger',
		triggerInactiveHtml: '&#9660;'
	},

	/**
	 * @param string - selector - The selector of the selects to be replaced
	 * @param object - options - The options object
	 */
	initialize: function(selector, options){
		this.setOptions(options);
		this.selects = $$(selector);
		this.triggers = [];
		this.lists = [];
		this.listOptions = [];
		Array.each(this.selects, function(select, index){
			this.setListOptions(select, index);
			this.createTrigger(select, index);
			this.createList(select, index);
			this.addNavigation(index);
			select.setStyle('display', 'none');
		}.bind(this));
	},

	setListOptions: function(select, index){
		var self = this;
		this.listOptions[index] = [];
		Array.each(select.getChildren(), function(child, key){
			this.listOptions[index][key] = {'text':child.get('text'), 'value':child.get('value')};
			if (child.get('tag') == 'optgroup'){
				this.listOptions[index][key]['text'] = child.get('label');
				this.listOptions[index][key]['value'] = []
				Array.each(child.getChildren(), function(option, subkey){
					self.listOptions[index][key]['value'][subkey] = {'text':option.get('text'), 'value':option.get('value')};
				});
			}
		}.bind(this));
	},
	
	createTrigger: function(select, index){
		var self = this;
		var replaceId = (select.get('id')) ? select.get('id')+'Replace' : select.get('name')+'Replace';
		var display = new Element('span', {'class':this.options.displayClass, 'html':select.getSelected()[0].get('text')});
		var trigger = new Element('span', {'class':this.options.triggerClass, 'html':self.options.triggerInactiveHtml});
		this.triggers[index] = new Element('a', {
			'id': replaceId,
			'class': self.options.containerClass,
			'name': select.get('name'),
			'tabindex': select.get('tabindex'),
			events: {
				'click': function(){
					(self.lists[index].getStyle('display') == 'block') ? self.collapseList(index) :	self.expandList(index);
				},
				'focus': function(){
					this.addClass(self.options.activeClass);
					select.fireEvent('focus');
				},
				'blur': function(){
					this.removeClass(self.options.activeClass);
					select.fireEvent('blur');
				}
			}
		}).adopt(display, trigger);
		if ((!select.getNext())||(select.getNext().getNext().get('name') != select.get('name'))){ //Prevents duplication
			this.triggers[index].inject(select, 'after');
		}		
	},
	
	/**
	 * @param array - listOptions - An array of options to append to the current options in the dropdown list
	 */
	append: function(listOptions){
		this.listOptions.append(listOptions);
		this.deleteList();
		this.createList();
	},

	/**
	 * @param array - listOptions - An array of options to remove from the current options in the dropdown list
	 */
	remove: function(listOptions){
		var self = this;
		Array.each(listOptions, function(item){		
			self.listOptions.erase(item);
		});
		this.deleteList();
		this.createList();
	},	
	
	/**
	 * @param array - listOptions - An array of options to replace the current options in the dropdown list
	 */
	replace: function(listOptions){
		this.listOptions = listOptions;
		this.deleteList();
		this.createList();
	},
	
	createList: function(select, index){
		var self = this;
		var name = (select.get('id')) ? select.get('id')+'ReplaceList' : select.get('name')+'ReplaceList';
		
		this.lists[index] = new Element('ul', {
			"data-name": name,
			'class': self.options.listClass,
			styles: {
				'max-height': 300,
				'overflow': 'auto',
				'position': 'absolute',
				'z-index': 1000
			}
		});
		if (select.getNext().getData('name') !== this.lists[index].getData('name')){ //Prevents duplication
			this.lists[index].inject(select, 'after');
		}		

		this.createListOptions(index);
		this.triggers[index].getElement('.'+this.options.displayClass).setStyle('min-width', this.lists[index].getSize().x);
		this.lists[index].setStyle('display', 'none');
		
		$(document).addEvent('click', function(e){
			if ((!e.target.hasClass(self.options.triggerClass))&&(!e.target.hasClass(self.options.displayClass))){
				self.collapseList(index);
			}
		});		
	},
	
	createListOptions: function(index){
		Array.each(this.listOptions[index], function(item){
			if (typeOf(item['value']) == 'array'){
				var optgroup = this.createOptgroup(index, item['text'], item['value']);
				this.lists[index].adopt(optgroup);				
			} else {
				var option = this.createListItem(index, item['text'], item['value']);
				this.lists[index].adopt(option);	
			}
		}, this);
	},

	createOptgroup: function(index, text, values){
		var label = new Element('span', {'text':text});
		var optgroupList = new Element('ul');
		
		Array.each(values, function(item){
			var option = this.createListItem(index, item['text'], item['value'])
			optgroupList.adopt(option);
		}, this);
		
		return new Element('li', {'class':this.options.optgroupClass}).adopt(label, optgroupList);
	},
	
	createListItem: function(index, text, value){
		var self = this;
		var selectedText = this.selects[index].getSelected().get('text');
		var liClass = (text == selectedText) ? self.options.activeLiClass+' '+self.options.liClass : self.options.liClass;
		var liItem = new Element('li', {
			'class':liClass+' '+text.substring(0,1).toLowerCase(),
			'text':text,
			'data-value':value,
			events: {
				'click': function(){
					var text = this.get('text');
					self.lists[index].getElements('li').removeClass(self.options.activeLiClass);
					this.addClass(self.options.activeLiClass);						
					self.triggers[index].getElement('.'+self.options.displayClass).set('html', text);
					self.collapseList(index);
					self.updateSelect(index, text);
				}
			}
		});
		return liItem;
	},

	updateSelect: function(index, selectedText){
		Array.each(this.selects[index].getElements('option'), function(el){
			if (el.get('text') == selectedText){
				el.set('selected', true);
			} else {
				el.set('selected', false);
			}
			this.selects[index].fireEvent('change');
		}, this);
	},
	
	deleteList: function(){
		this.list.dispose();
	},

	expandList: function(index){
		var dimensions = this.triggers[index].getCoordinates();
		this.lists[index].setStyles({'display':'block', 'left':dimensions.left, 'min-width':(dimensions.width)});
		var listBottom = dimensions.bottom + this.lists[index].getSize().y;
		var listTop = dimensions.top - this.lists[index].getSize().y;
		if ((listBottom > (window.innerHeight + window.getScroll().y))&&(listTop > window.getScroll().y)){
			this.lists[index].setStyle('top', dimensions.top - this.lists[index].getSize().y +2).removeClass('down').addClass('up');
			var direction = 'up';
		} else {
			this.lists[index].setStyle('top', dimensions.bottom -2).removeClass('up').addClass('down');
			var direction = 'down';
		}
		this.triggers[index].getElement('.'+this.options.triggerClass).set('html', this.options.triggerActiveHtml);
		this.triggers[index].addClass(this.options.expandedClass).removeClass('up').removeClass('down').addClass(direction);		
	},
	
	collapseList: function(index){
		this.lists[index].setStyle('display', 'none');
		this.triggers[index].getElement('.'+this.options.triggerClass).set('html', this.options.triggerInactiveHtml);
		this.triggers[index].removeClass(this.options.expandedClass);	
	},
	
	addNavigation: function(index){
		var self = this;
		this.triggers[index].addEvent('keydown', function(e){
			if (e.key != 'tab'){
				e.stop();
			}
			self.addSelectionEvents(e, index);
			if ((self.lists[index].getStyle('display') == 'none')&&((e.key == 'space')||((['down', 'up'].contains(e.key))&&(e.alt)))){
				self.expandList(index);
			} else if ((['tab', 'esc', 'space'].contains(e.key))||((['down', 'up'].contains(e.key))&&(e.alt))){
				self.collapseList(index);
			}
		});
	},
	
	/**
	 * @param object - e - The event object
	 */
	addSelectionEvents: function(e, index){
		var selector = ((!e.alt)&& (['up', 'down', 'left', 'right'].contains(e.key))) ? '.'+this.options.liClass : '.'+e.key.toLowerCase();
		var sort = ((!e.alt)&& (['up', 'down', 'left', 'right'].contains(e.key))) ? false : true;
		var listItems = this.lists[index].getElements(selector);

		if (listItems.length > 0){
			var currentLi = this.lists[index].getElements('.'+this.options.activeLiClass)[0];
			var currentVal = currentLi.get('text');
			var numLis = listItems.length - 1;
			var currentLiIndex = 0;
			var firstItem = [];
			Array.each(this.lists[index].getElements('.'+this.options.optgroupClass+' ul'), function(optGroup){
				if (optGroup.getFirst(selector)){
					firstItem.push(optGroup.getFirst(selector).get('text'));
				}
			});			
			Array.each(listItems, function(item, order){
				if (currentVal == item.get('text')){
					currentLiIndex = order;
				} 
			});		
			
			if ((((e.key == 'down')||(e.key == 'right'))&&(currentLiIndex < numLis))||((sort)&&(currentLiIndex < numLis)&&(currentLi.hasClass(e.key)))){
				currentVal = listItems[(currentLiIndex + 1)].addClass(this.options.activeLiClass).get('text');
				currentLi.removeClass(this.options.activeLiClass);
				this.setScrollPosition(currentLi, index, e, firstItem);
			} else if (((currentLiIndex == numLis)&&(sort))||((sort)&&(!currentLi.hasClass(e.key)))){
				currentLi.removeClass(this.options.activeLiClass);
				currentVal = listItems[0].addClass(this.options.activeLiClass).get('text');
				this.setScrollPosition(listItems[0], index, e, firstItem);
			} else if ((((e.key == 'up')||(e.key == 'left'))&&(currentLi)&&(currentLiIndex > 0))||((sort)&&(currentLiIndex > 0))){
				currentVal = listItems[(currentLiIndex - 1)].addClass(this.options.activeLiClass).get('text');
				currentLi.removeClass(this.options.activeLiClass);
				this.setScrollPosition(currentLi, index, e, firstItem);
			}
			this.triggers[index].getElement('.'+this.options.displayClass).set('text', currentVal);
			this.updateSelect(index, currentVal);
		}
	},
	
	setScrollPosition: function(listItem, index, e, firstItem){
		Array.each(this.lists[index].getElements('li'), function(item, order){
			var height = item.getSize().y;
			//The extra checks in the first statement are to switch between optgroups using the alpha sort
			if ((firstItem.contains(item.get('text')))&&(this.lists[index].getElements('.'+this.options.activeLiClass)[0].get('text') == item.get('text'))){
				this.lists[index].scrollTo(0, (height * order));
			} else if (listItem.get('text') == item.get('text')){
				if (['up', 'left'].contains(e.key)){
					this.lists[index].scrollTo(0, (height * (order)) - height);
				} else {
					this.lists[index].scrollTo(0, (height * (order)) + height);
				}
			}
		}, this);		 
	}
});
/**
 * @author Virtuosi Media
 * @link http://www.virtuosimedia.com
 * @version 1.0
 * @copyright Copyright (c) 2012, Virtuosi Media
 * @license: MIT License
 * @description: Creates autocomplete for input fields
 * Requirements: MooTools 1.4 Core - See http://mootools.net
 */
var Autocomplete = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selectors - The selectors for the autocomplete inputs
	 */
	initialize: function(selectors){
		var inputs = $$(selectors);
		var self = this;
		Array.each(inputs, function(input){
			input.addEvents({
				'focus': function(e){self.createDropdown(input);},
				'blur': function(){
					self.removePrompt();
					self.removeList.delay(200, this, input);
				},
				'keyup': function(e){self.updateList(e, input);},
				'keydown': function(e){	if (['up', 'down', 'enter'].contains(e.key)){e.stop();}}
			}).set('autocomplete', 'off');
		});
	},
	
	createDropdown: function(input){
		var min = (input.hasData('min')) ? input.getData('min') : 1;
		
		if (input.get('value').length >= min){
			this.removePrompt();
			var loading = (input.hasData('loading')) ? input.getData('loading') : 'Loading...';
			this.createPrompt(input, loading);
			
			var list = this.getList(input);
			var options = list.getElements('li');
			var self = this;
			
			if (options.length > 0){
				var dim = input.getCoordinates();
				this.removePrompt();
				list.setStyles({top: dim.bottom, width: dim.width}).inject(input, 'after');
				options.addEvent('click', function(){
					input.set('value', this.getData('item'));
					self.removeList(input);
					input.focus();
					input.fireEvent('completed');
				});
				$(document.body).fireEvent('ajaxUpdate', list);
			} else {
				var noResults = (input.hasData('empty')) ? input.getData('empty') : 'No results found';
				this.createPrompt(input, noResults);				
			}			
		} else if (input.hasData('prompt')) {
			this.createPrompt(input, input.getData('prompt'));
		}
	},

	createPrompt: function(input, message){
		this.removePrompt();
		var dim = input.getCoordinates();
		var prompt = new Element('span', {
			'class': 'autocompletePrompt', 
			text: message, 
			styles: {top: dim.bottom, width: dim.width, left: dim.left}
		}).inject(input, 'after');
	},
	
	removePrompt: function(){
		$$('.autocompletePrompt').dispose();
	},
	
	getList: function(input){
		var source = input.getData('source');
		var list = input.getData('options');
		var text = input.get('value').trim();
		var limit = (input.hasData('limit')) ? input.getData('limit').toInt() : 5;
		var sort = (input.hasData('sort')) ? (input.getData('sort') === 'true') : true;

		if (['inlineHTML', 'inlineCSV'].contains(source)){
			list = $(list).get('html');
		} else if (['ajaxHTML', 'ajaxCSV'].contains(source)){
			list = this.getAjaxList(input);
		}
		
		if (['attribute', 'ajaxCSV', 'inlineCSV'].contains(source)){
			list = this.createListFromCSV(list, text, limit, sort);
		} else {
			list = this.filterHTMLList(Elements.from(list), text, limit, sort);
		}
		return list;
	},

	getAjaxList: function(input){
		var url = input.getData('options');
		var query = (input.hasData('query')) ? input.getData('query') : 'q';
		var self = this;
		var ajaxRequest = new Request({
			url: url,
			method: 'get',
			async: false,
			onSuccess: function(text){ 
				self.list = text;
			}
		}).send(query + '=' + input.value);
		return this.list;
	},
	
	createListFromCSV: function(values, text, limit, sort){
		values = values.split(',').filter(function(value){
			return value.toLowerCase().contains(text.toLowerCase());
		});
		if (sort) {values.sort();}
		values.slice(0, limit);
		var list = new Element('ul', {'class': 'autocompleteList'});
				
		Array.each(values, function(value){
			value = value.trim();
			text = text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); 
			var regex = new RegExp('(' + text + ')', 'gi');
			var li = new Element('li', {
				'data-item': value, 
				html: value.replace(regex, "<strong>$1</strong>")
			}).inject(list);
		});
		return list;
	},

	filterHTMLList: function(list, text, limit, sort){
		var options = list.getElements('li')[0];
		var filteredOptions = [], filteredText = {};
		text = text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		var regex = new RegExp('(' + text + ')', 'gi');
		
		Array.each(options, function(option, index){
			option = $$(options[index])[0];
			if (option.getData('item').toLowerCase().contains(text.toLowerCase())){
				var optionText = option.getElement('.text');
				optionText.set('html', optionText.get('html').replace(regex, "<strong>$1</strong>"));
				filteredOptions.push(option);
			}
		});

		filteredOptions = (sort) ? this.sortHTMLListItems(filteredOptions).slice(0, limit) : filteredOptions.slice(0, limit);
		list = new Element('ul', {'class': 'autocompleteList'});
		
		return list.adopt(filteredOptions);
	},
	
	sortHTMLListItems: function(items){
		var sortedList = [], textList = [];
		
		Array.each(items, function(item){
			textList.push(item.getData('item'));
		});
		
		textList.sort();
		
		Array.each(textList, function(text){
			Array.each(items, function(item){
				if (item.getData('item') == text){
					sortedList.push(item);
				}
			});			
		});
		
		return sortedList;
	},
	
	updateList: function(event, input){
		if (['up', 'down'].contains(event.key)){
			event.stop();
			this.setNextOption(event.key, input);
		} else if (event.key == 'enter'){
			event.stop();
			var list = input.getNext('.autocompleteList');
			if (list){
				var currentOption = this.getCurrentOption(input);
				input.set('value', list.getElements('li')[currentOption].getData('item'));
				this.removeList(input);
			}
			input.fireEvent('completed');
		} else {
			this.removeList(input);
			this.createDropdown(input);
		}		
	},

	getCurrentOption: function(input){
		var options = input.getNext('.autocompleteList').getElements('li');
		var current = -1;
		Array.each(options, function(option, index){
			current = (option.hasClass('active')) ? index : current;
		});
		return current;
	},

	setNextOption: function(key, input){
		if (input.getNext('.autocompleteList')){
			var options = input.getNext('.autocompleteList').getElements('li');
			var numOptions = options.length - 1;
			var currentOption = this.getCurrentOption(input);
							
			if (key == 'down'){
				var nextOption = ((currentOption + 1) <= numOptions) ? currentOption + 1 : currentOption;
			} else {
				var nextOption = ((currentOption - 1) >= 0) ? currentOption - 1 : null;
			}
	
			options.removeClass('active');
			if (nextOption != null){
				options[nextOption].addClass('active');
			}
		}
	},
	
	removeList: function(input){
		var list = input.getNext('.autocompleteList');
		if (list){list.dispose();}
	}
});
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
				'blur': function(){self.removeList.delay(200, this, input);},
				'keyup': function(e){self.updateList(e, input);},
				'keydown': function(e){	if (['up', 'down'].contains(e.key)){e.stop();}}
			});
		});
	},
	
	createDropdown: function(input){
		var min = (input.hasData('min')) ? input.getData('min') : 1;
		
		if (input.get('value').length >= min){
			var list = this.getList(input);
			var options = list.getElements('li');
			var self = this;
			
			if (options.length > 0){
				var dim = input.getCoordinates();
				list.setStyles({top: dim.bottom, width: dim.width}).inject(input, 'after');
				options.addEvent('click', function(){
					input.set('value', this.getData('text'));
					self.removeList(input);
					input.focus();
				});
			}			
		}
	},

	getList: function(input){
		var source = input.getData('source');
		var list = input.getData('options');
		var text = input.get('value').trim();
		var limit = (input.hasData('limit')) ? input.getData('limit').toInt() : 5;

		if (['inlineHTML', 'inlineCSV'].contains(source)){
			list = $(list).get('html');
		}
		
		if (['attribute', 'ajaxCSV', 'inlineCSV'].contains(source)){
			list = this.createListFromCSV(list, text, limit);
		} else {
			list = this.filterHTMLList(Elements.from(list), text);
		}
		return list;
	},
	
	createListFromCSV: function(values, text, limit){
		values = values.split(',').filter(function(value){
			return value.toLowerCase().contains(text.toLowerCase());
		}).sort().slice(0, limit);
		var list = new Element('ul', {'class': 'autocompleteList'});
				
		Array.each(values, function(value){
			value = value.trim();
			var regex = new RegExp('(' + text + ')', 'gi');
			var li = new Element('li', {
				'data-text': value, 
				html: value.replace(regex, "<strong>$1</strong>")
			}).inject(list);
		});
		return list;
	},

	filterHTMLList: function(list, text){
		var options = list.getElements('li');
		var filteredOptions = [];
		var regex = new RegExp('(' + text + ')', 'gi');
		Array.each(options, function(option, index){
			option = option[index];
			console.log(option.getData('item').toLowerCase())
			if (option.getData('item').toLowerCase().contains(text.toLowerCase())){
				var optionText = option.getElement('.text');
				optionText.set('html', optionText.get('html').replace(regex, "<strong>$1</strong>"));
				filterOptions.push(option);
			}
		});
		return $$(list.clone(false))[0].adopt(filteredOptions.join(''));
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
				input.set('value', list.getElements('li')[currentOption].getData('text'));
				this.removeList(input);
			}			
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
	},
	
	removeList: function(input){
		var list = input.getNext('.autocompleteList');
		if (list){list.dispose();}
	}
});
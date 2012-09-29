/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Validates forms
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Validate = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selectors - The selectors for the forms to be validated. Each selector must refer to a form
	 */
	initialize: function(selectors){
		this.errors = {};
		this.elements = {};
		Array.each($$(selectors), function(form, index){
			var id = form.get('id');
			this.errors[id] = {};
			var elements = this.elements[id] = {};
			elements.inputs = form.getElements('textarea, input[type=text], input[type=password], input[type=checkbox]');
			elements.files = form.getElements('input[type=file]');
			elements.radios = form.getElements('input[type=radio]');
			elements.selects = form.getElements('select');
			this.attachEvents(form, elements, id);
		}, this);
	},
	
	attachEvents: function(form, elements, id){
		var self = this;
		form.addEvents({
			'submit': function(e){
				self.validateAll(elements);
				if (self.errorsExist(id)){e.stop();}
			}
		});
				
		elements.inputs.addEvent('blur', function(){self.validateInput(this);});
		elements.radios.addEvent('blur', function(){self.validateRadio(this);});
		elements.files.addEvents({
			change: function(){self.validateInput(this);},
			blur: function(){self.validateInput(this);}
		});
		elements.selects.addEvents({
			change: function(){self.validateInput(this);},
			blur: function(){ //The delay is to prevent an error from showing initially with the select replace plugin
				var select = this;
				var wait = function(){self.validateInput(select);};
				wait.delay(200);
			}
		});		
	},
	
	validateInput: function(input){
		var validators = (input.hasData('validate')) ? JSON.decode(input.getData('validate')) : false;
		var successMessage = (input.hasData('success')) ? input.getData('success') : false;
		var name = input.get('name');
		var value = input.get('value');
		var self = this;
		var id = $$('[name=' + name +']').getAncestor('form')[0].get('id');
		this.errors[id][name] = [];

		if (validators){
			Object.each(validators, function(settings, validator){
				var error = (settings.hasOwnProperty('error')) ? settings.error : null;
				var params = (settings.hasOwnProperty('params')) ? settings.params : {};
				
				self[validator](name, value, error, params);
			});
		}
	},
	
	validateRadio: function(radio){ //This assumes that the form replacements plugin is also present, or it won't work
		var group = $$('[name=' + radio.get('name') + ']').filter(function(item){
			return (item.tagName.toLowerCase() == 'input') ? item : false;
		});
		var lastRadio = group.length - 1;
		var self = this;
		
		if (group.filter(function(item){ return item.checked;}).length > 0){
			self.validateInput(radio);
		} else {
			Array.each(group, function(item, index){
				if ((index === lastRadio) && (radio == item)){
					self.validateInput(radio);
				}
			});
		}
	},
	
	validateAll: function(elements){
		var self = this;
		elements.inputs.each(function(input){self.validateInput(input);});
		elements.files.each(function(file){self.validateInput(file);});
		elements.radios.each(function(radio){self.validateRadio(radio);});
		elements.selects.each(function(select){self.validateInput(select);});
	},

	errorsExist: function(id){
		var errorCount = 0;
		Object.each(this.errors[id], function(item){errorCount += item.length;});
		return (errorCount > 0);
	},
	
	disableSubmit: function(name){
		var form = $$('[name=' + name +']').getAncestor('form')[0];
		var submit = form.getElements('[type="submit"], [type="button"]');
		if (submit.length > 0){submit.set('disabled', this.errorsExist(form.get('id')));}
	},
	
	setValidator: function(name, error, valid){
		if (valid){
			this.createSuccess(name, error);
		} else {
			this.createError(name, error);
		}
		this.disableSubmit(name);
	},

	createError: function(name, error){
		if (!$(name + 'Error')){
			var input = ($$('[name=' + name +']')[0].get('type') == 'radio') ? $$('[name=' + name +']') : $$('[name=' + name +']')[0];
			var label = $$('label[for=' + name + ']');
			var location = (label.length > 0) ? label[0] : input;
			var error = new Element('span', {id: name + 'Error', html: error, 'class':'errorMessage'}).inject(location, 'after');
			
			input = (input.tagName.toLowerCase() == 'select') ? $(name + 'Replace') : input;
			input.removeClass('success').addClass('error');
			label.removeClass('success').addClass('error');
			
			if ($(name + 'Success')){
				$(name + 'Success').dispose(); 
			}
		}
		var id = $$('[name=' + name +']').getAncestor('form')[0].get('id');
		this.errors[id][name].push(error);
	},
	
	createSuccess: function(name, error){
		var id = $$('[name=' + name +']').getAncestor('form')[0].get('id');
		this.errors[id][name].filter(function(err, index, errors){ 
			if (err == error){
				errors.splice(index);
			}
			return errors;
		});
		
		if ((!$(name + 'Success')) && (this.errors[id][name].length == 0)){
			var input = $$('[name=' + name +']')[0];
			var label = $$('label[for=' + name + ']');
			var location = (label.length > 0) ? label[0] : input;
			var successMessage = (input.hasData('success')) ? input.getData('success') : new Element('i', {'class': 'iconCheck1'});
			var success = new Element('span', {id: name + 'Success', 'class':'successMessage'}).adopt(successMessage).inject(location, 'after');
			
			input = ($$('[name=' + name +']')[0].get('type') == 'radio') ? $$('[name=' + name +']') : input;
			input = (input.tagName.toLowerCase() == 'select') ? $(name + 'Replace') : input;
			input.removeClass('error').addClass('success');
			label.removeClass('error').addClass('success');
			
			if ($(name + 'Error')){
				$(name + 'Error').dispose(); 
			}
		}
	},
	
	required: function(name, value, error){
		error = (error) ? error : 'This field is required.';
		var element = $$('[name='+name+']');
		var type = element.getProperty('type');
		
		if (type.contains('checkbox') || type.contains('radio')){
			if (type.contains('checkbox')){
				var valid = element[0].checked;
			} else {
				var valid = (element.filter(function(item){return item.checked;}).length > 0);
			}
		} else {
			var value = (type.contains('select')) ? element.getSelected()[0] : element.get('value')[0];
			var valid = (value.trim().length > 0);	
		}
		
		this.setValidator(name, error, valid);
	},

	regex: function(name, value, error, regex){
		error = (error) ? error : 'An error occurred. This field did not match the expected input.';
		var valid = (new RegExp(regex).test(value));
		this.setValidator(name, error, valid);
	},	
	
	minLength: function(name, value, error, length){
		error = (error) ? error : 'You must enter at least ' + length + ' characters.';
		var valid = (value.length >= length);
		this.setValidator(name, error, valid);
	},
	
	maxLength: function(name, value, error, length){
		error = (error) ? error : 'You may enter no more than ' + length + ' characters.';
		var valid = (value.length <= length);
		this.setValidator(name, error, valid);
	},
	
	range: function(name, value, error, length){
		error = (error) ? error : 'This field must be more than ' + length[0] + ' and less than ' + length[1] + ' characters.';
		var valid = ((value.length >= length[0]) && (value.length <= length[1]));
		this.setValidator(name, error, valid);
	},	
	
	matches: function(name, value, error, matchName){
		error = (error) ? error : 'This field must match the value of the ' + matchName + ' field.';
		var valid = (value == $$('[name="' + matchName + '"]')[0].get('value'));
		this.setValidator(name, error, valid);
	},
	
	differs: function(name, value, error, matchName){
		error = (error) ? error : 'This field cannot match the value of the ' + matchName + ' field.';
		var valid = (value != $$('[name="' + matchName + '"]')[0].get('value'));
		this.setValidator(name, error, valid);
	},
	
	includes: function(name, value, error, checklist){
		error = (error) ? error : 'This field must contain one of the following values: ' + checklist.join(', ') + '.';
		var valid = (checklist.filter(function(item){ return new RegExp(item).test(value);}).length > 0);
		this.setValidator(name, error, valid);
	},
	
	excludes: function(name, value, error, checklist){
		error = (error) ? error : 'This field cannot contain any of the following values: ' + checklist.join(', ') + '.';
		var valid = (checklist.filter(function(item){ return new RegExp(item).test(value);}).length == 0);
		this.setValidator(name, error, valid);
	},
	
	alpha: function(name, value, error){
		if (!error){ error = "This field may contain only letters."; }
		this.regex(name, value, error, '^[a-zA-Z]+$');
	},
	
	numeric: function(name, value, error){
		if (!error){ error = "This field may contain only numbers."; }
		this.regex(name, value, error, '^[0-9]+$');
	},

	alphanumeric: function(name, value, error){
		if (!error){ error = "This field may contain only letters or numbers."; }
		this.regex(name, value, error, '^[a-zA-Z0-9]+$');
	},

	email: function(name, value, error){
		if (!error){ error = "Please enter a valid email address."; }
		this.regex(name, value, error, '^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$');
	},

	url: function(name, value, error){
		if (!error){ error = "Please enter a valid URL."; }
		this.regex(name, value, error, '^(http|https|ftp)://[A-Za-z0-9-_]+\.[A-Za-z0-9]{2,4}[A-Za-z0-9-_%&\?\/.#=]*$');
	},

	password: function(name, value, error){
		if (!error){ error = "Your password must contain one lowercase letter, one uppercase letter, one number, and be at least 6 characters long."; }
		this.regex(name, value, error, "(?=^.{6,}$)((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]))^.*");
	},

	usZip: function(name, value, error){
		if (!error){ error = "Please enter a valid US ZIP Code."; }
		this.regex(name, value, error, '^[0-9]{5}(?:-[0-9]{4})?$');
	},

	canadaPostal: function(name, value, error){
		if (!error){ error = "Please enter a valid Canadian Postal Code."; }
		this.regex(name, value, error, '^[ABCEGHJKLMNPRSTVXY][0-9][A-Z] [0-9][A-Z][0-9]$');
	},

	credit: function(name, value, error){ //Validates all major credit cards
		if (!error){ error = "Please enter a valid credit card number."; }
		this.regex(name, value, error, '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6011[0-9]{12}|3(?:0[0-5]|[68][0-9])[0-9]{11}|3[47][0-9]{13})$');
	},

	dateMDY: function(name, value, error){
		if (!error){ error = "Please enter a valid date in M/D/Y format."; }
		this.regex(name, value, error, '^(0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)?[0-9]{2}$');
	},

	dateYMD: function(name, value, error){
		if (!error){ error = "Please enter a valid date in Y/M/D format."; }
		this.regex(name, value, error, '^(19|20)?[0-9]{2}[- /.](0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])$');
	},

	imageFile: function(name, value, error){
		if (!error){ error = "Please upload a valid image file. Valid files end with one of the following extensions: .jpg, .jpeg, .bmp, .gif, .png."; }
		this.regex(name, value, error, '\.jpg|jpeg|bmp|gif|png$');
	},

	phone: function(name, value, error){ //This is for North American phone numbers only
		if (!error){ error = "Please enter a valid phone number including area code."; }
		this.regex(name, value, error, '^(([0-9]{1})*[- .(]*([0-9]{3})[- .)]*[0-9]{3}[- .]*[0-9]{4})+$');
	}	
});
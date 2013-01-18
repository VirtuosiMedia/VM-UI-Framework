/**
 * @author Virtuosi Media
 * @link http://www.virtuosimedia.com
 * @version 1.0
 * @copyright Copyright (c) 2012, Virtuosi Media
 * @license: MIT License
 * @description: Creates slider controls for input fields
 * Requirements: MooTools 1.4 Core - See http://mootools.net
 */
var Sliders = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selectors - The selectors for the slider inputs
	 */
	initialize: function(selectors){
		var inputs = $$(selectors);
		var self = this;
		Array.each(inputs, function(input){
			self.createSlider(input);
		});
	},
	
	createSlider: function(input){
		input.setStyle('display', 'none');
		var name = input.get('name');
		var options = (input.hasData('options')) ? input.getData('options').split(',') : false;
		
		if (options){
			var range = [0, options.length-1];
			var increment = 1;
			var steps = range.getLast();
		} else {
			if (input.hasData('range')){
				var range = input.getData('range').split(',');
				range.each(function(item, index, arr){
					range[index] = item.toInt();
				}); 
			} else {
				var range = [0, 100];
			}
			var increment = (input.hasData('increment')) ? input.getData('increment').toInt() : 1;
			var steps = (input.hasData('increment')) ? Math.round((range[1] - range[0])/increment) : range.getLast();
		}

		if (input.hasData('start')){
			var start = (options) ? options.indexOf(input.getData('start')) : input.getData('start').toString();
		} else {
			var start = range[0].toString();
		}
		
		var container = new Element('ul', {id: name + 'Container', 'class': 'sliderContainer'});
		var knob = new Element('a', {'class': 'knob', href: '#'});
		var counter = new Element('li', {'class': 'counter', text: start});
		var track = new Element('li', {'class': 'track'}).adopt(knob, counter);
		
		var minValue = (options) ? options[0] : range[0].toString();
		var min = new Element('li', {'class': 'min', text: minValue});
		var maxValue = (options) ? options.getLast() : range.getLast().toString();
		var max = new Element('li', {'class': 'max', text: maxValue});
				
		container.adopt(min, track, max).inject(input, 'after').addEvent('click', function(){
			this.getElement('.knob').focus();
		});

		var inputSlider = new Slider(track, knob, {
			snap: true, wheel: true, range: range, initialStep: start, steps: steps,
			onChange: function(step){
				var value = (options) ? options[step] : step;
				counter.set('text', value);
				input.set('value', value);
				knob.setData('step', step);
			}
		});
		knob.addEvents({
			'click': function(e){e.stop(); this.focus();},
			'keydown': function(e){
				var step = this.getData('step').toInt();
				if (e.key == 'right'){
					inputSlider.set(step + increment);
				} else if (e.key == 'left'){
					inputSlider.set(step - increment);
				}
			}
		});
	}
});
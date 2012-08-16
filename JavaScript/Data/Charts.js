/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Creates data charts
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Charts = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selectors - The selectors for chart containers
	 */
	initialize: function(selectors){
		var self = this;
		this.namespace = "http://www.w3.org/2000/svg";
		Array.each($$(selectors), function(chart){
			self.createChart(chart, selectors);
		});
	},
	
	createChart: function(chart, selectors){
		var self = this;
		var data = JSON.decode(chart.getData('chartData'));
		var type = 'render'+chart.getData('type').capitalize();
		var colors = ['#09F', "#F00", "#CCC"];
		var svg = new SVG('svg', {viewBox:"0 0 160 160", preserveAspectRatio:"none"});
		this.xOffset = 30;
		this.yOffset = 30;
		
		//If not pie chart
		this.setMaxes(data);
		
		Array.each(data, function(dataObject, index){
			svg.adopt(self.renderLine(dataObject, colors[index]));
		});
		svg.adopt(this.renderAxis(data));
		
		chart.adopt(svg.render());
	},

	setMaxes: function(data){
		var xValues = [], yValues = [];
		Array.each(data, function(dataObject, index){
			xValues.combine(dataObject.x);
			yValues.combine(dataObject.y);
		});
		this.maxX = Math.max.apply(Math, xValues);
		this.maxY = Math.max.apply(Math, yValues);
		console.log(this.maxY)
	},
	
	renderAxis: function(data){
		var xOffset = this.xOffset, yOffset = this.yOffset;	
		var line = new SVG.Path({
			d: 'M '+xOffset+' '+yOffset+', '+xOffset+' '+(100+yOffset)+', '+(100+xOffset)+' '+(100+yOffset),
			stroke: "#333",
			fill: "transparent",
			"stroke-width": 1
		});
		return line.render();		
	},
	
	/**
	 * @description Normalizes a single coordinate so it can be displayed in the appropriate perspective ratio
	 * @param numeric value - The value to be normalized
	 * @param string axis - Either x or y
	 */
	normalize: function(value, axis){
		var max = this['max'+axis.capitalize()];
		var offset = this[axis+'Offset'];
		if (axis == 'y'){
			value = (100 + offset) - Math.round(((value/max) * 100));	
		} else {
			value = Math.round(((value/max) * 100)) + offset;	
		}
		return value;
	},
	
	/**
	 * Variations: stackedBar, stackedBarPercent
	 * Options: orientation(horizontal|vertical)
	 * Notes:	0.5-1.0 bar gap width
	 * 			Tick marks on outside
	 * 			Fill at least 2/3's vertical scale
	 * 			Horizontal labels should be flush right
	 * 			Sort single-variable horizontal charts in order of data
	 * Use: Investigate specific comparisons in time
	 * 		Compare categorical data
	 * 		
	 */
	renderBar: function(data){},

	/**
	 * Variations: scatter, scatterLine,
	 * Options: points, line, fill
	 * Notes:	Tick marks on outside
	 * 			Lines should be thick enough to see, but not too thick
	 * 			Four or fewer lines
	 * 			Fill at least 2/3's vertical scale
	 * Use: 	Analyze trends, patterns, and exceptions
	 * 			 
	 */
	renderLine: function(data, color){
		var self = this;
		var numPoints = data.x.length - 1;
		var points = [];
		
		for (var i = 1; i < numPoints; i++){
			points.push(self.normalize(data.x[i], 'x') + ' ' + self.normalize(data.y[i], 'y'));
		}
		
		var line = new SVG.Path({
			d: 'M ' + self.normalize(data.x[0], 'x') +' '+ self.normalize(data.y[0], 'y') + ' ' + points.join(', '),
			stroke: color,
			fill: "transparent",
			"stroke-width": 1
		});

		return line.render();	
	},

	/**
	 * Notes: 	No separation, 3d or donuts
	 * 			Largest slice to right of noon, 2nd largest to left of noon
	 * 			No more than 5 slices
	 * Use: Single variable comparison for 5 or fewer items
	 */
	renderPie: function(data){}
	
});
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

	defaultOptions: {
		axisColor: '#000',									//The hex color of the axis lines and tick marks
		colors: ['#09F', "#F00", "#636", "#690"],			//The chart hex colors for lines, bars, and pie segments
		keyPosition: 'right',								//Where to show the key: left, right, top, bottom
		lineLabels: [],										//Labels for each of the lines, will also show in the key
		showAxis: true,										//Whether or not to show the axis lines
		showAxisLabels: true,								//Whether or not to show the axis labels
		showKey: true,										//Whether or not to show the key
		showLabels: true,									//Whether or not to show interval labels
		showLineFill: true,									//Whether or not to create a fill between the x-axis and line
		showPoints: true,									//Whether or not to show line points
		showTicks: true,									//Whether or not to show tick marks
		showTips: true,										//Whether or not to show tips on hover
		showTitle: true,									//Whether or not to show the chart title
		textColor: "#000",									//The hex code for the text color
		title: 'Untitled',									//The title of the chart
		xAxisLabel: 'x-axis',								//The x-axis label
		xInterval: 10,										//The interval between ticks on the x-axis
		xLabels: [],										//Labels for the x-axis, defaults to numbers. Should match tick count		
		yAxisLabel: 'y-axis',								//The y-axis label		
		yInterval: 10,										//The interval between ticks on the y-axis
		yLabels: []											//Labels for the x-axis, defaults to numbers. Should match tick count
	},
	
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
		var type = 'render'+chart.getData('type').capitalize();
		this.data = JSON.decode(chart.getData('chartData'));
		this.options = Object.merge(this.defaultOptions, JSON.decode(chart.getData('chartOptions')));
		this.svg = new SVG('svg', {viewBox:"0 0 160 160", preserveAspectRatio:"none"});

		this.xOffset = 30;
		this.yOffset = 30;
		
		//If not pie chart
		this.setMaxes();
		
		Array.each(this.data, function(dataObject, index){
			self.renderLine(dataObject, index);
		});
		if (this.options.showAxis){
			this.renderAxis();
		}
		
		chart.adopt(this.svg.render());
	},

	setMaxes: function(){
		var xValues = [], yValues = [];
		Array.each(this.data, function(dataObject, index){
			xValues.combine(dataObject.x);
			yValues.combine(dataObject.y);
		});
		this.maxX = Math.max.apply(Math, xValues);
		this.maxY = Math.max.apply(Math, yValues);
	},
	
	renderAxis: function(){
		var xOffset = this.xOffset, yOffset = this.yOffset;	
		var line = new SVG.Path({
			d: 'M '+xOffset+' '+yOffset+', '+xOffset+' '+(100+yOffset)+', '+(100+xOffset)+' '+(100+yOffset),
			stroke: this.options.axisColor,
			fill: "transparent",
			"stroke-width": 0.5
		});
		if (this.options.showTicks){
			this.renderTicks();
		}
		
		this.svg.adopt(line.render());		
	},

	renderTicks: function(){
		var ticks = [], 
			xOffset = this.xOffset, 
			yOffset = this.yOffset,
			xInterval = this.options.xInterval,
			yInterval = this.options.yInterval
			yStart = yOffset + 100 + .5 - yInterval,
			xStart = xOffset + xInterval;

		for (var x = xStart; x < (xStart + 100); x+=xInterval){
			ticks.push('M ' + x + ' ' + (yStart + 4 + yInterval) + ', ' + x + ' ' + (yStart + yInterval - 0.5));
		}		
		
		for (var y = yStart; y >= yOffset; y-=yInterval){
			ticks.push('M ' + (xOffset - 3) + ' ' + y + ', ' + xOffset + ' ' + y);
		}
			
		Array.each(ticks, function(tickPath){
			var tick = new SVG.Path({
				d: tickPath,
				stroke: this.options.axisColor,
				fill: "transparent",
				"stroke-width": 0.5
			});
			this.svg.adopt(tick.render());
		}, this);
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
	renderLine: function(data, index){
		var self = this;
		var numPoints = data.x.length - 1;
		var points = [];
		
		for (var i = 1; i < numPoints; i++){
			points.push(self.normalize(data.x[i], 'x') + ' ' + self.normalize(data.y[i], 'y'));
		}
		
		var line = new SVG.Path({
			d: 'M ' + self.normalize(data.x[0], 'x') +' '+ self.normalize(data.y[0], 'y') + ' ' + points.join(', '),
			stroke: this.options.colors[index],
			fill: "transparent",
			"stroke-width": 1
		});

		this.svg.adopt(line.render());	
	},

	/**
	 * Notes: 	No separation, 3d or donuts
	 * 			Largest slice to right of noon, 2nd largest to left of noon
	 * 			No more than 5 slices
	 * Use: Single variable comparison for 5 or fewer items
	 */
	renderPie: function(data){}
	
});
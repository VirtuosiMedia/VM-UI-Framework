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
		axisColor: '#333',									//The hex color of the axis lines
		colors: ['#09F', "#F00", "#636", "#690"],			//The chart hex colors for lines, bars, and pie segments
		gridColor: '#DDD',									//The hex color of the grid lines
		keyPosition: 'right',								//Where to show the key: left, right, top, bottom
		lineLabels: [],										//Labels for each of the lines, will also show in the key
		showAreaLines: false,								//Whether or not to show lines on an area chart
		showAxisLabels: true,								//Whether or not to show the axis labels
		showAxisLines: true,								//Whether or not to show the axis lines		
		showGridX: true,									//Whether or not to show the x-axis grid lines
		showGridY: true,									//Whether or not to show the y-axis grid lines
		showIntervalLabels: true,							//Whether or not to show interval labels
		showKey: true,										//Whether or not to show the key
		showLineFill: false,								//Whether or not to create a fill between the x-axis and line
		showPoints: false,									//Whether or not to show line points
		showTicksX: true,									//Whether or not to show tick marks along the x-axis
		showTicksY: true,									//Whether or not to show tick marks along the y-axis		
		showTips: true,										//Whether or not to show tips on hover
		showTitle: true,									//Whether or not to show the chart title
		textColor: "#000",									//The hex code for the text color
		title: 'Untitled Chart',							//The title of the chart
		tickColor: '#333',									//The hex color of the tick marks
		xAxisLabel: 'x-axis',								//The x-axis label
		xInterval: 25,										//The interval between ticks on the x-axis
		xLabels: [],										//Labels for the x-axis, defaults to numbers. Should match tick count		
		yAxisLabel: 'y-axis',								//The y-axis label		
		yInterval: 25,										//The interval between ticks on the y-axis
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
		var chartType = 'create'+chart.get('class').capitalize();
		this.data = JSON.decode(chart.getData('chartData'));
		this.options = Object.merge(this.defaultOptions, JSON.decode(chart.getData('chartOptions')));
		this.points = [];
		this.svg = new SVG('svg', {viewBox:"0 0 300 195"});

		this.xOffset = 30;
		this.yOffset = 30;
		
		//If not pie chart
		this.parseData();
		
		if (this.options.showTitle){
			this.setTitle();
		}

		this[chartType]();		
						
		chart.adopt(this.svg.render());
	},

	createChartLine: function(){
		if (this.options.showTicksX||this.options.showTicksY){this.renderTicks();}
		if (this.options.showGridX||this.options.showGridY){this.renderGrids();}
		if (this.options.showIntervalLabels){this.renderIntervalLabels();}
		
		Array.each(this.data, function(data, index){
			this.renderLine(index);
			if (this.options.showLineFill){this.renderLineFill(index);}			
		}, this);
		
		if (this.options.showAxisLines){this.renderAxisLines();}
		
		if (this.options.showPoints){
			Array.each(this.data, function(data, index){
				this.renderPoints(index);
			}, this);
		}		
	},
	
	createChartArea: function(){
		if (this.options.showTicksX||this.options.showTicksY){this.renderTicks();}
		if (this.options.showGridX||this.options.showGridY){this.renderGrids();}
		if (this.options.showIntervalLabels){this.renderIntervalLabels();}
		
		Array.each(this.data, function(data, index){
			if (this.options.showAreaLines){this.renderLine(index)};
			this.renderLineFill(index);			
		}, this);
		
		if (this.options.showAxisLines){this.renderAxisLines();}
		
		if (this.options.showPoints){
			Array.each(this.data, function(data, index){
				this.renderPoints(index);
			}, this);
		}		
	},
	
	createChartScatter: function(){
		if (this.options.showTicksX||this.options.showTicksY){this.renderTicks();}
		if (this.options.showGridX||this.options.showGridY){this.renderGrids();}
		if (this.options.showIntervalLabels){this.renderIntervalLabels();}
		if (this.options.showAxisLines){this.renderAxisLines();}
				
		Array.each(this.data, function(data, index){
			this.renderPoints(index);
		}, this);
	},	
	
	/**
	 * @description Parses data for line, scatter, and bar charts
	 */
	parseData: function(){
		this.setMaxes();

		Array.each(this.data, function(dataObject, index){
			var numPoints = dataObject.x.length;
			var linePoints = [];
			this.points[index] = points = {
				data: [],
				line: null
			};
			
			for (var i = 0; i < numPoints; i++){
				var normalizedX = this.normalize(dataObject.x[i], 'x');
				var normalizedY = this.normalize(dataObject.y[i], 'y');
				
				points.data.push({
					xVal: dataObject.x[i],
					yVal: dataObject.y[i],
					xPoint: normalizedX,
					yPoint: normalizedY,
				});
				
				linePoints.push(normalizedX + ' ' + normalizedY);
			}
			
			this.points[index].line = 'M ' + linePoints.join(', '); 
		}, this);
	},
	
	setMaxes: function(){
		var xValues = [], yValues = [];
		
		Array.each(this.data, function(dataObject, index){
			xValues.combine(dataObject.x);
			yValues.combine(dataObject.y);
		});
		
		this.maxX = Math.max.apply(Math, xValues);
		maxY = Math.max.apply(Math, yValues);
		yInterval = this.options.yInterval;
		
		if (maxY % yInterval){
			this.maxY = ((Math.round(maxY/yInterval) + 1) * yInterval);
		} else {
			this.maxY = maxY + yInterval;		
		}
	},

	setTitle: function(){
		var title = new SVG.Text({
			'class': 'chartTitle',
			x: 0,
			y: 20,
		});
		this.svg.adopt(title.setText(this.options.title).render());
	},
	
	renderAxisLines: function(){
		var xOffset = this.xOffset, yOffset = this.yOffset;	
		var line = new SVG.Path({
			d: 'M '+xOffset+' '+(yOffset + 0.5) +', '+xOffset+' '+(130+yOffset)+', '+(260+xOffset)+' '+(130+yOffset),
			stroke: this.options.axisColor,
			fill: "transparent",
			"stroke-width": 1
		});
		
		this.svg.adopt(line.render());		
	},

	renderTicks: function(){
		var ticks = [],
			xOffset = this.xOffset, 
			yOffset = this.yOffset,
			xInterval = (this.options.xInterval/this.maxX) * 260,
			yInterval = (this.options.yInterval/this.maxY) * 130,
			xStart = xOffset + xInterval;
			yStart = yOffset + 130 + .5 - yInterval;

		if (this.options.showTicksX){
			for (var x = xStart; x < (xOffset + 280); x+=xInterval){
				ticks.push('M ' + x + ' ' + (yStart + 3 + yInterval) + ', ' + x + ' ' + (yStart + yInterval - 0.5));
			}		
		}
			
		if (this.options.showTicksY){
			for (var y = yStart; y >= (yOffset); y-=yInterval){
				ticks.push('M ' + xOffset + ' ' + y + ', ' + (xOffset -3) + ' ' + y);
			}
		}
			
		Array.each(ticks, function(tickPath){
			var tick = new SVG.Path({
				d: tickPath,
				stroke: this.options.tickColor,
				fill: "transparent",
				"stroke-width": 0.5
			});
			this.svg.adopt(tick.render());
		}, this);
	},

	renderGrids: function(){
		var grids = [],
			xOffset = this.xOffset, 
			yOffset = this.yOffset,
			xInterval = (this.options.xInterval/this.maxX) * 260,
			yInterval = (this.options.yInterval/this.maxY) * 130,
			yStart = yOffset + 130 + .5;

		if (this.options.showGridX){
			for (var x = xOffset; x < (xOffset + 280); x+=xInterval){
				grids.push('M ' + x + ' ' + (yStart) + ', ' + x + ' ' + (yOffset + 0.5));
			}
		}

		if (this.options.showGridY){
			for (var y = yStart; y >= (yOffset); y-=yInterval){
				grids.push('M ' + xOffset + ' ' + y + ', ' + (xOffset + 260) + ' ' + y);
			}
		}
			
		Array.each(grids, function(gridPath){
			var grid = new SVG.Path({
				d: gridPath,
				stroke: this.options.gridColor,
				fill: "transparent",
				"stroke-width": 0.5
			});
			this.svg.adopt(grid.render());
		}, this);
	},	

	renderIntervalLabels: function(){
		var xLabels = [], 
			yLabels = [], 
			self = this,
			xInterval = (this.options.xInterval/this.maxX) * 260,
			yInterval = (this.options.yInterval/this.maxY) * 130;

		if (this.options.xLabels.length > 0){
			xLabels = this.options.xLabels;
		} else {
			for (var i = 0; i <= this.maxX; i+= this.options.xInterval){
				xLabels.push(i);
			}
		}
		
		var xCounter = this.xOffset;
		Array.each(xLabels, function(value, index){
			var label = new SVG.Text({
				'class': 'chartAxisLabel',
				x: xCounter,
				y: (self.yOffset + 140),
				'text-anchor': 'middle'
			});
			self.svg.adopt(label.setText(value).render());
			xCounter += xInterval;
		});
		
		if (this.options.yLabels.length > 0){
			yLabels = this.options.yLabels;
		} else {
			for (var i = 0; i <= this.maxY; i+= this.options.yInterval){
				yLabels.push(i);
			}
		}
		
		yLabels.reverse();
		
		var yCounter = this.yOffset + 2;
		Array.each(yLabels, function(value, index){
			var label = new SVG.Text({
				'class': 'chartAxisLabel',
				x: (self.xOffset - 5),
				y: yCounter, 
				'text-anchor': 'end'
			});
			self.svg.adopt(label.setText(value).render());
			yCounter += yInterval;
		});		
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
			value = (130 + offset) - Math.round(((value/max) * 130));	
		} else {
			value = Math.round(((value/max) * 260)) + offset;	
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
	renderLine: function(index){
		var line = new SVG.Path({
			"class":"dataLine",
			d: this.points[index].line,
			stroke: this.options.colors[index],
			fill: "transparent",
			"shape-rendering": "geometric-precision",
			"stroke-width": 1,
			"stroke-linecap": "round"
		}, this);
		
		this.svg.adopt(line.render());	
	},

	renderLineFill: function(index){
		var yVal = this.yOffset + 130;
		var linePath = this.points[index].line + ', ' + this.normalize(this.maxX, 'x') + ' ' + yVal + ', ' + this.xOffset + ' ' + yVal;
		var lineFill = new SVG.Path({
			"class":"dataFill",
			stroke: "transparent",
			d: linePath,
			fill: this.options.colors[index],
			"shape-rendering": "geometric-precision"			
		});		
		this.svg.adopt(lineFill.render());
	},
	
	renderPoints: function(index){
		var self = this;
		Array.each(this.points[index].data, function(data){
			var point = new SVG.Circle({
				"class":"dataPoint",
				stroke: "#FFF",
				"stroke-width": 0.25,
				cx: data.xPoint,
				cy: data.yPoint,
				r: 1.25,
				fill: self.options.colors[index],
				"shape-rendering": "geometric-precision"			
			}).addEvents({
				mouseover: function(){
					this.set('r', 1.75);
				},
				mouseout: function(){
					this.set('r', 1.25);
				}
			}, this);		
			self.svg.adopt(point.render());
		});
	},
	
	/**
	 * Notes: 	No separation, 3d or donuts
	 * 			Largest slice to right of noon, 2nd largest to left of noon
	 * 			No more than 5 slices
	 * Use: Single variable comparison for 5 or fewer items
	 */
	renderPie: function(data){}
	
});
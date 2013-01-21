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
		animate: false,										//Whether or not to animate the graph, defaults true
		animationDuration: 1,								//The total animation duration in seconds
		axisColor: '#333',									//The hex color of the axis lines
		aspectRatio: [16, 9],								//The aspect ratio of the canvas area, as an array [x, y]
		colors: ['#058DC7', "#A006C7", "#C7062D", "#06C740", "#C7A006"],			//The chart hex colors for lines, bars, and pie segments
		dataLabels: [],										//Labels for each of the data sets, will also show in the key
		dateEnd: null,										//now, or specific date
		dateFormat: '%b %d',								//Y:M:W H:M:S
		dateIntervalUnit: 'day',							//The inverval unit for a date: year, month, week, day, hour, minute, second, ms
		dateIntervalValue: 1,								//The interval value for a date
		dateStart: null,									//now, or a specific date
		decimalPrecisionX: 0,								//The number of decimal places shown on interval labels; does not affect placement or tips
		decimalPrecisionY: 0,								//The number of decimal places shown on interval labels; does not affect placement or tips
		gridColor: '#DDD',									//The hex color of the grid lines
		histogram: false,									//Removes the gap between columns or bars to create a histogram
		keyPosition: 'bottom',								//Where to show the key: left, right, top, bottom
		keyWidthPercentage: '15',							//The width percentage of the key, applicable only to key positions left and right 
		maxX: null,											//The maximum value of the x-axis
		maxY: null,											//The maximum value of the y-axis
		minX: 0,											//The minimum value of the x-axis, defaults to 0
		minY: 0,											//The minimum value of the y-axis, defaults to 0
		pyramid: false,										//Turns a bar chart into a pyramid chart, requires 2 data sets, one with negative values
		showAreaLines: false,								//Whether or not to show lines on an area chart
		showAxisLabels: false,								//Whether or not to show the axis labels
		showAxisLines: false,								//Whether or not to show the axis lines		
		showGridX: false,									//Whether or not to show the x-axis grid lines
		showGridY: false,									//Whether or not to show the y-axis grid lines
		showIntervalLabels: false,							//Whether or not to show interval labels on both axises
		showIntervalLabelsX: false,							//Whether or not to show x-axis interval labels
		showIntervalLabelsY: false,							//Whether or not to show y-axis interval labels
		showKey: false,										//Whether or not to show the key
		showLineFill: false,								//Whether or not to create a fill between the x-axis and line
		showPoints: false,									//Whether or not to show line points
		showTicksX: false,									//Whether or not to show tick marks along the x-axis
		showTicksY: false,									//Whether or not to show tick marks along the y-axis		
		showTips: false,									//Whether or not to show tips on hover
		showTitle: false,									//Whether or not to show the chart title
		textColor: "#000",									//The hex code for the text color
		title: 'Untitled Chart',							//The title of the chart
		tickColor: '#333',									//The hex color of the tick marks
		tipText: [],										//The HTML text for the tip, where values inside of {} are replaced by coordinates
															//Options include {x}, {y}, {xAxis}, {yAxis}, and {label}
		xAxisLabel: 'x-axis',								//The x-axis label
		xInterval: 25,										//The interval between ticks on the x-axis
		xAxisIsDate: false,									//Whether or not the x-axis is a date, to be used with other date options
		xLabels: [],										//Labels for the x-axis, defaults to numbers. Should match tick count		
		yAxisLabel: 'y-axis',								//The y-axis label		
		yInterval: 25,										//The interval between ticks on the y-axis
		yLabelWidthPercentage: 5,							//The width percentage of y interval labels, if they are enabled
		yLabels: []											//Labels for the x-axis, defaults to numbers. Should match tick count
	},
	
	/**
	 * @param string selectors - The selectors for chart containers
	 */
	initialize: function(selectors){
		this.namespace = "http://www.w3.org/2000/svg";
		this.selectors = selectors;
		this.charts = [], this.options = [], this.data = [], this.points = [], this.svg = [], this.dim = [], 
		this.xTipValues = [], this.yTipValues = [], this.chartTypes = [];
		
		Array.each($$(this.selectors), function(chart, index){	
			this.charts[index] = chart;			
			this.createChart(chart, index, null, false);
		}, this);
	},

	/**
	 * @description Updates a chart by clearing the canvas and repainting it with the new data
	 * @param object chart - The chart element to be resized
	 * @param int index - The index of the chart
	 * @param array data - optional - An array of objects containing x, y keys with array values of data to be charted. 
	 * 		If no data is passed in, the chart will use the existing data found in the data-chartData attribute.
	 */		
	update: function(chart, index, data){
		chart.getChildren().destroy();
		this.charts[index] = chart;
		this.createChart(chart, index, data, true);
	},
	
	/**
	 * @param object chart - The chart element
	 * @param int index - The index of the chart
	 * @param mixed data (optional) - If the chart has been updated with new data, this should be populated with an 
	 * 		array of objects, else the value should be null
	 * @param bool update (optional) - TRUE if the chart is being updated, FALSE otherwise
	 */
	createChart: function(chart, index, data, update){
		var self = this;
		this.chartTypes[index] = chartType = 'create' + chart.get('class').replace('inline', '').capitalize();
		
		this.options[index] = options = Object.merge(Object.clone(this.defaultOptions), JSON.decode(chart.getData('chartOptions')));
		this.points[index] = [];
		this.dim[index] = {};
		this.dim[index].aspectRatioHeight = (300/options.aspectRatio[0]) * options.aspectRatio[1];
		this.svg[index] = new SVG('svg', {viewBox: "0 0 300 " + this.dim[index].aspectRatioHeight, id: 'chart-' + index});
		
		//Internet explorer didn't play well with resizing
		this.setCanvasHeight(chart, index);
		window.addEvent('resize', function(){
			self.setCanvasHeight(chart, index);
		});

		this.setOffsets(index);
		this.setChartSize(index);
		
		this.data[index] = (data) ? data : JSON.decode(chart.getData('chartData'));
		if ((this.data[index])&&(this.data[index].length > 0)){
			if (['createColumnChart', 'createBarChart'].contains(chartType)){
				this.parseBarData(index);
			} else if (options.xAxisIsDate){
				options.xInterval = this.options.dateIntervalValue;
				this.parseDateData(index);
			} else {		
				this.parseData(index);
			}
		} else {
			this.data[index] = null;
			this.setDataRange(index);
		}
		
		//This fixes a bug that renders the chart in full and then animates it.
		if ((options.animate) && (!Browser.ie)&&(!Browser.firefox)){
			if (!update){
				this.svg[index].set('opacity', 0).addEvent('load', function(){
					this.set('opacity', 1);
				});
			}
		} else {
			options.animate = false; //IE can't do declarative animations, but future versions may rework the animation type 
		}		
		
		this[chartType](index);		
		chart.empty().adopt(this.svg[index].render());
		this.svg[index];
		
		chart.removeEvents().addEvent('updateChart', function(data){ //Events are removed for garbage collection
			self.update(this, self.selectors.indexOf(this), data);
		});	
	},

	/**
	 * @description Sets the canvas height according to the aspect ratio set in the options
	 * @param object chart - The chart element to be resized
	 * @param int index - The index of the chart
	 */		
	setCanvasHeight: function(chart, index){
		var options = this.options[index];
		var height = (chart.getSize()['x']/options.aspectRatio[0]) * options.aspectRatio[1];
		chart.setStyle('height', height);		
	},

	/**
	 * @description Creates a line chart
	 * @param int index - The index of the chart
	 */		
	createLineChart: function(index){
		var options = this.options[index];
		
		if (options.showTitle){this.setTitle(index);}
		if (options.showTicksX||options.showTicksY){this.renderTicks(index);}
		if (options.showGridX||options.showGridY){this.renderGrids(index);}
		if (options.showIntervalLabels||options.showIntervalLabelsY||options.showIntervalLabelsX){this.renderIntervalLabels(index);}
		if (options.showAxisLabels){this.renderAxisLabels(index);}
		if (options.showKey){this.renderKey(index);}
		
		if (this.data[index]){
			Array.each(this.data[index], function(data, dataIndex){
				this.renderLine(index, dataIndex);
				if (options.showLineFill){this.renderArea(index, dataIndex);}			
			}, this);
			
			if (this.options.showAxisLines){this.renderAxisLines(index);}
			
			if (options.showPoints){
				Array.each(this.data[index], function(data, dataIndex){
					this.renderPoints(index, dataIndex);
				}, this);
			}
		}
	},

	/**
	 * @description Creates an area chart
	 * @param int index - The index of the chart
	 */		
	createAreaChart: function(index){
		var options = this.options[index];
				
		if (options.showTitle){this.setTitle(index);}
		if (options.showTicksX||this.options.showTicksY){this.renderTicks(index);}
		if (options.showGridX||this.options.showGridY){this.renderGrids(index);}
		if (options.showIntervalLabels||options.showIntervalLabelsY||options.showIntervalLabelsX){this.renderIntervalLabels(index);}
		if (options.showAxisLabels){this.renderAxisLabels(index);}
		if (options.showKey){this.renderKey(index);}
		
		var group = new SVG('g', {'clip-path': 'url(#chartCanvas' + index + ')'});
		
		if (this.data[index]){
			this.renderMask(index);
			Array.each(this.data[index], function(data, dataIndex){
				if (options.showAreaLines){this.renderLine(index, dataIndex)};
				group.adopt(this.renderArea(index, dataIndex));			
			}, this);
		}
		
		this.svg[index].adopt(group.render());
		
		if (options.showAxisLines){this.renderAxisLines(index);}
		
		if ((options.showPoints)&&(this.data[index])){
			Array.each(this.data[index], function(data, dataIndex){
				this.renderPoints(index, dataIndex);
			}, this);
		}		
	},

	/**
	 * @description Creates a scatter chart
	 * @param int index - The index of the chart
	 */	
	createScatterChart: function(index){
		var options = this.options[index];
		
		if (options.showTitle){this.setTitle(index);}
		if (options.showTicksX||options.showTicksY){this.renderTicks(index);}
		if (options.showGridX||options.showGridY){this.renderGrids(index);}
		if (options.showIntervalLabels||options.showIntervalLabelsY||options.showIntervalLabelsX){this.renderIntervalLabels(index);}
		if (options.showAxisLabels){this.renderAxisLabels(index);}
		if (options.showAxisLines){this.renderAxisLines(index);}
		if (options.showKey){this.renderKey(index);}
		
		if (this.data[index]){
			Array.each(this.data[index], function(data, dataIndex){
				this.renderPoints(index, dataIndex);
			}, this);
		}
	},

	/**
	 * @description Creates a column chart
	 * @param int index - The index of the chart
	 */	
	createColumnChart: function(index){
		var options = this.options[index];
		
		if (this.charts[index].get('class') == 'inlineColumnChart'){options.histogram = true;}
		if (options.showTitle){this.setTitle(index);}
		if (options.showTicksX||options.showTicksY){this.renderTicks(index);}
		if (options.showGridX||options.showGridY){this.renderGrids(index);}
		if (options.showIntervalLabels||options.showIntervalLabelsY||options.showIntervalLabelsX){this.renderIntervalLabels(index);}
		if (options.showAxisLabels){this.renderAxisLabels(index);}
		if (options.showAxisLines){this.renderAxisLines(index);}
		if (options.showKey){this.renderKey(index);}
		
		var group = new SVG('g', {'clip-path': 'url(#chartCanvas' + index + ')'});
		
		if (this.data[index]){
			this.renderMask(index);
			Array.each(this.data[index], function(data, dataIndex){
				group.adopt(this.renderColumns(index, dataIndex));			
			}, this);
		}
		
		this.svg[index].adopt(group.render());		
	},
	
	/**
	 * @description Creates a bar chart
	 * @param int index - The index of the chart
	 */	
	createBarChart: function(index){
		var options = this.options[index];
		
		if (this.charts[index].get('class') == 'inlineBarChart'){options.histogram = true;}
		if (options.showTitle){this.setTitle(index);}
		if (options.showTicksX||options.showTicksY){this.renderTicks(index);}
		if (options.showGridX||options.showGridY){this.renderGrids(index);}
		if (options.showIntervalLabels||options.showIntervalLabelsY||options.showIntervalLabelsX){this.renderIntervalLabels(index);}
		if (options.showAxisLabels){this.renderAxisLabels(index);}
		if (options.showAxisLines){this.renderAxisLines(index);}
		if (options.showKey){this.renderKey(index);}
		
		var group = new SVG('g', {'clip-path': 'url(#chartCanvas' + index + ')'});
		
		if (this.data[index]){
			this.renderMask(index);
			Array.each(this.data[index], function(data, dataIndex){
				group.adopt(this.renderBars(index, dataIndex));			
			}, this);
		}
		
		this.svg[index].adopt(group.render());		
	},	
	
	/**
	 * @description Parses data for line, scatter, and bar charts
	 * @param int index - The index of the chart
	 */
	parseData: function(index){
		var options = this.options[index];	
		this.setDataRange(index);

		Array.each(this.data[index], function(dataObject, dataIndex){
			var numPoints = dataObject.x.length;
			var linePoints = [];
			this.points[index][dataIndex] = points = {
				data: [],
				line: null
			};
			
			for (var i = 0; i < numPoints; i++){
				var normalizedX = this.normalize(index, dataObject.x[i], 'x');
				var normalizedY = this.normalize(index, dataObject.y[i], 'y');
				var xValue = (options.xAxisIsDate) ? this.xTipValues[index][i] : dataObject.x[i];
				
				points.data.push({
					xVal: xValue,
					yVal: dataObject.y[i],
					xPoint: normalizedX,
					yPoint: normalizedY,
				});
				
				linePoints.push(normalizedX + ' ' + normalizedY);
			}
			
			this.points[index][dataIndex].line = 'M ' + linePoints.join(' L ');
			this.setDataLabels(index, dataIndex);
		}, this);
	},

	/**
	 * @description Prepares the data for date-based graphs before passing it to the parseData function
	 * @param int index - The index of the chart
	 */	
	parseDateData: function(index){
		var options = this.options[index];
		var startDate = ((options.dateStart)&&(options.dateStart != 'now')) ? new Date(options.dateStart) : new Date();
		var endDate = ((options.dateEnd)&&(options.dateEnd != 'now')) ? new Date(options.dateEnd) : new Date();
		var numDataPoints = (this.data[index][0].y.length - 1);
		var diff = startDate.diff(endDate, options.dateIntervalUnit);
		var xValues = [];
		this.xTipValues[index] = [];

		for (i=0; i<= numDataPoints; i++){
			xValues.push(i);
			if (this.chartTypes[index] != 'createColumnChart'){
				this.xTipValues[index].push(endDate.clone().decrement(options.dateIntervalUnit, i).format(options.dateFormat));
			}
		}		
		
		if (options.xLabels.length === 0){
			if (this.chartTypes[index] == 'createColumnChart'){
				if (((options.dateEnd)&&(options.dateEnd == 'now'))||((options.dateEnd)&&(!options.dateStart))){
					for (i=numDataPoints; i >= 0; i--){
						var dateCounter = i * options.dateIntervalValue;
						var labelDate = endDate.clone().decrement(options.dateIntervalUnit, dateCounter).format(options.dateFormat);
						options.xLabels.push(labelDate);
						this.xTipValues[index].push(labelDate);
					}					
				} else {
					var dateCounter = 0;
					for (i=0; i <= numDataPoints; i++){
						var labelDate = startDate.clone().increment(options.dateIntervalUnit, dateCounter).format(options.dateFormat);
						options.xLabels.push(labelDate);
						this.xTipValues[index].push(labelDate);
						dateCounter += options.dateIntervalValue;
					}					
				}				
			} else {
				for (i=0; i <= diff; i+=options.dateIntervalValue){
					var labelDate = startDate.clone().increment(options.dateIntervalUnit, i).format(options.dateFormat);
					options.xLabels.push(labelDate);
				}
				this.xTipValues[index].reverse();
			}
		}		

		Array.each(this.data[index], function(dataObject, dataIndex){
			this.data[index][dataIndex].x = xValues;
		}, this);		
		
		options.xInterval = options.dateIntervalValue;		
		this.parseData(index);
	},

	/**
	 * @description Prepares the data for bar graphs before passing it to the parseData function
	 * @param int index - The index of the chart
	 */	
	parseBarData: function(index){
		var options = this.options[index];
		
		//The coordinates need to be created to avoid errors when passed to parseData		
		Array.each(this.data[index], function(dataObject, dataIndex){
			if (!dataObject.x){
				dataObject.x = [];
				var numItems = dataObject.y.length;
				for (var i=0; i<numItems; i++){
					dataObject.x.push((i));
				}
			} else if (!dataObject.y){
				dataObject.y = [];
				var numItems = dataObject.x.length;
				for (var i=0; i<numItems; i++){
					dataObject.y.push(i);
				}				
			}
		});
		
		if (options.xAxisIsDate){
			options.xInterval = this.options.dateIntervalValue;
			this.parseDateData(index);
		} else {		
			this.parseData(index);
		}
	},	
	
	/**
	 * @description Sets the height and width boundaries for the chart area based on which options are enabled.
	 * @param int index - The index of the chart
	 */	
	setChartSize: function(index){
		var options = this.options[index];
		var dim = this.dim[index];

		dim.width = 300;
		dim.width = (options.showTicksX) ? dim.width - 5 : dim.width;
		dim.width = (options.showTicksY) ? dim.width - 15 : dim.width;
		dim.width = (options.showIntervalLabels||options.showIntervalLabelsY) ? dim.width - 30 : dim.width;
		dim.width = ((['right', 'left'].contains(options.keyPosition))&&(options.showKey)) ? dim.width - dim.keyWidth : dim.width;
		
		dim.height = dim.aspectRatioHeight - dim.yOffset;
		dim.height = (options.showTicksY) ? dim.height - 5 : dim.height;
		dim.height = (options.showAxisLabels) ? dim.height - 10 : dim.height;
		dim.height = (options.showIntervalLabels||options.showIntervalLabelsX) ? dim.height - 10 : dim.height;
		dim.height = ((options.keyPosition == 'bottom')&&(options.showKey)) ? dim.height - 20 : dim.height;
	},

	/**
	 * @description Sets the offset and key dimensions based on which options are enabled.
	 * @param int index - The index of the chart
	 */	
	setOffsets: function(index){
		var options = this.options[index];
		var dim = this.dim[index];
		
		dim.keyWidth = (300*(options.keyWidthPercentage/100)).toInt();
		var yLabelWidth = (300*(options.yLabelWidthPercentage/100)).toInt();
		
		dim.xOffset = (options.showTicksY) ? 5 : 0;
		dim.xOffset = (options.showAxisLabels) ? dim.xOffset + 15 : dim.xOffset;
		dim.xOffset = (options.showIntervalLabels||options.showIntervalLabelsY) ? dim.xOffset + yLabelWidth : dim.xOffset;
		dim.xOffset = ((options.keyPosition == 'left')&&(options.showKey)) ? dim.xOffset + dim.keyWidth : dim.xOffset;
		
		dim.yOffset = (options.showTitle) ? 25 : 0;
		dim.yOffset = ((options.keyPosition == 'top')&&(options.showKey)) ? dim.yOffset + 10 : dim.yOffset;
	},

	/**
	 * @description Sets the numerical boundaries for the chart area. Unless specified in the options, the y-values for 
	 * 		the chart will exceed the highest and lowest points in the data by one full interval for asthetics.
	 * @param int index - The index of the chart
	 */		
	setDataRange: function(index){
		var options = this.options[index];
		var dim = this.dim[index];
		var xValues = [], yValues = [];
		
		if (this.data[index]){
			Array.each(this.data[index], function(dataObject){
				xValues.combine(dataObject.x);
				yValues.combine(dataObject.y);
			});
		} 

		//Not having this check can result in a value of infinity for empty datasets. While Buzz Lightyear might 
		//	approve, it kind of messes up the charts for those of us without spring-loaded wings or lasers. Dear Santa...				
		if (this.data[index]){
			dim.minX = (options.minX !== null) ? options.minX : Math.min.apply(Math, xValues);
			dim.maxX = (options.maxX !== null) ? options.maxX : Math.max.apply(Math, xValues);
		} else {
			dim.minX = (options.minX !== null) ? options.minX :0;
			dim.maxX = (options.maxX !== null) ? options.maxX : 100;
		}
		
		var minY = (this.data[index]) ? Math.min.apply(Math, yValues) : 0;
		if (minY >= 0){
			dim.minY = options.minY;
		} else { //There will be an interval added on below the graph's lowest point for asthetics	
			yInterval = options.yInterval;
			dim.minY = (minY % yInterval) ? (minY - (yInterval + (minY % yInterval)) - yInterval) : minY - yInterval;
		}		
		
		if (options.maxY){
			dim.maxY = options.maxY;
		} else { //There will be an interval added on top of the graph's highest point for asthetics
			maxY = Math.max.apply(Math, yValues);
			yInterval = options.yInterval;
			dim.maxY = (maxY % yInterval) ? ((Math.round(maxY/yInterval) + 1) * yInterval) : maxY + yInterval;
		}
	},

	/**
	 * @description Sets the title for the chart
	 * @param int index - The index of the chart
	 */		
	setTitle: function(index){
		var xVal = (options.showIntervalLabels|options.showAxisLabels) ? 5 : 0;
		var title = new SVG.Text({'class': 'chartTitle', x: xVal, y: 15,});
		this.svg[index].adopt(title.setText(this.options[index].title).render());
	},

	/**
	 * @description Sets the labels for each dataset for use in key labels and tooltips
	 * @param int index - The index of the chart
	 * @param in dataIndex - The index of the dataset
	 */		
	setDataLabels: function(index, dataIndex){
		var options = this.options[index];
		options.dataLabels[dataIndex] = (options.dataLabels[dataIndex])	? options.dataLabels[dataIndex] : 'Data Set ' + (dataIndex + 1);
		options.tipText[dataIndex] = (options.tipText[dataIndex]) ? options.tipText[dataIndex] : '{xAxis}: {x}, {yAxis}: {y}';
	},

	/**
	 * @description Sets the boundaries for the clippath, which restricts animations to the chart area only
	 * @param int index - The index of the chart
	 */		
	renderMask: function(index){
		var dim = this.dim[index];

		var mask = new SVG.Rect({
			x: this.normalize(index, dim.minX, 'x'),
			y: this.normalize(index, dim.maxY, 'y'),
			height: (this.normalize(index, 0, 'y') - this.normalize(index, dim.maxY - dim.minY, 'y')),
			width: this.normalize(index, dim.maxX - dim.minX, 'x') - this.normalize(index, 0, 'x')
		});
		var chartCanvas = new SVG.ClipPath({id: 'chartCanvas'+index}).adopt(mask.render());
		var defs = new SVG('defs').adopt(chartCanvas.render());
		this.svg[index].adopt(defs.render());
	},

	/**
	 * @description Renders the x and y axises
	 * @param int index - The index of the chart
	 */		
	renderAxisLines: function(index){
		var options = this.options[index];
		var dim = this.dim[index];
		var xOffset = dim.xOffset, yOffset = dim.yOffset;
		
		var line = new SVG.Path({
			d: 'M '+xOffset+' ' +yOffset+', '+xOffset+' '+(dim.height+yOffset)+', '+(dim.width+xOffset)+' '+(dim.height+yOffset),
			stroke: options.axisColor,
			fill: "transparent",
			"stroke-width": 1,
			"shape-rendering": "geometric-precision"
		});
		
		this.svg[index].adopt(line.render());		
	},

	/**
	 * @description Renders the tickmarks for both the x and y axises, spaced according to the interval set in the options
	 * @param int index - The index of the chart
	 */		
	renderTicks: function(index){
		var options = this.options[index];
		var dim = this.dim[index];		
		
		var ticks = [],
			xOffset = dim.xOffset, 
			yOffset = dim.yOffset,
			xInterval = (options.xInterval/(dim.maxX - dim.minX)) * dim.width,
			yInterval = (options.yInterval/(dim.maxY - dim.minY)) * dim.height,
			xStart = this.normalize(index, dim.minX, 'x'),
			minY = this.normalize(index, dim.minY, 'y'),
			numX = 0;
		var yStart = (dim.minY >= 0) ? minY : this.normalize(index, 0, 'y');

		if (options.showTicksX){
			if (this.chartTypes[index] == 'createColumnChart'){
				xInterval = dim.width/this.data[index][0].x.length;
			}
			
			for (var x = xStart; x < (xOffset + dim.width + 1); x+=xInterval){
				ticks.push('M ' + x + ' ' + minY + ', ' + x + ' ' + (minY + 3));
			}
			ticks.splice(0, 1); //Interval removed to minimize visual complexity
			numX = ticks.length;
		}
			
		if (options.showTicksY){
			if (this.chartTypes[index] == 'createBarChart'){
				var numItems = (this.data[index]) ? this.data[index][0].y.length : 10;
				yInterval = dim.height/numItems;
			}
			
			if (dim.minY >= 0){
				for (var y = yStart; y >= yOffset; y-=yInterval){
					ticks.push('M ' + xOffset + ' ' + y + ', ' + (xOffset -3) + ' ' + y);
				}
				if (this.chartTypes[index] != 'createBarChart'){ticks.splice(numX, 1)};
			} else { //We need zero to show up on the graph
				for (var y = yStart; y <= minY; y+= yInterval){
					ticks.push('M ' + xOffset + ' ' + y + ', ' + (xOffset -3) + ' ' + y);
				}
				if (this.chartTypes[index] != 'createBarChart'){ticks.pop();} //Interval removed to minimize visual complexity
				
				yStart = this.normalize(index, options.yInterval, 'y');
				var maxY = this.normalize(index, dim.maxY, 'y');
				for (var y = yStart; y >= maxY; y-= yInterval){				
					ticks.push('M ' + xOffset + ' ' + y + ', ' + (xOffset -3) + ' ' + y);
				}
			}
			ticks.push('M ' + xOffset + ' ' + yOffset + ', ' + (xOffset -3) + ' ' + yOffset);
		}		
			
		Array.each(ticks, function(tickPath){
			var tick = new SVG.Path({
				d: tickPath,
				stroke: options.tickColor,
				fill: "transparent",
				"stroke-width": 0.5,
				"shape-rendering": "geometric-precision"
			});
			this.svg[index].adopt(tick.render());
		}, this);
	},

	/**
	 * @description Renders the grids for both the x and y axises, spaced according to the interval set in the options
	 * @param int index - The index of the chart
	 */		
	renderGrids: function(index){
		var options = this.options[index];
		var dim = this.dim[index];
		
		var grids = [],
			xOffset = dim.xOffset, 
			yOffset = dim.yOffset,
			xInterval = (options.xInterval/(dim.maxX - dim.minX)) * dim.width,
			yInterval = (options.yInterval/(dim.maxY - dim.minY)) * dim.height,
			maxX = this.normalize(index, dim.maxX, 'x'),
			minY = this.normalize(index, dim.minY, 'y');
		var yStart = (dim.minY >= 0) ? minY : this.normalize(index, 0, 'y');

		if (options.showGridX){
			if (this.chartTypes[index] == 'createColumnChart'){
				xInterval = dim.width/this.data[index][0].x.length;
			}
			
			for (var x = xOffset; x < (xOffset + dim.width + 1); x+=xInterval){
				grids.push('M ' + x + ' ' + minY + ', ' + x + ' ' + (yOffset + 0.5));
			}
			grids.push('M ' + maxX + ' ' + yOffset + ', ' + maxX + ' ' + minY);
		}

		if (options.showGridY){
			if (this.chartTypes[index] == 'createBarChart'){
				var numItems = (this.data[index]) ? this.data[index][0].y.length : 10;
				yInterval = dim.height/numItems;
			}
			
			if (dim.minY >= 0){
				for (var y = yStart; y >= (yOffset); y-=yInterval){
					grids.push('M ' + xOffset + ' ' + y + ', ' + (xOffset + dim.width) + ' ' + y);
				}
			} else { //We need zero to show up on the graph
				for (var y = yStart; y <= minY; y+= yInterval){
					grids.push('M ' + xOffset + ' ' + y + ', ' + (xOffset + dim.width) + ' ' + y);
				}
				
				yStart = this.normalize(index, options.yInterval, 'y');
				var maxY = this.normalize(index, dim.maxY, 'y');
				for (var y = yStart; y >= maxY; y-= yInterval){				
					grids.push('M ' + xOffset + ' ' + y + ', ' + (xOffset + dim.width) + ' ' + y);
				}				
			}
			grids.push('M ' + xOffset + ' ' + yOffset + ', ' + (xOffset + dim.width) + ' ' + yOffset);
		}
	
		Array.each(grids, function(gridPath){
			var grid = new SVG.Path({
				d: gridPath,
				stroke: options.gridColor,
				fill: "transparent",
				"stroke-width": 0.5,
				"shape-rendering": "geometric-precision"
			});
			this.svg[index].adopt(grid.render());
		}, this);
	},	

	/**
	 * @description Renders the labels for each interval. Note: all text is strictly horizontal and no checking on length
	 * 		is done, so be careful with the length of your text
	 * @param int index - The index of the chart
	 */		
	renderIntervalLabels: function(index){
		var options = this.options[index];
		var dim = this.dim[index];
		
		var xLabels = [], 
			yLabels = [], 
			self = this,
			xInterval = (options.xInterval/(dim.maxX - dim.minX)) * dim.width,
			yInterval = (options.yInterval/(dim.maxY - dim.minY)) * dim.height;

		if (options.showIntervalLabels||options.showIntervalLabelsX){
			if (this.chartTypes[index] == 'createColumnChart'){
				var numItems = this.data[index][0].x.length;
				xInterval = dim.width/numItems;
			}
			
			if (options.xLabels.length > 0){
				xLabels = options.xLabels;
			} else {
				if (this.chartTypes[index] == 'createColumnChart'){
					for (var i = 1; i <= numItems; i++){
						xLabels.push(i.toFixed(options.decimalPrecisionX));
						self.xTipValues[index] = xLabels;
					}
				} else {
					for (var i = dim.minX; i <= dim.maxX; i+= options.xInterval){
						xLabels.push(i.toFixed(options.decimalPrecisionX));
					}					
				}				
			}
			
			var xCounter = (this.chartTypes[index] == 'createColumnChart') ? dim.xOffset + (xInterval/2) : dim.xOffset;
			Array.each(xLabels, function(value){
				
				var label = new SVG.Text({
					'class': 'chartIntervalLabel',
					x: xCounter,
					y: (dim.yOffset + dim.height + 10),
					'text-anchor': 'middle'
				});
				self.svg[index].adopt(label.setText(value).render());
				xCounter += xInterval;
			});
		}
		
		if (options.showIntervalLabels||options.showIntervalLabelsY){
			if (this.chartTypes[index] == 'createBarChart'){
				var numItems = (this.data[index]) ? this.data[index][0].y.length : 10;
				yInterval = dim.height/numItems;
			}			
			
			if (options.yLabels.length > 0){
				yLabels = options.yLabels;
				self.yTipValues[index] = yLabels;
			} else {
				if (this.chartTypes[index] == 'createBarChart'){
					for (var i = 1; i <= numItems; i++){
						yLabels.push(i.toFixed(options.decimalPrecisionY));
					}
					self.yTipValues[index] = yLabels;
				} else {				
					if (dim.minY >= 0){
						for (var i = dim.minY; i <= dim.maxY; i+= options.yInterval){
							yLabels.push(i.toFixed(options.decimalPrecisionY));
						}
					} else { //We need zero to show up on the graph
						for (var i = 0; i >= dim.minY; i-= options.yInterval){
							yLabels.push(i.toFixed(options.decimalPrecisionY));
						}
						yLabels.reverse();
						for (var i = options.yInterval; i <= dim.maxY; i+= options.yInterval){
							yLabels.push(i.toFixed(options.decimalPrecisionY));
						}				
					}
				}
			}
			
			if (this.chartTypes[index] == 'createBarChart'){
				var yCounter = dim.yOffset + 2 + (yInterval/2);
			} else {
				var yCounter = dim.yOffset + 2;
				yLabels.reverse();
			}
			
			Array.each(yLabels, function(value){
				var label = new SVG.Text({
					'class': 'chartIntervalLabel',
					x: (dim.xOffset - 5),
					y: yCounter, 
					'text-anchor': 'end'
				});
				self.svg[index].adopt(label.setText(value).render());
				yCounter += yInterval;
			});
		}
	},

	/**
	 * @description Renders the axis labels in the middle of each axis, with the y-axis text rotated 
	 * @param int index - The index of the chart
	 */		
	renderAxisLabels: function(index){
		var options = this.options[index];
		var dim = this.dim[index];
		
		var intervalLabelHeight = (options.showIntervalLabels) ? 10 : 0;
		var xLabel = new SVG.Text({
			'class': 'chartAxisLabel',
			x: this.normalize(index, (dim.maxX + dim.minX)/2, 'x'),
			y: (dim.yOffset + dim.height + intervalLabelHeight + 10), 
			'text-anchor': 'middle'
		});
		this.svg[index].adopt(xLabel.setText(options.xAxisLabel).render());
		
		var yMiddle = (dim.minY < 0) ? (dim.maxY + dim.minY)/2 : (dim.maxY + dim.minY)/2;
		var xOffset = ((options.keyPosition == 'left')&&(options.showKey)) ? dim.keyWidth + 10 : 10;
		var yLabel = new SVG.Text({
			'class': 'chartAxisLabel',
			x: xOffset,
			y: this.normalize(index, yMiddle, 'y'), 
			'text-anchor': 'middle',
			transform: "rotate(270 " + xOffset + " " + this.normalize(index, yMiddle, 'y') + ")" 
		});
		this.svg[index].adopt(yLabel.setText(options.yAxisLabel).render());		
	},

	/**
	 * @description Renders keys for each dataset if the showKeys option is true
	 * @param int index - The index of the chart
	 */	
	renderKey: function(index){
		var options = this.options[index];
		var dim = this.dim[index];		
		
		var numLabels = options.dataLabels.length - 1;
		var	self = this;

		Array.each(this.data[index], function(data, dataIndex){
			var keyLabel = new SVG.Text();
			dataIndex = numLabels - dataIndex; //Reverse it to get the right order
			keyLabel.setText(options.dataLabels[dataIndex]);
			
			var keyColor = new SVG.Rect({
				height: 5,
				width: 5,
				x: -8,
				y: -4.5,
				fill: options.colors[dataIndex],
				opacity: 0.7
			});

			var group = new SVG.G({
				id: 'chartKey-' + index + '-' + dataIndex, 
				'class': 'chartKey'
			}).addEvents({
				click: function(e){
					e.stop();
					var dataIndex = this.getAttributeNS(null, 'id').split('-')[2];

					if (this.getAttributeNS(null, 'class') == 'chartKey'){
						this.setAttributeNS(null, 'class', 'chartKey disabled');
						self.charts[index].getElements('.dataset'+dataIndex).setStyle('display', 'none');
					} else {
						this.setAttributeNS(null, 'class', 'chartKey');
						self.charts[index].getElements('.dataset'+dataIndex).setStyle('display', 'block');
					}
				}
			}).adopt(keyColor.render()).adopt(keyLabel.render());
			self.svg[index].adopt(group.render());
		});
			
		this.svg[index].addEvent('DOMNodeInserted', function(){self.positionKeys(index);});
		window.addEvent('resize', function(){self.positionKeys(index);});
	},
	
	/**
	 * @description Positions the keys after they have been inserted into the document. This function is necessary 
	 * 		because it's almost impossible to pre-calculate the key width before inserting it into the DOM.
	 * @param int index - The index of the chart
	 */
	positionKeys: function(index){
		var options = this.options[index];
		var dim = this.dim[index];
		
		if (['top', 'bottom'].contains(options.keyPosition)){
			var xVal = (options.showIntervalLabels||options.showAxisLabels) ? 304 : 313;
			var totalWidth = 0;
			
			var	yVal = (options.keyPosition == 'top') ? dim.yOffset - 40 : dim.yOffset + dim.height + 10;
			yVal = (options.showTicksY) ? yVal + 5 : yVal;
			yVal = (options.showAxisLabels) ? yVal + 10 : yVal;
			yVal = (options.showIntervalLabels) ? yVal + 10 : yVal;			
		} else {
			var xVal = (options.keyPosition == 'right') ? dim.xOffset + dim.width + 15 : 15;
			var yVal = dim.yOffset + 20;
		}
		
		var chartKeys = this.charts[index].getElements('.chartKey');
		Array.each(chartKeys, function(key, keyIndex){
			if (['top', 'bottom'].contains(options.keyPosition)){
				var keyBox = key.getBBox();
				var currentX = xVal - totalWidth - keyBox.width - 5;
				totalWidth += keyBox.width + 5;
				var currentY = yVal;
			} else {
				var currentX = xVal;
				var currentY = yVal - (10 * (keyIndex + 1));
			}
			key.set('transform', 'translate(' + currentX + ',' + currentY + ')');
		});					
	},
	
	/**
	 * @description Normalizes a single coordinate so it can be displayed in the appropriate aspect ratio
	 * @param int index - The chart index
	 * @param numeric value - The value to be normalized
	 * @param string axis - Either x or y
	 */
	normalize: function(index, value, axis){
		var dim = this.dim[index];
		if (axis == 'y'){
			return (dim.height + dim.yOffset) - (((value - dim.minY)/(dim.maxY - dim.minY)) * dim.height);
		} else {
			return (((value - dim.minX)/(dim.maxX - dim.minX)) * dim.width) + dim.xOffset;
		}
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
	renderColumns: function(index, dataIndex){
		var options = this.options[index];
		var dim = this.dim[index];
		var data = this.data[index][dataIndex];
		var self = this;

		var intervalWidth = dim.width/data.x.length;
		var numDataSets = this.data[index].length;
		var columnWidth = (!options.histogram) ? intervalWidth/(numDataSets + 1) : intervalWidth/numDataSets;
		var gap = (!options.histogram) ? columnWidth/2 : 0;
		var yStart = (dim.minY >= 0) ? this.normalize(index, dim.minY, 'y') : this.normalize(index, 0, 'y');
		var columns = [];
		
		data.y.each(function(y, columnIndex){
			var intervalStart = intervalWidth * columnIndex;
			var xStart = dim.xOffset + intervalStart + gap + (dataIndex * columnWidth);
			var xEnd = xStart + columnWidth;
			var yEnd = self.normalize(index, y, 'y');
			
			var lineFill = new SVG.Path({
				"class": "dataColumn dataset" + dataIndex,
				stroke: options.colors[dataIndex],
				"stroke-width": 1,
				d: ['M', xStart, yStart, xEnd, yStart, xEnd, yEnd, xStart, yEnd].join(' '),
				fill: options.colors[dataIndex],
				"shape-rendering": "geometric-precision"
			});
			
			if (options.showTips){
				var id = 'dataPoint-' + index + '-' + dataIndex + '-' + columnIndex;
				lineFill.set('id', id).addEvents({
					mouseover: function(){
						self.renderTip(id, self.xTipValues[index][columnIndex], y, index, dataIndex);
					},
					mouseout: function(){
						self.removeTip(id);
					}
				});				
			}

			if (options.animate){
				var animation = new SVG.AnimateTransform({
					attributeName: "transform",
					type: "skewY",
					from: 50,
					to: 0,
					dur: options.animationDuration + (dataIndex/4) + 's',
					fill: 'freeze'
				});
				lineFill.adopt(animation.render());
			}
			
			columns.push(lineFill.render());
		});
		return columns;
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
	renderBars: function(index, dataIndex){
		var options = this.options[index];
		var dim = this.dim[index];
		var data = this.data[index][dataIndex];
		var self = this;

		var intervalHeight = dim.height/data.y.length;
		var numDataSets = this.data[index].length;
		if (options.pyramid){
			var columnHeight = (!options.histogram) ? intervalHeight/2 : intervalHeight;
		} else {
			var columnHeight = (!options.histogram) ? intervalHeight/(numDataSets + 1) : intervalHeight/numDataSets;
		}
		var gap = (!options.histogram) ? columnHeight/2 : 0;
		var xStart = (dim.minX >= 0) ? this.normalize(index, dim.minX, 'x') : this.normalize(index, 0, 'x');
		var bars = [];
		
		data.x.each(function(x, columnIndex){
			var intervalStart = intervalHeight * columnIndex;
			if (options.pyramid){
				var yStart = dim.yOffset + intervalStart + gap;
			} else {
				var yStart = dim.yOffset + intervalStart + gap + (dataIndex * columnHeight);
			}
			var yEnd = yStart + columnHeight;
			var xEnd = self.normalize(index, x, 'x');
			
			var lineFill = new SVG.Path({
				"class": "dataBar dataset" + dataIndex,
				stroke: options.colors[dataIndex],
				"stroke-width": 0.5,
				d: ['M', xStart, yStart, xEnd, yStart, xEnd, yEnd, xStart, yEnd].join(' '),
				fill: options.colors[dataIndex],
				"shape-rendering": "geometricPrecision"
			});
			
			if (options.showTips){
				var id = 'dataPoint-' + index + '-' + dataIndex + '-' + columnIndex;
				lineFill.set('id', id).addEvents({
					mouseover: function(){
						self.renderTip(id, x, self.yTipValues[index][columnIndex], index, dataIndex);
					},
					mouseout: function(){
						self.removeTip(id);
					}
				});				
			}

			if (options.animate){
				var animation = new SVG.AnimateTransform({
					attributeName: "transform",
					type: "skewX",
					from: -90,
					to: 0,
					dur: options.animationDuration + (dataIndex/4) + 's',
					fill: 'freeze'
				});
				lineFill.adopt(animation.render());
			}
			
			bars.push(lineFill.render());
		});
		return bars;
	},	
	
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
	renderLine: function(index, dataIndex){
		var options = this.options[index];
		var dim = this.dim[index];
		
		var line = new SVG.Path({
			id: "dataLine"+dataIndex,
			"class":"dataLine dataset"+dataIndex,
			d: this.points[index][dataIndex].line,
			stroke: options.colors[dataIndex],
			fill: "transparent",
			"shape-rendering": "geometric-precision",
			"stroke-width": 1.25,
			"stroke-linecap": "round"
		}, this);
		
		if (options.animate){
			var lineLength = line.render().getTotalLength();
			var animation = new SVG.Animate({
				attributeName: "stroke-dashoffset",
				from: lineLength,
				to: 0,
				dur: options.animationDuration + (dataIndex/4) + 's',
				fill: 'freeze'
			});
			line.set('stroke-dasharray', lineLength + ' ' + lineLength).adopt(animation.render());
		}
		this.svg[index].adopt(line.render());	
	},

	/**
	 * @description Creates an area graphic for a single dataset, animating it if animation is enabled
	 * @param int index - The index of the chart
	 * @param int dataIndex - The index of the dataset to be rendered as an area
	 */		
	renderArea: function(index, dataIndex){
		var options = this.options[index];
		var dim = this.dim[index];
		
		var coordinates = this.points[index][dataIndex].line.split(' ');
		var firstX = coordinates[1];
		var lastX = coordinates[coordinates.length - 2];
		var yVal = ((dim.maxY > 0)&& (dim.minY <=0)) ? this.normalize(index, 0, 'y') : dim.yOffset + dim.height;
		var linePath = this.points[index][dataIndex].line + ' L ' + lastX + ' ' + yVal + ' L ' + firstX + ' ' + yVal;

		var lineFill = new SVG.Path({
			"class": "dataFill dataset" + dataIndex,
			stroke: "transparent",
			d: linePath,
			fill: options.colors[dataIndex],
			"shape-rendering": "geometric-precision"
		});

		if (options.animate){
			var animation = new SVG.AnimateTransform({
				attributeName: "transform",
				type: "skewY",
				from: 50,
				to: 0,
				dur: options.animationDuration + (dataIndex/4) + 's',
				fill: 'freeze'
			});
			lineFill.adopt(animation.render());
		}
		return lineFill.render();
	},

	/**
	 * @description Renders points for a single dataset, animating them if animation is enabled
	 * @param int index - The index of the chart
	 * @param int dataIndex - The index of the dataset to be rendered as an area
	 */				
	renderPoints: function(index, dataIndex){
		var options = this.options[index];
		var dim = this.dim[index];
		
		var self = this;
		var numPoints = this.points[index][dataIndex].data.length;
		var animationLength = options.animationDuration / numPoints;
		
		Array.each(this.points[index][dataIndex].data, function(data, animationIndex){
			var id = 'dataPoint-' + index + '-' + dataIndex + '-' + animationIndex;
		
			var point = new SVG.Circle({
				id: id,
				"class":"dataPoint dataset"+dataIndex,
				stroke: "#FFF",
				"stroke-width": 0.25,
				cx: data.xPoint,
				cy: data.yPoint,
				r: 1.5,
				fill: options.colors[dataIndex],
				"shape-rendering": "geometric-precision"
			});
			
			if (options.showTips){
				var mouseoverEffect = new SVG.Animate({
					attributeName: "r",
					from: 1.5,
					to: 1.85,
					begin: 'mouseover',
					dur: '0.1s',
					fill: 'freeze'
				});

				var mouseoutEffect = new SVG.Animate({
					attributeName: "r",
					from: 1.85,
					to: 1.5,
					begin: 'mouseout',
					dur: '0.3s',
					fill: 'freeze'
				});
				
				point.addEvents({
					mouseover: function(){
						self.renderTip(id, data.xVal, data.yVal, index, dataIndex);
					},
					mouseout: function(){
						self.removeTip(id);
					}
				}, this).adopt(mouseoverEffect.render()).adopt(mouseoutEffect.render());
			}
					
			if (options.animate){
				var startTime = animationIndex * animationLength
				var animation = new SVG.Animate({
					attributeName: "r",
					from: 0,
					to: 1.5,
					begin: startTime + 's',
					dur: (options.animationDuration - startTime) + (dataIndex/4) + 's',
					fill: 'freeze'
				});
				point.set('r', 0).adopt(animation);
			}
			
			self.svg[index].adopt(point.render());
		});
	},

	/**
	 * @description Gets the location of a point relative to the chart, making sure that tips along the edges of a chart 
	 * 		will be properlly diplayed.
	 * @param int id - The id of the tip for which a location should be retrieved
	 * @param object chart - The chart where the tip is located
	 * @return object - An object with the x,y coordinates where the tip should be placed
	 */			
	getTipLocation: function(id, chart){
		var pos = $(id).getPosition(chart);
		var location = $(id).getCoordinates(chart);
		var dimensions = chart.getParent().getCoordinates();
		var left = ((dimensions.width/2) < pos.x) ? (location.left - 200) : (location.left + 20);
		var top = ((dimensions.height/2) < pos.y) ? (location.top - 100) : (location.top);
		return {y: top, x: left};
	},

	/**
	 * @description Renders a tip when a chart element is interacted with by the user
	 * @param string id - The id of the tip to be rendered
	 * @param mixed x - The x value for the chart element in relation to the chart's data (not to be confused with its 
	 * 		CSS x coordinate location)
	 * @param mixed y - The y value for the chart element in relation to the chart's data (not to be confused with its 
	 * 		CSS y coordinate location)
	 * @param int index - The index of the chart
	 * @param int dataIndex - The index of the dataset 
	 */
	renderTip: function(id, x, y, index, dataIndex){
		if ($$('.chartTip').length > 0){ $$('.chartTip').dispose(); }
		
		var self = this;
		var options = this.options[index];
		var dim = this.dim[index];
		
		//This is to make negative pyramid numbers appear positive
		x = ((options.pyramid)&&(x < 0)) ? -x : x;
		
		var chart = $('chart-' + index);
		var pos = $(id).getCoordinates(chart);
		var title = options.dataLabels[dataIndex];
		var content = options.tipText[dataIndex].substitute({
			x: x, 
			y: y, 
			xAxis: options.xAxisLabel,
			yAxis: options.yAxisLabel,
			label: title
		});
		
		var titleEl = new Element('span', {
			'class': 'chartTipTitle',
			html: title,
			styles: {color: options.colors[dataIndex]}
		});
		var contentEl = new Element('span', {'class': 'chartTipContent', html: content});
		var location = this.getTipLocation(id, chart);

		var tip = new Element('div', {
			id: id + 'ChartTip',
			'class': 'chartTip',
			styles: {
				top: location.y + 'px',
				left: location.x + 'px'
			}
		}).adopt(titleEl, contentEl).inject(chart, 'after');
	},
	
	/**
	 * @description Removes a tip from the DOM
	 * @param string id - The id of the tip to be removed
	 */
	removeTip: function(id){
		(function(){if ($(id + 'ChartTip')){ $(id + 'ChartTip').dispose(); }}).delay(300);
	},
	
	/**
	 * Notes: 	No separation, 3d or donuts
	 * 			Largest slice to right of noon, 2nd largest to left of noon
	 * 			No more than 5 slices
	 * Use: Single variable comparison for 5 or fewer items
	 */
	renderPie: function(data){}	
});
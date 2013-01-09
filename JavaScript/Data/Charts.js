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
		dateEnd: 'now',										//now, or specific date
		dateFormat: '%b %d',								//Y:M:W H:M:S
		dateIntervalUnit: 'day',							//year, month, week, day, hour, minute, second, ms
		dateIntervalValue: 6,								//3
		dateStart: '8/18/2012',								//now, or a specific date
		gridColor: '#DDD',									//The hex color of the grid lines
		keyPosition: 'bottom',									//Where to show the key: left, right, top, bottom
		showAreaLines: false,								//Whether or not to show lines on an area chart
		showAxisLabels: false,								//Whether or not to show the axis labels
		showAxisLines: false,								//Whether or not to show the axis lines		
		showGridX: false,									//Whether or not to show the x-axis grid lines
		showGridY: false,									//Whether or not to show the y-axis grid lines
		showIntervalLabels: false,							//Whether or not to show interval labels
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
		yLabels: []											//Labels for the x-axis, defaults to numbers. Should match tick count
	},
	
	/**
	 * @param string - selectors - The selectors for chart containers
	 */
	initialize: function(selectors){
		var self = this;
		this.namespace = "http://www.w3.org/2000/svg";
		this.selectors = selectors;
		this.charts = [], this.options = [], this.data = [], this.points = [], this.svg = [], this.dim = [];
		
		Array.each($$(selectors), function(chart, index){	
			self.charts[index] = chart;
			self.chartIndex = index;			
			self.createChart(chart, index, selectors);
		});
	},
	
	createChart: function(chart, index, selectors){
		var self = this;
		var chartType = 'create'+chart.get('class').capitalize();
		this.data[index] = JSON.decode(chart.getData('chartData'));
		this.options[index] = options = Object.merge(this.defaultOptions, JSON.decode(chart.getData('chartOptions')));
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
		
		//If not pie chart
		if (options.xAxisIsDate){
			options.xInterval = this.options.dateIntervalValue;
			this.parseDateData(index);
		} else {		
			this.parseData(index);
		}
		
		//This fixes a bug that renders the chart in full and then animates it.
		if ((options.animate) && (!Browser.ie)){
			this.svg.set('opacity', 0).addEvent('load', function(){
				this.set('opacity', 1);
			});
		} else {
			this.options.animate = false; //IE can't do declarative animations, but future versions may rework the animation type 
		}		
		
		this[chartType](index);		
		
		chart.adopt(this.svg[index].render());
	},

	setCanvasHeight: function(chart, index){
		var options = this.options[index];
		var height = (chart.getSize()['x']/options.aspectRatio[0]) * options.aspectRatio[1];
		chart.setStyle('height', height);		
	},
	
	createLineChart: function(index){
		var options = this.options[index];
		
		if (options.showTitle){this.setTitle(index);}
		if (options.showTicksX||options.showTicksY){this.renderTicks(index);}
		if (options.showGridX||options.showGridY){this.renderGrids(index);}
		if (options.showIntervalLabels){this.renderIntervalLabels(index);}
		if (options.showAxisLabels){this.renderAxisLabels(index);}
		
		Array.each(this.data[index], function(data, dataIndex){
			this.renderLine(index, dataIndex);
			if (options.showLineFill){this.renderLineFill(index, dataIndex);}			
		}, this);
		
		if (this.options.showAxisLines){this.renderAxisLines(index);}
		
		if (options.showPoints){
			Array.each(this.data[index], function(data, dataIndex){
				this.renderPoints(index, dataIndex);
			}, this);
		}		
	},
	
	createAreaChart: function(index){
		var options = this.options[index];
		this.renderMask(index);
		
		if (options.showTitle){this.setTitle(index);}
		if (options.showTicksX||this.options.showTicksY){this.renderTicks(index);}
		if (options.showGridX||this.options.showGridY){this.renderGrids(index);}
		if (options.showIntervalLabels){this.renderIntervalLabels(index);}
		if (options.showAxisLabels){this.renderAxisLabels(index);}
		if (options.showKey){this.renderKey(index);}
		
		var group = new SVG('g', {'clip-path': 'url(#chartCanvas)'});
		
		Array.each(this.data[index], function(data, dataIndex){
			if (options.showAreaLines){this.renderLine(index, dataIndex)};
			group.adopt(this.renderLineFill(index, dataIndex));			
		}, this);
		
		this.svg[index].adopt(group.render());
		
		if (options.showAxisLines){this.renderAxisLines(index);}
		
		if (options.showPoints){
			Array.each(this.data[index], function(data, dataIndex){
				this.renderPoints(index, dataIndex);
			}, this);
		}		
	},
	
	createScatterChart: function(index){
		var options = this.options[index];
		
		if (options.showTitle){this.setTitle(index);}
		if (options.showTicksX||options.showTicksY){this.renderTicks(index);}
		if (options.showGridX||options.showGridY){this.renderGrids(index);}
		if (options.showIntervalLabels){this.renderIntervalLabels(index);}
		if (options.showAxisLabels){this.renderAxisLabels(index);}
		if (options.showAxisLines){this.renderAxisLines(index);}
				
		Array.each(this.data[index], function(data, dataIndex){
			this.renderPoints(index, dataIndex);
		}, this);
	},	
	
	/**
	 * @description Parses data for line, scatter, and bar charts
	 */
	parseData: function(index){
		var options = this.options[index];	
		this.setMaxes(index);

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
				var xValue = (options.xAxisIsDate) ? this.xTipValues[i] : dataObject.x[i];
				
				points.data.push({
					xVal: xValue,
					yVal: dataObject.y[i],
					xPoint: normalizedX,
					yPoint: normalizedY,
				});
				
				linePoints.push(normalizedX + ' ' + normalizedY);
			}
			
			this.points[index][dataIndex].line = 'M ' + linePoints.join(', ');
			this.setDataLabels(index, dataIndex);
		}, this);
	},

	parseDateData: function(index){
		var options = this.options[index];
		var startDate = (options.dateStart.toLowerCase() == 'now') ? new Date() : new Date(options.dateStart);
		var endDate = (options.dateEnd.toLowerCase() == 'now') ? new Date() : new Date(options.dateEnd);
		var numDataPoints = (this.data[index][0].y.length - 1);
		var diff = startDate.diff(endDate);
		var dateDiff = (diff < numDataPoints) ? diff : numDataPoints + 1 + options.dateIntervalValue;
		var xValues = [];
		this.xTipValues = [];
		
		if (options.xLabels.length === 0){
			for (i=0; i <= dateDiff; i+=options.dateIntervalValue){
				var labelDate = startDate.clone().increment(options.dateIntervalUnit, i).format(options.dateFormat);
				options.xLabels.push(labelDate);
			}
		}
				
		for (i=0; i<= numDataPoints; i++){
			xValues.push(i);
			this.xTipValues.push(endDate.clone().decrement(options.dateIntervalUnit, i).format(options.dateFormat));
		}

		this.xTipValues.reverse();
		
		Array.each(this.data[index], function(dataObject, dataIndex){
			this.data[index][dataIndex].x = xValues;
		}, this);		
		
		this.parseData(index);
	},

	setChartSize: function(index){
		var options = this.options[index];
		var dim = this.dim[index];
		
		dim.width = 300;
		dim.width = (options.showTicksX) ? dim.width - 5 : dim.width;
		dim.width = (options.showTicksY) ? dim.width - 15 : dim.width;
		dim.width = (options.showIntervalLabels) ? dim.width - 25 : dim.width;
		dim.width = (['right', 'left'].contains(options.keyPosition)) ? dim.width - 50 : dim.width;
		
		dim.height = dim.aspectRatioHeight - dim.yOffset;
		dim.height = (options.showTicksY) ? dim.height - 5 : dim.height;
		dim.height = (options.showAxisLabels) ? dim.height - 10 : dim.height;
		dim.height = (options.showIntervalLabels) ? dim.height - 10 : dim.height;
		dim.height = (options.keyPosition == 'bottom') ? dim.height - 20 : dim.height;

	},

	setOffsets: function(index){
		var options = this.options[index];
		var dim = this.dim[index];		
		
		dim.xOffset = (options.showTicksY) ? 5 : 0;
		dim.xOffset = (options.showAxisLabels) ? dim.xOffset + 15 : dim.xOffset;
		dim.xOffset = (options.showIntervalLabels) ? dim.xOffset + 20 : dim.xOffset;
		dim.xOffset = (options.keyPosition == 'left') ? dim.xOffset + 50 : dim.xOffset;
		
		dim.yOffset = (options.showTitle) ? 25 : 0;
		dim.yOffset = (options.keyPosition == 'top') ? dim.yOffset + 10 : dim.yOffset;
	},
	
	setMaxes: function(index){
		var options = this.options[index];
		var dim = this.dim[index];
		var xValues = [], yValues = [];
		
		Array.each(this.data[index], function(dataObject){
			xValues.combine(dataObject.x);
			yValues.combine(dataObject.y);
		});
		
		dim.maxX = Math.max.apply(Math, xValues);
		maxY = Math.max.apply(Math, yValues);
		yInterval = options.yInterval;
		
		if (maxY % yInterval){
			dim.maxY = ((Math.round(maxY/yInterval) + 1) * yInterval);
		} else {
			dim.maxY = maxY + yInterval;		
		}		
	},

	setTitle: function(index){
		var title = new SVG.Text({'class': 'chartTitle', x: 0, y: 15,});
		this.svg[index].adopt(title.setText(this.options[index].title).render());
	},

	setDataLabels: function(index, dataIndex){
		var options = this.options[index];
		options.dataLabels[dataIndex] = (options.dataLabels[dataIndex])	? options.dataLabels[dataIndex] : 'Data Set ' + (dataIndex + 1);
		options.tipText[dataIndex] = (options.tipText[dataIndex]) ? options.tipText[dataIndex] : '{xAxis}: {x}, {yAxis}: {y}';
	},
	
	renderMask: function(index){
		var dim = this.dim[index];

		var mask = new SVG.Rect({
			x: this.normalize(index, 0, 'x'),
			y: this.normalize(index, dim.maxY, 'y'),
			height: (this.normalize(index, 0, 'y') - this.normalize(index, dim.maxY, 'y')),
			width: this.normalize(index, dim.maxX, 'x') - this.normalize(index, 0, 'x')
		});
		var chartCanvas = new SVG.ClipPath({id: 'chartCanvas'}).adopt(mask.render());
		var defs = new SVG('defs').adopt(chartCanvas.render());
		this.svg[index].adopt(defs.render());
	},
	
	renderAxisLines: function(index){
		var options = this.options[index];
		var dim = this.dim[index];
		var xOffset = dim.xOffset, yOffset = dim.yOffset;
		
		var line = new SVG.Path({
			d: 'M '+xOffset+' '+(yOffset + 0.5) +', '+xOffset+' '+(dim.height+yOffset)+', '+(dim.width+xOffset)+' '+(dim.height+yOffset),
			stroke: options.axisColor,
			fill: "transparent",
			"stroke-width": 1
		});
		
		this.svg[index].adopt(line.render());		
	},

	renderTicks: function(index){
		var options = this.options[index];
		var dim = this.dim[index];		
		
		var ticks = [],
			xOffset = dim.xOffset, 
			yOffset = dim.yOffset,
			xInterval = (options.xInterval/dim.maxX) * dim.width,
			yInterval = (options.yInterval/dim.maxY) * dim.height,
			xStart = xOffset + xInterval;
			yStart = yOffset + dim.height + .5 - yInterval;

		if (options.showTicksX){
			for (var x = xStart; x < (xOffset + dim.width + 1); x+=xInterval){
				ticks.push('M ' + x + ' ' + (yStart + 3 + yInterval) + ', ' + x + ' ' + (yStart + yInterval - 0.5));
			}		
		}
			
		if (options.showTicksY){
			for (var y = yStart; y >= (yOffset); y-=yInterval){
				ticks.push('M ' + xOffset + ' ' + y + ', ' + (xOffset -3) + ' ' + y);
			}
		}
			
		Array.each(ticks, function(tickPath){
			var tick = new SVG.Path({
				d: tickPath,
				stroke: options.tickColor,
				fill: "transparent",
				"stroke-width": 0.5
			});
			this.svg[index].adopt(tick.render());
		}, this);
	},

	renderGrids: function(index){
		var options = this.options[index];
		var dim = this.dim[index];
		
		var grids = [],
			xOffset = dim.xOffset, 
			yOffset = dim.yOffset,
			xInterval = (options.xInterval/dim.maxX) * dim.width,
			yInterval = (options.yInterval/dim.maxY) * dim.height,
			yStart = yOffset + dim.height + .5,
			normalMaxX = this.normalize(index, dim.maxX, 'x');

		if (options.showGridX){
			for (var x = xOffset; x < (xOffset + dim.width + 1); x+=xInterval){
				grids.push('M ' + x + ' ' + (yStart) + ', ' + x + ' ' + (yOffset + 0.5));
			}

			if (x > normalMaxX){
				grids.push('M ' + normalMaxX + ' ' + (yStart) + ', ' + normalMaxX + ' ' + (yOffset + 0.5));
			}
		}

		if (options.showGridY){
			for (var y = yStart; y >= (yOffset); y-=yInterval){
				grids.push('M ' + xOffset + ' ' + y + ', ' + (xOffset + dim.width) + ' ' + y);
			}
		}
			
		Array.each(grids, function(gridPath){
			var grid = new SVG.Path({
				d: gridPath,
				stroke: options.gridColor,
				fill: "transparent",
				"stroke-width": 0.5
			});
			this.svg[index].adopt(grid.render());
		}, this);
	},	

	renderIntervalLabels: function(index){
		var options = this.options[index];
		var dim = this.dim[index];
		
		var xLabels = [], 
			yLabels = [], 
			self = this,
			xInterval = (options.xInterval/dim.maxX) * dim.width,
			yInterval = (options.yInterval/dim.maxY) * dim.height;

		if (options.xLabels.length > 0){
			xLabels = options.xLabels;
		} else {
			for (var i = 0; i <= dim.maxX; i+= options.xInterval){
				xLabels.push(i);
			}
		}
		
		var xCounter = dim.xOffset;
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
		
		if (options.yLabels.length > 0){
			yLabels = options.yLabels;
		} else {
			for (var i = 0; i <= dim.maxY; i+= options.yInterval){
				yLabels.push(i);
			}
		}
		
		yLabels.reverse();
		
		var yCounter = dim.yOffset + 2;
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
	},

	renderAxisLabels: function(index){
		var options = this.options[index];
		var dim = this.dim[index];
		
		var intervalLabelHeight = (options.showIntervalLabels) ? 10 : 0;
		var xLabel = new SVG.Text({
			'class': 'chartAxisLabel',
			x: this.normalize(index, (dim.maxX/2), 'x'),
			y: (dim.yOffset + dim.height + intervalLabelHeight + 10), 
			'text-anchor': 'middle'
		});
		this.svg[index].adopt(xLabel.setText(options.xAxisLabel).render());
		
		var yMiddle = this.normalize(index, (dim.maxY/2), 'y');
		var xOffset = (options.keyPosition == 'left') ? 60 : 10;
		var yLabel = new SVG.Text({
			'class': 'chartAxisLabel',
			x: xOffset,
			y: yMiddle, 
			'text-anchor': 'middle',
			transform: "rotate(270 " + xOffset + " " + yMiddle + ")" 
		});
		this.svg[index].adopt(yLabel.setText(options.yAxisLabel).render());		
	},

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
				id: 'chartKey-' + dataIndex, 
				'class': 'chartKey'
			}).addEvents({
				click: function(e){
					e.stop();
					var dataIndex = this.getAttributeNS(null, 'id').split('-')[1];

					if (this.getAttributeNS(null, 'class') == 'chartKey'){
						this.setAttributeNS(null, 'class', 'chartKey disabled');
						$$('.dataset'+dataIndex).setStyle('display', 'none');
					} else {
						this.setAttributeNS(null, 'class', 'chartKey');
						$$('.dataset'+dataIndex).setStyle('display', 'block');
					}
				}
			}).adopt(keyColor.render()).adopt(keyLabel.render());
			self.svg[index].adopt(group.render());
		});
			
		this.svg[index].addEvent('DOMNodeInserted', function(){self.positionKeys(index);});
		window.addEvent('resize', function(){self.positionKeys(index);});
	},

	//This is because it's almost impossible to pre-calculate the key width before inserting it into the DOM	
	positionKeys: function(index){
		var options = this.options[index];
		var dim = this.dim[index];
		
		if (['top', 'bottom'].contains(options.keyPosition)){
			var currentX = 313;
			var	currentY = (options.keyPosition == 'top') ? dim.yOffset - 30 : dim.yOffset + dim.height + 10;
			currentY = (options.showTicksY) ? currentY + 5 : currentY;
			currentY = (options.showAxisLabels) ? currentY + 10 : currentY;
			currentY = (options.showIntervalLabels) ? currentY + 10 : currentY;			
		} else {
			
		}

		Array.each(this.charts[index].getElements('.chartKey'), function(key){
			currentX = currentX - key.getBBox().width - 5;
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
		var max = dim['max'+axis.capitalize()];
		var offset = dim[axis+'Offset'];
		
		if (axis == 'y'){
			return (dim.height + offset) - Math.round(((value/max) * dim.height));
		} else {
			return Math.round(((value/max) * dim.width)) + offset;	
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
		this.svg.adopt(line.render());	
	},

	renderLineFill: function(index, dataIndex){
		var options = this.options[index];
		var dim = this.dim[index];
		
		var yVal = dim.yOffset + dim.height;
		var linePath = this.points[index][dataIndex].line + ', ' 
			+ this.normalize(index, dim.maxX, 'x') + ' ' 
			+ yVal + ', ' + dim.xOffset + ' ' + yVal;
		
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
	
	renderPoints: function(index, dataIndex){
		var options = this.options[index];
		var dim = this.dim[index];
		
		var self = this;
		var numPoints = this.points[index][dataIndex].data.length;
		var animationLength = options.animationDuration / numPoints;
		
		Array.each(this.points[index][dataIndex].data, function(data, animationIndex){
			var id = 'dataPoint-' + dataIndex + '-' + animationIndex;
			
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
			}).addEvents({
				mouseover: function(){
					self.renderTip(id, data.xVal, data.yVal, index, dataIndex);
				},
				mouseout: function(){
					self.removeTip(id);
				}
			}, this).adopt(mouseoverEffect.render()).adopt(mouseoutEffect.render());
			
			
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

	getTipLocation: function(id, chart){
		var pos = $(id).getPosition(chart);
		var location = $(id).getCoordinates(chart);
		var dimensions = chart.getParent().getCoordinates();
		var left = ((dimensions.width/2) < pos.x) ? (location.left - 200) : (location.left + 20);
		var top = ((dimensions.height/2) < pos.y) ? (location.top - 100) : (location.top);
		return {y: top, x: left};
	},
	
	renderTip: function(id, x, y, index, dataIndex){
		if ($$('.chartTip').length > 0){ $$('.chartTip').dispose(); }
		var self = this;
		var chart = $('chart-' + this.chartIndex);
		var pos = $(id).getCoordinates(chart);
		var title = this.options.dataLabels[dataIndex];
		var content = this.options.tipText[dataIndex].substitute({
			x: x, 
			y: y, 
			xAxis: this.options.xAxisLabel,
			yAxis: this.options.yAxisLabel,
			label: title
		});
		
		var titleEl = new Element('span', {
			'class': 'chartTipTitle',
			html: title,
			styles: {color: self.options.colors[dataIndex]}
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
	
	removeTip: function(id){
			var removeTip = function() {
				if ($(id + 'ChartTip')){ $(id + 'ChartTip').dispose(); }
			};
			removeTip.delay(300);
	},
	
	/**
	 * Notes: 	No separation, 3d or donuts
	 * 			Largest slice to right of noon, 2nd largest to left of noon
	 * 			No more than 5 slices
	 * Use: Single variable comparison for 5 or fewer items
	 */
	renderPie: function(data){}	
});
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
		animate: true,										//Whether or not to animate the graph, defaults true
		animationDuration: 1,								//The total animation duration in seconds
		axisColor: '#333',									//The hex color of the axis lines
		colors: ['#058DC7', "#A006C7", "#C7062D", "#06C740", "#C7A006"],			//The chart hex colors for lines, bars, and pie segments
		dataLabels: [],										//Labels for each of the data sets, will also show in the key
		dateEnd: 'now',										//now, or specific date
		dateFormat: '%b %d',								//Y:M:W H:M:S
		dateIntervalUnit: 'day',							//year, month, week, day, hour, minute, second, ms
		dateIntervalValue: 6,								//3
		dateStart: '8/18/2012',								//now, or a specific date
		gridColor: '#DDD',									//The hex color of the grid lines
		keyPosition: 'right',								//Where to show the key: left, right, top, bottom
		showAreaLines: true,								//Whether or not to show lines on an area chart
		showAxisLabels: true,								//Whether or not to show the axis labels
		showAxisLines: true,								//Whether or not to show the axis lines		
		showGridX: true,									//Whether or not to show the x-axis grid lines
		showGridY: true,									//Whether or not to show the y-axis grid lines
		showIntervalLabels: true,							//Whether or not to show interval labels
		showKey: true,										//Whether or not to show the key
		showLineFill: false,								//Whether or not to create a fill between the x-axis and line
		showPoints: true,									//Whether or not to show line points
		showTicksX: true,									//Whether or not to show tick marks along the x-axis
		showTicksY: true,									//Whether or not to show tick marks along the y-axis		
		showTips: true,										//Whether or not to show tips on hover
		showTitle: true,									//Whether or not to show the chart title
		textColor: "#000",									//The hex code for the text color
		title: 'Untitled Chart',							//The title of the chart
		tickColor: '#333',									//The hex color of the tick marks
		tipText: [],										//The HTML text for the tip, where values inside of {} are replaced by coordinates
															//Options include {x}, {y}, {xAxis}, {yAxis}, and {label}
		xAxisLabel: 'x-axis',								//The x-axis label
		xInterval: 25,										//The interval between ticks on the x-axis
		xAxisIsDate: true,									//Whether or not the x-axis is a date, to be used with other date options
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
		Array.each($$(selectors), function(chart, index){	
			self.chartIndex = index;			
			self.createChart(chart, selectors);
		});
	},
	
	createChart: function(chart, selectors){
		var self = this;
		var chartType = 'create'+chart.get('class').capitalize();
		this.data = JSON.decode(chart.getData('chartData'));
		this.options = Object.merge(this.defaultOptions, JSON.decode(chart.getData('chartOptions')));
		this.points = [];
		this.svg = new SVG('svg', {viewBox:"0 0 300 195", id: 'chart-' + self.chartIndex});
		
		//Internet explorer didn't play well with resizing
		this.setChartHeight(chart);
		window.addEvent('resize', function(){
			self.setChartHeight(chart);
		});

		this.xOffset = 30;
		this.yOffset = 30;
		
		//If not pie chart
		if (this.options.xAxisIsDate){
			this.options.xInterval = this.options.dateIntervalValue;
			this.parseDateData();
		} else {		
			this.parseData();
		}
		
		//This fixes a bug that renders the chart in full and then animates it.
		if ((this.options.animate) && (!Browser.ie)){
			this.svg.set('opacity', 0).addEvent('load', function(){
				this.set('opacity', 1);
			});
		} else {
			this.options.animate = false; //IE can't do declarative animations, but future versions may rework the animation type 
		}		
		
		this[chartType]();		
				
		chart.adopt(this.svg.render());
	},

	setChartHeight: function(chart){
		var height = (chart.getSize()['x']/4) * 3;
		chart.setStyle('height', height);		
	},
	
	createChartLine: function(){
		if (this.options.showTitle){this.setTitle();}
		if (this.options.showTicksX||this.options.showTicksY){this.renderTicks();}
		if (this.options.showGridX||this.options.showGridY){this.renderGrids();}
		if (this.options.showIntervalLabels){this.renderIntervalLabels();}
		if (this.options.showAxisLabels){this.renderAxisLabels();}
		
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
		this.renderMask();
		
		if (this.options.showTitle){this.setTitle();}
		if (this.options.showTicksX||this.options.showTicksY){this.renderTicks();}
		if (this.options.showGridX||this.options.showGridY){this.renderGrids();}
		if (this.options.showIntervalLabels){this.renderIntervalLabels();}
		if (this.options.showAxisLabels){this.renderAxisLabels();}
		if (this.options.showKey){this.renderKey();}
		
		var group = new SVG('g', {'clip-path': 'url(#chartCanvas)'});
		
		Array.each(this.data, function(data, index){
			if (this.options.showAreaLines){this.renderLine(index)};
			group.adopt(this.renderLineFill(index));			
		}, this);
		
		this.svg.adopt(group.render());
		
		if (this.options.showAxisLines){this.renderAxisLines();}
		
		if (this.options.showPoints){
			Array.each(this.data, function(data, index){
				this.renderPoints(index);
			}, this);
		}		
	},
	
	createChartScatter: function(){
		if (this.options.showTitle){this.setTitle();}
		if (this.options.showTicksX||this.options.showTicksY){this.renderTicks();}
		if (this.options.showGridX||this.options.showGridY){this.renderGrids();}
		if (this.options.showIntervalLabels){this.renderIntervalLabels();}
		if (this.options.showAxisLabels){this.renderAxisLabels();}
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
				var xValue = (this.options.xAxisIsDate) ? this.xTipValues[i] : dataObject.x[i];
				
				points.data.push({
					xVal: xValue,
					yVal: dataObject.y[i],
					xPoint: normalizedX,
					yPoint: normalizedY,
				});
				
				linePoints.push(normalizedX + ' ' + normalizedY);
			}
			
			this.points[index].line = 'M ' + linePoints.join(', ');
			this.setDataLabels(index);
		}, this);
	},

	parseDateData: function(){
		var startDate = (this.options.dateStart.toLowerCase() == 'now') ? new Date() : new Date(this.options.dateStart);
		var endDate = (this.options.dateEnd.toLowerCase() == 'now') ? new Date() : new Date(this.options.dateEnd);
		var numDataPoints = (this.data[0].y.length - 1);
		var diff = startDate.diff(endDate);
		var dateDiff = (diff < numDataPoints) ? diff : numDataPoints + 1 + this.options.dateIntervalValue;
		var xValues = [];
		this.xTipValues = [];
		
		if (this.options.xLabels.length === 0){
			for (i=0; i <= dateDiff; i+=this.options.dateIntervalValue){
				var labelDate = startDate.clone().increment(this.options.dateIntervalUnit, i).format(this.options.dateFormat);
				this.options.xLabels.push(labelDate);
			}
		}
				
		for (i=0; i<= numDataPoints; i++){
			xValues.push(i);
			this.xTipValues.push(endDate.clone().decrement(this.options.dateIntervalUnit, i).format(this.options.dateFormat));
		}

		this.xTipValues.reverse();
		
		Array.each(this.data, function(dataObject, index){
			this.data[index].x = xValues;
		}, this);		
		
		this.parseData();
	},

	setCanvasSize: function(){
		
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

	setDataLabels: function(index){
		this.options.dataLabels[index] = (this.options.dataLabels[index]) 
			? this.options.dataLabels[index] 
			: 'Data Set ' + (index + 1);
		this.options.tipText[index] = (this.options.tipText[index]) 
			? this.options.tipText[index] 
			: '{xAxis}: {x}, {yAxis}: {y}';
	},
	
	renderMask: function(){
		var mask = new SVG.Rect({
			x: this.normalize(0, 'x'),
			y: this.normalize(this.maxY, 'y'),
			height: (this.normalize(0, 'y') - this.normalize(this.maxY, 'y')),
			width: this.normalize(this.maxX, 'x') - this.normalize(0, 'x')
		});
		var chartCanvas = new SVG.ClipPath({id: 'chartCanvas'}).adopt(mask.render());
		var defs = new SVG('defs').adopt(chartCanvas.render());
		this.svg.adopt(defs.render());
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
			yStart = yOffset + 130 + .5,
			normalMaxX = this.normalize(this.maxX, 'x');

		if (this.options.showGridX){
			for (var x = xOffset; x < (xOffset + 280); x+=xInterval){
				grids.push('M ' + x + ' ' + (yStart) + ', ' + x + ' ' + (yOffset + 0.5));
			}

			if (x > normalMaxX){
				grids.push('M ' + normalMaxX + ' ' + (yStart) + ', ' + normalMaxX + ' ' + (yOffset + 0.5));
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
				'class': 'chartIntervalLabel',
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
				'class': 'chartIntervalLabel',
				x: (self.xOffset - 5),
				y: yCounter, 
				'text-anchor': 'end'
			});
			self.svg.adopt(label.setText(value).render());
			yCounter += yInterval;
		});		
	},

	renderAxisLabels: function(){
		var xLabel = new SVG.Text({
			'class': 'chartAxisLabel',
			x: this.normalize((this.maxX/2), 'x'),
			y: (this.yOffset + 150), 
			'text-anchor': 'middle'
		});
		this.svg.adopt(xLabel.setText(this.options.xAxisLabel).render());
		
		var yLabel = new SVG.Text({
			'class': 'chartAxisLabel',
			x: 5,
			y: 97.5, 
			'text-anchor': 'middle',
			transform: "rotate(270 5 97.5)" 
		});
		this.svg.adopt(yLabel.setText(this.options.yAxisLabel).render());		
	},

	renderKey: function(){
		var currentX = 304,
			currentY = this.yOffset + 160,
			self = this;

		Array.each(this.data, function(data, index){
			var keyLabel = new SVG.Text();
			keyLabel.setText(self.options.dataLabels[index]);
			
			var keyColor = new SVG.Rect({
				height: 5,
				width: 5,
				x: -8,
				y: -4.5,
				fill: self.options.colors[index],
				opacity: 0.7
			});

			var group = new SVG.G({
				id: 'chartKey-' + index, 
				'class': 'chartKey',
				
			}).addEvents({
				click: function(e){
					e.stop();
					var index = this.getAttributeNS(null, 'id').split('-')[1];

					if (this.getAttributeNS(null, 'class') == 'chartKey'){
						this.setAttributeNS(null, 'class', 'chartKey disabled');
						$$('.dataset'+index).setStyle('display', 'none');
					} else {
						this.setAttributeNS(null, 'class', 'chartKey');
						$$('.dataset'+index).setStyle('display', 'block');
					}
				}
			}).adopt(keyColor.render()).adopt(keyLabel.render());
			self.svg.adopt(group.render());
		});
			
		//This is because it's almost impossible to pre-calculate the key width before inserting it into the DOM
		this.svg.addEvent('DOMNodeInserted', function(){
			currentX = 305;
			Array.each($$('.chartKey'), function(key, index){
				currentX = currentX - key.getBBox().width - 5;
				key.set('transform', 'translate(' + currentX + ',' + currentY + ')');
			});			
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
			id: "dataLine"+index,
			"class":"dataLine dataset"+index,
			d: this.points[index].line,
			stroke: this.options.colors[index],
			fill: "transparent",
			"shape-rendering": "geometric-precision",
			"stroke-width": 1.25,
			"stroke-linecap": "round"
		}, this);
		
		if (this.options.animate){
			var lineLength = line.render().getTotalLength();
			var animation = new SVG.Animate({
				attributeName: "stroke-dashoffset",
				from: lineLength,
				to: 0,
				dur: this.options.animationDuration + (index/4) + 's',
				fill: 'freeze'
			});
			line.set('stroke-dasharray', lineLength + ' ' + lineLength).adopt(animation.render());
		}
		this.svg.adopt(line.render());	
	},

	renderLineFill: function(index){
		var yVal = this.yOffset + 130;
		var linePath = this.points[index].line + ', ' + this.normalize(this.maxX, 'x') + ' ' + yVal + ', ' + this.xOffset + ' ' + yVal;
		var lineFill = new SVG.Path({
			"class": "dataFill dataset"+index,
			stroke: "transparent",
			d: linePath,
			fill: this.options.colors[index],
			"shape-rendering": "geometric-precision"
		});

		if (this.options.animate){
			var animation = new SVG.AnimateTransform({
				attributeName: "transform",
				type: "skewY",
				from: 50,
				to: 0,
				dur: this.options.animationDuration + (index/4) + 's',
				fill: 'freeze'
			});
			lineFill.adopt(animation.render());
		}
		return lineFill.render();
	},
	
	renderPoints: function(index){
		var self = this;
		var numPoints = this.points[index].data.length;
		var animationLength = this.options.animationDuration / numPoints;
		
		Array.each(this.points[index].data, function(data, animationIndex){
			var id = 'dataPoint-' + index + '-' + animationIndex;
			
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
				"class":"dataPoint dataset"+index,
				stroke: "#FFF",
				"stroke-width": 0.25,
				cx: data.xPoint,
				cy: data.yPoint,
				r: 1.5,
				fill: self.options.colors[index],
				"shape-rendering": "geometric-precision"
			}).addEvents({
				mouseover: function(){
					self.renderTip(id, data.xVal, data.yVal, index);
				},
				mouseout: function(){
					self.removeTip(id);
				}
			}, this).adopt(mouseoverEffect.render()).adopt(mouseoutEffect.render());
			
			
			if (self.options.animate){
				var startTime = animationIndex * animationLength
				var animation = new SVG.Animate({
					attributeName: "r",
					from: 0,
					to: 1.5,
					begin: startTime + 's',
					dur: (self.options.animationDuration - startTime) + (index/4) + 's',
					fill: 'freeze'
				});
				point.set('r', 0).adopt(animation);
			}
			
			self.svg.adopt(point.render());
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
	
	renderTip: function(id, x, y, index){
		if ($$('.chartTip').length > 0){ $$('.chartTip').dispose(); }
		var self = this;
		var chart = $('chart-' + this.chartIndex);
		var pos = $(id).getCoordinates(chart);
		var title = this.options.dataLabels[index];
		var content = this.options.tipText[index].substitute({
			x: x, 
			y: y, 
			xAxis: this.options.xAxisLabel,
			yAxis: this.options.yAxisLabel,
			label: title
		});
		
		var titleEl = new Element('span', {
			'class': 'chartTipTitle',
			html: title,
			styles: {color: self.options.colors[index]}
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
/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Creates a slideshow carousel
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Carousel = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selectors - The selectors for the notifications
	 */
	initialize: function(selectors){
		this.carousels = $$(selectors);
		this.slides = [], this.options = [], this.previews = [], this.controls = [], this.active = [], 
		this.numSlides = [], this.autoplay = [], this.thumbs = [], this.autoScroll = [];
		
		this.carousels.each(function(carousel, index){
			this.currentIndex = index;
			this.options[index] = options = carousel.getDataAll();
			this.slides[index] = slides = $$(carousel.getElements('.slides li'));
			this.previews[index] = $$(carousel.getElements('.previews a'));
			this.numSlides[index] = slides.length;
						
			slides.each(function(slide, slideIndex){ 
				this.active[index] = (slide.hasClass('active')) ? slideIndex : this.active[index];
				this.loadAjaxSlide(slide);
			}, this);
			this.setCount(index, this.active[index]);
			this.controls[index] = {
					next: $$(carousel.getElements('.next')),
					previous: $$(carousel.getElements('.previous')),
					play: $$(carousel.getElements('.play, .pause')),
					first: $$(carousel.getElements('.first')),
					last: $$(carousel.getElements('.last'))					
			}
			this.addEvents(index);
			if (options.autoplay !== 'false'){
				this.play(index);
			}
			if (options.transition == 'zoomPan'){
				this.zoomPan.delay(100, this, [index, this.active[index], 'first']);
			}
		}, this);
	},

	loadAjaxSlide: function(slide){
		var targetUrl = (slide.hasData('targetUrl')) ? slide.getData('targetUrl') : null;
		if ((targetUrl)&&(targetUrl.test(/^[^http]/))){
			slide.set('load', {
				evalScripts: true,
				onRequest: function(){
					slide.set('html', '<p>Loading...</p>');
				},
				onSuccess: function(responseText, responseElements, responseHTML){
					slide.set('html', responseHTML);
				},
				onFailure: function(){
					slide.set('html', '<p>Content could not be loaded.</p>')
				}
			});
			slide.load(targetUrl);
		} else if ((targetUrl)&&(targetUrl.test(/^http/))){
			var content = new Element('iframe', {
				'src': targetUrl
			});
			slide.empty().adopt(content);;
		}
	},
	
	addEvents: function(index){
		var self = this;
		this.previews[index].each(function(preview, slideIndex){
			preview.addEvents({
				click: function(e){
					e.stop();
					self.activateSlide(index, slideIndex);
					self.updatePreview(index, slideIndex);
					self.pause(index);
				}
			});
		});
		this.controls[index]['next'].addEvent('click', function(e){
			e.stop();
			self.next(index);
		});
		this.controls[index]['previous'].addEvent('click', function(e){
			e.stop();
			self.previous(index);
		});
		this.controls[index]['first'].addEvent('click', function(e){
			e.stop();
			self.first(index);
		});
		this.controls[index]['last'].addEvent('click', function(e){
			e.stop();
			self.last(index);
		});		
		this.controls[index]['play'].addEvent('click', function(e){
			e.stop();
			if (this.hasClass('pause')){
				self.pause(index);
			} else {
				self.play(index);
			}
		});
		window.addEvents({
			resize: function(){
				self.setLayout(index);
				if (self.options[index]['transition'] == 'zoomPan'){
					$$(self.slides[index].getElements('img')).each(function(item){
						item.get('morph')[0].cancel().setStyles({width: '100%', height: 'auto'});
					})
					self.setCaptionPosition(index);
				}
			},
			domready: function(){self.setLayout(index);}
		});
	},

	setLayout: function(index){
		var maxHeight = $$(this.carousels[index].getElements('.slides .active'))[0].getCoordinates().height;
		if (maxHeight == 0){
			this.setLayout.delay(100, this, index);
		} else {
			$$(this.carousels[index].getElements('.slides')).setStyle('height', maxHeight);
			this.setThumbsContainerDimensions(index);
		}
	},

	setThumbsContainerDimensions: function(index){
		var thumbList = $$(this.carousels[index].getElements('.thumbs'));
		if (thumbList.length > 0){
			var container = new Element('div.thumbContainer').wraps(thumbList[0].setStyles({position:'absolute', left:0}));
			this.thumbs[index] = true;
			var thumbs = $$(thumbList[0].getElements('li'));
			var thumbDim = thumbs[0].getSize();
			if (thumbDim.y <= 30){
				this.setThumbsContainerDimensions.delay(100, this, index);				
			} else {
				var height = thumbDim.y + thumbs[0].getStyle('margin-top').toInt() + thumbs[0].getStyle('margin-bottom').toInt();
				var thumbWidth = thumbDim.x + thumbs[0].getStyle('margin-left').toInt() + thumbs[0].getStyle('margin-right').toInt();
				var totalWidth = thumbWidth * this.numSlides[index];
				if (totalWidth > container.getSize().x){
					this.addScrollers(index, container, thumbDim.y, thumbWidth, totalWidth)
				} else {
					$$(this.carousels[index].getElements('.scrollLeft, .scrollRight')).dispose();
				}
				container.setStyles({height: height, overflow: 'hidden', width: '100%'});
			}
		} else {
			this.thumbs[index] = false;
		}
	},

	addScrollers: function(index, container, height, thumbWidth, totalWidth){
		var self = this;
		var thumbs = $$(container.getChildren('.thumbs'))[0].set('morph', {duration: 'normal'});
		this.autoScroll[index] = true;
		thumbWidth = thumbWidth * 3;
		var scrollLeft = new Element('li', {
			'class': 'scrollLeft', 'html': '<i class="iconTriangleLeft"></i>', title: 'Scroll Left',
			styles:{'height': height, 'line-height': height},
			events:{click: function(){ self.scrollLeft(index, thumbs, thumbWidth);}}
		}).inject(container);
		var scrollRight = new Element('li', {
			'class': 'scrollRight', 'html': '<i class="iconTriangleRight"></i>',  title: 'Scroll Right', 
			styles:{'height': height, 'line-height': height},
			events:{click: function(){ self.scrollRight(index, thumbs, thumbWidth, totalWidth, container);}}
		}).inject(container);
	},

	scrollLeft: function(index, thumbs, thumbWidth){
		this.autoScroll[index] = false;
		var scrollPos = thumbs.getStyle('left').toInt();
		if ((scrollPos + thumbWidth) < 0){
			thumbs.morph({left: scrollPos + thumbWidth});
		} else {
			thumbs.morph({left: 0});
		}		
	},
	
	scrollRight: function(index, thumbs, thumbWidth, totalWidth, container){
		this.autoScroll[index] = false;
		var scrollPos = thumbs.getStyle('left').toInt();
		var scrollWidth = container.getSize().x - totalWidth - 28;
		if ((scrollPos - thumbWidth) > scrollWidth){
			thumbs.morph({left: scrollPos - thumbWidth});
		} else {
			thumbs.morph({left: scrollWidth});
		}		
	},

	scrollToPreview: function(index, slideIndex){
		if (($$(this.carousels[index].getElements('.scrollLeft, .scrollRight')).length > 0)&&(this.autoScroll[index])){
			var thumb = $$(this.previews[index][slideIndex].getParent('li'))[0];
			var thumbs = $$(this.carousels[index].getElements('.thumbs'))[0].set('morph', {duration: 'normal'});
			var thumbWidth = thumb.getSize().x + thumb.getStyle('margin-left').toInt() + thumb.getStyle('margin-right').toInt();
			var totalWidth = thumbWidth * this.numSlides[index];
			var scrollWidth = thumbs.getParent().getSize().x - totalWidth - 28;
			var scrollPos = thumbs.getStyle('left').toInt();
			if ((scrollPos + (thumbWidth*slideIndex)) > scrollWidth){
				thumbs.morph({left: -(thumbWidth*slideIndex)});
			} else {
				thumbs.morph({left: 0});
			}			
		}
	},
	
	activateSlide: function(index, slideIndex, direction){
		var transition = this.options[index]['transition'];
		if (transition){
			this[transition](index, slideIndex, direction);
		} else {
			this.standard(index, slideIndex);
		}
		this.setCount(index, slideIndex);
	},
	
	updatePreview: function(index, slideIndex){
		if (this.previews[index].length > 0){
			this.previews[index].removeClass('active');
			this.previews[index][slideIndex].addClass('active');
			this.scrollToPreview(index, slideIndex);
		}
	},

	setCount: function(index, count){
		var counter = $$(this.carousels[index].getElements('.counter'));
		if (counter.length > 0){
			counter.set('text', '(' + (count + 1) + '/' + this.numSlides[index] + ')');
		}
	},
	
	getNextIndex: function(index){
		return ((this.active[index] + 2) > this.numSlides[index]) ? 0 : this.active[index] + 1;
	},
	
	getPreviousIndex: function(index){
		return (this.active[index] == 0) ? this.numSlides[index] - 1 : this.active[index] - 1;
	},	
	
	next: function(index, autoplay){
		var slideIndex = this.getNextIndex(index);
		this.activateSlide(index, slideIndex, 'next');
		this.updatePreview(index, slideIndex);
		if (!autoplay){this.pause(index);}
	},
	
	previous: function(index, autoplay){
		var slideIndex = this.getPreviousIndex(index);
		this.activateSlide(index, slideIndex, 'prev');
		this.updatePreview(index, slideIndex);
		if (!autoplay){this.pause(index);}
	},
	
	first: function(index){
		this.activateSlide(index, 0, 'prev');
		this.updatePreview(index, 0);
		this.pause(index);
	},	

	last: function(index){
		this.activateSlide(index, (this.numSlides[index] - 1), 'next');
		this.updatePreview(index, (this.numSlides[index] - 1));
		this.pause(index);
	},	
	
	play: function(index){
		var duration = (this.options[index]['duration']) ? this.options[index]['duration'] : 4000;
		this.autoplay[index] = this.next.periodical(duration, this, [index, true]);
		this.controls[index]['play'].removeClass('play').addClass('pause');
		$$(this.controls[index]['play'].getElements('i')).set('class', 'iconPause');
	},
	
	pause: function(index){
		clearInterval(this.autoplay[index]);
		this.controls[index]['play'].removeClass('pause').addClass('play');
		$$(this.controls[index]['play'].getElements('i')).set('class', 'iconTriangleRight');
	},
	//Transitions
	standard: function(index, slideIndex){
		this.slides[index].removeClass('active').setStyle('display', 'none');
		this.slides[index][slideIndex].addClass('active').setStyle('display', 'block');
		this.active[index] = slideIndex;		
	},
	
	fade: function(index, nextIndex, direction){
		var currentIndex = this.active[index];
		var currentSlide = this.slides[index][currentIndex].setStyles({position: 'absolute', top: 0, left: 0});
		var nextSlide = this.slides[index][nextIndex].setStyles({position: 'absolute', top: 0, left: 0, display: 'block', opacity: 0});
		nextSlide.set({duration: 'long'}).fade('in').addClass('active');
		currentSlide.set({duration: 'long'}).fade('out').removeClass.delay(400, currentSlide, 'active');
		this.active[index] = nextIndex;
	},

	slide: function(index, nextIndex, direction, slideType){
		var currentIndex = this.active[index];
		if (nextIndex !== currentIndex){
			var currentSlide = this.slides[index][currentIndex].setStyles({position: 'absolute', top: 0, left: 0});
			var dim = currentSlide.getCoordinates();
			var width = dim.width;
			var height = dim.height;
			var topValue = 0, topTarget = 0, leftValue = 0, leftTarget = 0;
			
			if (['left', 'right'].contains(slideType)){
				if (direction == 'next'){
					leftValue = (slideType == 'left') ? width : -width;
				} else {
					leftValue = (slideType == 'left') ? -width : width;
				}
				leftTarget = -leftValue;
			} else {
				if (direction == 'next'){
					topValue = (slideType == 'top') ? -height : height;
				} else {
					topValue = (slideType == 'top') ? height : -height;
				}
				topTarget = -topValue;
			}
			var nextSlide = this.slides[index][nextIndex].setStyles({position: 'absolute', top: topValue, left: leftValue, display: 'block'});		
			currentSlide.morph({left: leftTarget, top: topTarget}).removeClass.delay(400, currentSlide, 'active');
			nextSlide.morph({left: 0, top: 0}).addClass('active');
			this.active[index] = nextIndex;
		}
	},

	getDirection: function(index, nextIndex, direction){
		if (!direction){
			var lastSlide = ((nextIndex == 0)&&(this.active[index] == (this.numSlides[index]-1)));
			direction = ((nextIndex > this.active[index])||(lastSlide)) ? 'next' : 'prev';
		}		
		return direction;
	},
	
	slideLeft: function(index, nextIndex, direction){
		this.slide(index, nextIndex, this.getDirection(index, nextIndex, direction), 'left');
	},
	
	slideRight: function(index, nextIndex, direction){
		this.slide(index, nextIndex, this.getDirection(index, nextIndex, direction), 'right');
	},
	
	slideTop: function(index, nextIndex, direction){
		this.slide(index, nextIndex, this.getDirection(index, nextIndex, direction), 'top');
	},
	
	slideBottom: function(index, nextIndex, direction){
		this.slide(index, nextIndex, this.getDirection(index, nextIndex, direction), 'bottom');
	},
	
	zoomPan: function(index, nextIndex, firstRun){
		this.setCaptionPosition(index);
		var currentIndex = this.active[index];
		var currentSlide = this.slides[index][currentIndex].setStyles({position: 'relative', top: 0, left: 0});
		var zoomStart = Number.random(110, 150);
		var zoomEnd = zoomStart + [-10, 10, -10].getRandom();
		var panStart = -((zoomStart - 100)/2);
		var panEnd = Number.random(-(zoomEnd - 100), 0);
		var duration = (this.options[index]['duration']) ? this.options[index]['duration'] : 4000;
		var fadeType = (firstRun == 'first') ? 'show' : 'in';
		
		var nextSlide = this.slides[index][nextIndex].setStyles({
			position: 'absolute', top: 0, left: 0,	opacity: 0
		});
		var slideImage = nextSlide.getChildren('img')[0].setStyles({
			position: 'relative', height: zoomStart+'%', width: zoomStart+'%', left: panStart+'%', top: panStart+'%'
		});
		nextSlide.addClass('active').fade(fadeType);
		slideImage.set('morph', {duration: duration, transition: Fx.Transitions.Sine.easeOut, unit: '%', fps: 100}).morph({
			height: zoomEnd, width: zoomEnd, left: panEnd, top: panEnd
		});
		if (firstRun !== 'first'){
			currentSlide.set({duration: 2000}).fade('out').removeClass.delay(2000, currentSlide, 'active')
		}
		this.active[index] = nextIndex;		
	},
	
	setCaptionPosition: function(index){
		var slideDim = this.slides[index][0].getParent().getCoordinates();		
		if (slideDim.height < 10){
			this.setCaptionPosition.delay(100, this, index);	
		} else {
			this.slides[index].setStyle('height', slideDim.height);
			var caption = $$(this.slides[index].getElements('.caption')).setStyles({position: 'absolute', bottom: 0});
		}
	}
});
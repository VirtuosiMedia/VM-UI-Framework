/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Creates a paginated content area
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Pager = new Class({

	Implements: [Events, Options],

	/**
	 * @param string - selectors - The selectors for the pager
	 */
	initialize: function(selectors){
		var pagers = $$(selectors);
		var self = this;
		Array.each(pagers, function(pager){
			self.createPagination(pager);
		});
	},

	createPagination: function(pager){
		var pages = pager.getElements('.page');
		this.setContainerHeight(pager, pages);
		pages.setStyle('display', 'none');
		pages[0].setStyle('display', 'block');
				
		var numPages = pages.length;
		var style = (pager.hasData('style')) ? pager.getData('style').toLowerCase() : 'numeric';
		var pagination = new Element('ul.pagination');
		
		if (['numeric', 'full', 'partial'].contains(style)){
			for (var i = 1; i <= numPages; i++){
				var link = this.createLink(pager, i, i);
				var item = (i > 1) ? new Element('li', {'class': 'number'}) : new Element('li', {'class': 'number active'});
				item.adopt(link).inject(pagination);
			}
		}
		
		if (['full', 'partial', 'directional'].contains(style)){
			var next = this.createLink(pager, 'Next', 2);
			var previous = this.createLink(pager, 'Previous', 1).addClass('disabled');
			var nextItem = new Element('li', {'class': 'next'}).adopt(next);
			if (style == 'directional'){nextItem.addClass('right');} 
			nextItem.inject(pagination);	
			var previousItem = new Element('li', {'class': 'previous'}).adopt(previous).inject(pagination, 'top');
		}
		
		if (style == 'full'){
			var last = this.createLink(pager, 'Last', numPages);
			var first = this.createLink(pager, 'First', 1).addClass('disabled');
			var lastItem = new Element('li', {'class': 'last'}).adopt(last).inject(pagination);
			var firstItem = new Element('li', {'class': 'first'}).adopt(first).inject(pagination, 'top');
		}
		
		pagination.inject(pager, 'after');
	},

	setContainerHeight: function(pager, pages){
		var maxHeight = 0;
		Array.each(pages, function(page){
			var height = page.getCoordinates().height;
			if (height > maxHeight){ maxHeight = height;}
		});
		pager.setStyle('height', maxHeight);
	},
	
	createLink: function(pager, text, index){
		var self = this;
		return new Element('a', {href: "#", text: text, 'data-index': index - 1, events: {
			click: function(e){
				e.stop();
				self.showPage(pager, this.getData('index'));
			}
		}});		
	},
	
	showPage: function(pager, index){
		var pages = pager.getElements('.page').setStyle('display', 'none');
		var numPages = pages.length;
		pages[index].setStyle('display', 'block');
		
		var pagination = pager.getNext('.pagination');
		var numbers = pagination.getElements('.number');
		var next = pagination.getElement('.next a');
		var previous = pagination.getElement('.previous a');
		var first = pagination.getElement('.first a');
		var last = pagination.getElement('.last a');
		
		if (numbers.length > 0){
			numbers.removeClass('active');
			numbers[index].addClass('active');
		}

		if (index == 0){
			if (next){next.removeClass('disabled').setData('index', 1);}
			if (previous){previous.addClass('disabled').setData('index', 0);}
			if (first){first.addClass('disabled');}
			if (last){last.removeClass('disabled');}
		} else if (index == (numPages - 1)){
			if (next){next.addClass('disabled').setData('index', index);}
			if (previous){previous.removeClass('disabled').setData('index', index.toInt() - 1);}
			if (first){first.removeClass('disabled');}
			if (last){last.addClass('disabled');}			
		} else {
			if (next){next.removeClass('disabled').setData('index', index.toInt() + 1);}
			if (previous){previous.removeClass('disabled').setData('index', index.toInt() - 1);}
			if (first){first.removeClass('disabled');}
			if (last){last.removeClass('disabled');}				
		}
		pager.fireEvent('change');
	}
});
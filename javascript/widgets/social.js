/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Creates a social share widget
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var Social = new Class({

	Implements: [Events, Options],

	apis: {
		facebook: {
			countUrl: 'https://graph.facebook.com/?id={url}',
			countsName: 'shares',
			icon: 'iconFacebook1',
			shareName: 'Share',
			submitUrl: 'https://www.facebook.com/sharer.php?u={url}&t={title}'
		},
		twitter: {
			countUrl: 'https://cdn.api.twitter.com/1/urls/count.json?url={url}',
			countsName: 'count',
			icon: 'iconTwitter1',
			shareName: 'Tweet',
			submitUrl: 'https://twitter.com/share?url={url}&text={title}'
		},
		linkedin: {
			countUrl: 'https://www.linkedin.com/countserv/count/share?url={url}&format=jsonp',
			countsName: 'count',
			icon: 'iconLinkedIn1',
			shareName: 'Share',
			submitUrl: 'https://www.linkedin.com/shareArticle?mini=true&url={url}&title={title}'
		},
		pinterest: {
			countUrl: 'https://api.pinterest.com/v1/urls/count.json?url={url}',
			countsName: 'count',
			icon: 'iconPinterest',
			shareName: 'Pin It',
			submitUrl: 'https://pinterest.com/pin/create/button/?url={url}&description={title}'
		},
		reddit: {
			countUrl: 'http://buttons.reddit.com/button_info.json?url={url}',
			countsName: 'score',
			icon: 'iconReddit',
			shareName: 'Reddit',
			submitUrl: 'http://reddit.com/submit?url={url}&title={title}'
		}		
	},
	
	/**
	 * @param string - selectors - The selectors
	 */
	initialize: function(selectors){
		Array.each($$(selectors), function(widget, index){
			this.currentIndex = index;
			this.compileWidget(widget);		
		}, this);
	},
	
	setOptions: function(widget){
		var options = {};
		if (widget.hasData('networks')){
			options.networks = widget.getData('networks').split(',').each(function(item, index, array){ 
				array[index] = item.toLowerCase().trim();
			});
		} else {
			options.networks = ['facebook', 'twitter', 'linkedin', 'pinterest', 'reddit'];
		}
		
		options.showCount = (widget.hasData('showCount')) ? (widget.getData('showCount') === 'true') : true;
		options.countSize = (widget.hasData('countSize')) ? widget.getData('countSize') : 'small';
		options.orientation = (widget.hasData('orientation')) ? widget.getData('orientation') : 'horizontal';
		options.url = (widget.hasData('url')) ? widget.getData('url') : window.location.href;
		options.text = (widget.hasData('text')) ? widget.getData('text') : document.title;
		return options;
	},
	
	compileWidget: function(widget){
		var options = this.setOptions(widget);
		this.widgetList = new Element('ul', {'class': options.orientation + ' ' + options.countSize}).inject(widget);
		options.networks.each(function(network, index){
			this.createWidget(network, options, index);
		}, this);
	},
	
	createWidget: function(network, options, index){
		var self = this,
			url = encodeURIComponent(options.url),
			text = encodeURIComponent(options.text),
			api = this.apis[network],
			networkUrl = api.submitUrl.replace('{url}', url).replace('{title}', text);

		var li = new Element('li');
		
		var icon = new Element('i', {'class': api.icon});
		var shareText = new Element('span', {'class': 'shareText', text: ' ' + api.shareName});
		
		var shareButton = new Element('a', {
			href: networkUrl,
			'class': 'button ' + network + 'Share',
			events: {
				click: function(e){
					e.stop();
					newWindow = window.open(networkUrl, 'name', 'height=400, width=700').focus();
				}
			}
		}).adopt(icon, shareText);
		
		if (options.countSize == 'small') {shareButton.inject(li); }
		
		if (options.showCount){
			var count = new Element('span', {'class': 'count', id: network+self.currentIndex, html: '0'});
			var counter = new Element('span', {'class': 'counter'}).adopt(count).inject(li);
		}
		
		if (options.countSize == 'large') {shareButton.inject(li); }
		
		li.inject(this.widgetList);
		
		if (options.showCount){
			this.getCount(url, index, network, api, this.currentIndex, 0);
		}
	},

	getCount: function(url, index, network, api, currentIndex, currentTry){
		var self = this;
		var sendUrl = api.countUrl.replace('{url}', url).replace('{index}', index);
		var callback = (['reddit'].contains(network)) ? 'jsonp' : 'callback';
		var count = new Request.JSONP({
		  	url: sendUrl,
			callbackKey: callback,
			timeout: 2000,
		  	onComplete: function(response){
				if (network == 'reddit'){
					if (response.data.children.length > 0){
						$(network+currentIndex).set('text', self.formatCount(response.data.children[0].data.score));
					}
				} else {
					if (response[api.countsName] !== undefined){
						$(network+currentIndex).set('text', self.formatCount(response[api.countsName]));
					}
				}
			},
			onTimeout: function(){ //Reddit likes to timeout
				currentTry++
				if (currentTry < 5){
					self.getCount(url, index, network, api, currentIndex, currentTry);
				}
			}
		}).send();		
	},

	formatCount: function(count){
		if (count > 9999){
			var length = count.toString().length;
			var unit = (length >= 7) ? 'M' : 'K';
			var multiplier = '0.';
			for (var i = 3; i <= length; i++){
				multiplier = (i == length) ? multiplier + '1' : multiplier + '0';
			}
			count = (count * multiplier.toFloat()).round(1) + unit;	
		} else if (count > 999){
			count = count * 0.001;
			count = count.round(4).toString().replace('.', ',');		
		}		
		return count;
	}
});
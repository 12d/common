;(function ($, exports, WIN){
	'use strict';

	var NOOP = function(){},
		mix = $.extend,
		sender = WIN.postMessage,
		isNative = sender && typeof sender === 'function',
		isWindow = function(obj) {
		  var toString = Object.prototype.toString.call(obj);

		  return toString == '[object global]' || toString == '[object Window]' || toString == '[object DOMWindow]' || ('setInterval' in obj);
		};
	

	function PostMessage(options){
		var self = this;

		this.options = mix({
			onMessage: NOOP,
			onSend: NOOP
		}, options);
		this.target = options.target;


		this._sender = function(msg, url, tarWin){
			var pm = (isNative ? tarWin.postMessage : tarWin.__postMessage);
			//TODO: ie will could not send message with postMessage here, WHY?!
			//(isNative ? tarWin.postMessage : tarWin.__postMessage)(msg, url);
			//pass iframe window to postMessage, it will send successfully;
			pm.call(tarWin, msg, url);
		};
		//support 'postMessage' manually
		!isNative && this._fake();

		this._listen();
	};

	PostMessage.prototype = {
		constructor: PostMessage,
		send: function(msg, target){
			var tar = target || this.target,
				isWin = isWindow(tar),
				tarWin = (isWin ? tar : tar.contentWindow);

			this._sender(msg, isWin ? tar.location.href : tar.getAttribute('src'), tarWin);

			return this;
		},
		_fake: function(){
			var self = this;

			WIN.__postMessage = function(msg){
				self.options.onMessage.call(self, msg);
			};	
		},
		_listen: function(){
			var self = this,
				onMessage = self.options.onMessage;

			self.__message = function(e){
				onMessage.call(self, e.data);
			};
			$(WIN).bind('message', self.__message);
		},
		destroy: function(){
			$(WIN).unbind('message', this.__message);
		}
	}

	exports.PostMessage = PostMessage;
	
})(cQuery, cQuery.BizMod, window);
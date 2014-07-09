/**
 * @author: xuweichen
 * @date: 2014/7/7 14:24
 * @descriptions 微信分享
 * @depends underscore,lizard
 * <code>
 *      var we = new Wechat({
 *          data: {
 *              "appid": appid,
 *             "img_url": imgUrl,
 *              "img_width": "200",
 *              "img_height": "200",
 *              "link": lineLink,
 *              "desc": descContent,
 *              "title": shareTitle
 *          },
 *          onShared: function(){
 *              alert(JSON.stringify(arguments));
 *          }
 *       });
 * </code>
 */
define(['cBase', 'cUICore', 'cWidgetFactory', 'libs'], function(cBase, cUICore, WidgetFactory){
	// "use strict";
	var NOOP = function(){},
		WechatShare;
	/**
	 * 目标是否为object
	 * @param o
	 * @returns {boolean}
	 */
	function isObject(o){
		return o === Object(o);
	};

	/**
	 * @class 微信分享类
	 * @type {cBase.Class}
	 */
	WechatShare = new cBase.Class({
		__propertys__: function(options){
			this.options = {
				/**
				 * @type {Object} 传给微信分享的数据配置
				 */
				data: null,
				/**
				 * @type {Boolean} 是否侦听微信自身分享按钮
				 */
				enableNative: true,
				/**
				 * @event 分享成功回调
				 */
				onShared: NOOP

			};
		},
		/**
		 * 微信API准备就绪触发的事件
		 * @param callback
		 */
		ready: function(callback){
			var self = this;
			document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
				self.isReady = true;
				//self optimize
				self.ready = function(callback){
					callback && callback();
				};
				self.options.enableNative && self._bindEvents();
				callback && callback();
			});
		},
		/**
		 * 暂时有权限问题，不能直接调用，必须借助微信外壳
		 * @param data 需要分享的配置
		 * @param type 分享类型
		 * @param callback 分享完回调
		 */
		share: function(data, type, callback){
			this._invoke(type, data, callback||this.options.onShared);
		},
		/**
		 * @warn 目前有权限问题不能单独调这个接口，需要微信外壳触发
		 * @description 通过微信消息分享给朋友
		 * @param data {
		 *      "appid": 微信的app id,
		 *      "img_url": imgUrl,
		 *      "img_height": "200",
		 *      "img_width": "200",
		 *      "link": lineLink,
		 *      "desc": descContent,
		 *      "title": shareTitle
		 * }
		 */
		shareFriends: function(data){
			data = data || this.options.data;
			this.share(data, WechatShare.SHARE_APP_MESSAGE);
		},
		/**
		 * @warn 目前有权限问题不能单独调这个接口，需要微信外壳触发
		 * @description 分享朋友圈
		 * @param data {
		 *      "img_url": imgUrl,
		 *      "img_height": "200",
		 *      "img_width": "200",
		 *      "link": lineLink,
		 *      "desc": descContent,
		 *      "title": shareTitle
		 * }
		 */
		shareTimeline: function(data){
			data = data || this.options.data;
			this.share(data, WechatShare.SHARE_TIMELINE);
		},
		/**
		 * @warn 目前有权限问题不能单独调这个接口，需要微信外壳触发
		 * @description 分享到微博
		 * @param data {
		 *      desc: 描述
		 *      url: 分享的链接
		 * }
		 */
		shareWeibo: function(data){
			data = data || this.options.data;
			this.share({
				"content": data.desc,
				"url": data.link
			}, WechatShare.SHARE_WEIBO);
		},
		initialize: function(options){
			if(isObject(options)){
				this.options = $.extend(this.options, options);
			};
		},
		_bindEvents: function(){
			var self = this;
			// 发送给好友
			WeixinJSBridge.on('menu:share:appmessage', function(argv){
				self.shareFriends();
			});
			// 分享到朋友圈
			WeixinJSBridge.on('menu:share:timeline', function(argv){
				self.shareTimeline();
			});
			// 分享到微博
			WeixinJSBridge.on('menu:share:weibo', function(argv){
				self.shareWeibo();
			});
		},
		/**
		 * @description 执行微信提供的方法
		 * @param method 微信暴露的方法名
		 * @param options 传给微信方法的参数
		 * @param callback 调用完成的回调
		 * @private
		 */
		_invoke: function(method, options, callback){
			if(method === WechatShare.SHARE_APP_MESSAGE && !options.appid){
				throw new Error(WechatShare.SHARE_APP_MESSAGE+': appid is required');
				return;
			};

			WeixinJSBridge.invoke(method, options, function(res) {
				callback && callback(res);
			});
		}
	});
	/**
	 * @static
	 * @constant
	 * @type {string} 分享到朋友圈
	 */
	WechatShare.SHARE_TIMELINE = 'shareTimeline';
	/**
	 * @static
	 * @constant
	 * @type {string} 通过微信消息分享
	 */
	WechatShare.SHARE_APP_MESSAGE = 'sendAppMessage';
	/**
	 * @static
	 * @constant
	 * @type {string} 分享到微博
	 */
	WechatShare.SHARE_WEIBO = 'shareWeibo';
	//@export
	return WechatShare;
});


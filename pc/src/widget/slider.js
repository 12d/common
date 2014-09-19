/**
 * @depends cQuery
 */
(function () {
	// "use strict";
	var NOOP = function () { },
		NULL = null,
		LAZY_SRC = 'data-src',
		RE_CSS_VAL = /\-?[0-9]+\.?[0-9]*/g,
		IMAGE_PLACEHOLDER = 'http://pic.c-ctrip.com/hotels121118/InnPic/inn/img_inn_detail_no_result.jpg',
		Slide,
		CSS3ExpandoPrefix = (function () {
			var browser = $.browser,
				prefix = '';

			prefix = browser.isChrome || $.browser.isSafari ? '-webkit-' :
				browser.isFirefox ? '-moz-' :
					(browser.isIE10) ? '-ms-' :
						'';
			return prefix;

		})(),
		JSCSS3Prefix = CSS3ExpandoPrefix.replace(/\-/g, ''),
		animationWorker;

	//用来适配其他第三方动画引擎
	animationWorker = (function () {
		return isCSS3Supported() ? function (dom, dist, duration) {
			var slide = dom[0],
				style = slide && slide.style;

			if (!style) return;

			dom.css(CSS3ExpandoPrefix + 'transition', duration + 'ms ease-out'); //不要用translateX，在chrome下卡
			dom.css(CSS3ExpandoPrefix + 'transform', 'translate(' + dist + 'px,0) translateZ(0)');

		} : function (dom, dist, duration) {
			$.mod.load('animate', '1.0', function () {
				dom.animate({
					left: dist + "px"
				}, duration);
			});

		}
	})();
	function isCSS3Supported() {
		var browser = $.browser;

		return browser.isChrome || browser.isFirefox || browser.isIE10 || browser.isIE11 || browser.isIPad;
	};
	/**
	 * 目标是否为object
	 * @param o
	 * @returns {boolean}
	 */
	function isObject(o) {
		return o === Object(o);
	};
	/**
	 *
	 */
	function loadImg(img) {
		if (!img || $(img).data('loaded')) return;
		var tmp = new Image();

		tmp.src = img.getAttribute(LAZY_SRC);
		tmp.onload = function () {
			img.src = tmp.src;
			img.removeAttribute(LAZY_SRC); //不能用removeAttr，ios上cquery没有封装
			$(img).data('loaded', true);
		};
		tmp.onerror = function () {
			img.src = IMAGE_PLACEHOLDER;
		};
	};
	function getTransformVal(str) {
		var val = 0,
			strArr = str.match(RE_CSS_VAL);

		if (str.indexOf('matrix') > -1) {
			val = strArr[4];
		} else {
			val = strArr[0];
		};
		return parseInt(val, 10);
	};

	function Slide(options) {
		this.options = {
			/**
			 * @cfg {int} 最大幻灯片数，0代表无穷大
			 */
			max: 0,
			/**
			 * @cfg {DOM} 轮播容器
			 */
			container: NULL,
			/**
			 * @cfg {boolean} 自动播放时间间隔, 0不自动播放，单位ms，默认3000
			 */
			autoplay: 5000,
			/**
			 * @cfg {int} 当前播放索引
			 */
			currentIndex: 0,
			/**
			 * @cfg {int} 播放方向, Slide.LEFT|Slide.RIGHT
			 */
			direction: Slide.LEFT,
			/**
			 * @cfg {int} 动画时长，默认300ms
			 */
			animationDuration: 500,
			/**
			 * @cfg {int} 预取数量, 默认0，不预取
			 */
			prefetch: 0,

			placeholder: '',
			/**
			 * @cfg {JSON} 图片数据
			 */
			source: NULL,
			/**
			 * @cfg {string} 轮播模版
			 */
			tpl: '<div class="cui-slide">' +
				'<div class="cui-slide-imgsouter">' +
				'<div class="cui-slide-imgsinter" style="width:9999px">' +
				'<%for(var i=0,len=data.length;i<len;i++){%>' +
				'<%var item = data[i]%>' +
				'<div class="cui-slide-img-item">' +
				'<img data-href="<%=item.href%>" data-src="<%=item.src%>" data-img-id="<%=item.id%>" data-img-title="<%=item.title%>"/>' +
				'</div>' +
				'<%}%>' +
				'</div>' +
				'</div>' +
				'</div>',
			/**
			 * @cfg {string} 滚动子元素的class名称
			 */
			itemCls: '.cui-slide-img-item',

			/**
			 * @cfg {int} 每页显示图片张数，默认1
			 */
			pageSize: 1,
			/**
			 * @cfg {int} 最小有效滑动距离
			 */
			minSwipe: 40,
			/**
			 * @cfg {int}轮播宽度
			 */
			width: 0,
			/**
			 * @cfg {int}轮播高度
			 */
			height: 0,
			/**
			 * @cfg {string}选中元素的class
			 */
			active: '',
			/**
			 * @event 图片切换时触发
			 */
			onSwitch: NOOP,
			/**
			 * @event 切换动画结束
			 */
			onSwitchEnd: NOOP,
			/**
			 * @event 初始化完
			 */
			onInit: NOOP
		};
		this.initialize.call(this, options);
	};

	Slide.prototype = ({
		contructor: Slide,
		initialize: function (options) {
			var opts;

			if (isObject(options)) {
				this.options = $.extend(this.options, options);
			};
			opts = this.options;
			this.container = opts.container;
			this.tpl = opts.tpl;
			//有容器再执行初始化
			if (this.container && this.container.length) {
				this.render(opts.source, opts.currentIndex);

				this.isInteractive() && this._bindEvents();
				opts.autoplay && this._autoplay();

			} else {
				console.error('no container!');
			};
		},
		/**
		 * 是否可交互，轮播，滑动等
		 * @returns {boolean}
		 * @private
		 */
		isInteractive: function () {
			var options = this.options;

			return options.pageSize < this.count();
		},
		_createLayout: function () {
			var data = this.source;

			this.container.html($.tmpl.render(this.tpl, { data: data }));

		},
		_autoplay: function () {
			var self = this;

			clearTimeout(this.__autoplayTimer);
			this.__autoplayTimer = setTimeout(function () {
				self.next(true);
				self._autoplay();
			}, this.options.autoplay);
		},
		_bindEvents: function () {
			var env = this._runtime,
				container = this.container;
			//绑定触摸事件
			this.__moveHandler = this.__moveHandler.bind(this);
			container.bind('touchmove', this.__moveHandler);
			//绑定touchStart
			this.__touchStartHandler = this.__touchStartHandler.bind(this);
			container.bind('touchstart', this.__touchStartHandler);

			//绑定touchEnd
			this.__touchEndHandler = this.__touchEndHandler.bind(this);
			container.bind('touchend', this.__touchEndHandler);
			//绑定动画结束事件
			this.__transitionEndHandler = this.__transitionEndHandler.bind(this);
			env.root.bind(JSCSS3Prefix + 'TransitionEnd', this.__transitionEndHandler);
		},
		_unbindEvents: function () {
			var env = this._runtime,
				container = this.container;

			container.unbind('touchmove', this.__moveHandler);
			container.bind('touchstart', this.__touchStartHandler);
			container.bind('touchend', this.__touchEndHandler);
			env.root.unbind(JSCSS3Prefix + 'TransitionEnd', this.__transitionEndHandler);
		},
		/**
		 * 当前播放索引
		 * @private
		 */
		_current: 0,
		/**
		 * 返回轮播图片个数
		 * @returns {*}
		 */
		count: function () {
			return this.items.length;
		},
		/**
		 * 用数据渲染新对象
		 * @param source
		 * @param currentIndex
		 * @returns {Slide}
		 */
		render: function (source, currentIndex) {
			clearTimeout(this.__autoplayTimer);
			var opts = this.options,
				direction = opts.direction,
				root;

			this.source = source;
			this._createLayout(source);
			this.items = this.container.find(opts.itemCls);
			this._runtime = this._getRuntimeEnv();
			/*    this.items.css({
			 'width': this._runtime.width+'px',
			 'height': this._runtime.height+'px'
			 });*/
			root = this._runtime.root;
			root.css({
				'width': this.count() * this._runtime.width + 'px'
			});
			this.showCurrent(currentIndex, direction, 0);
			this._prefetch(direction);

			opts.onInit.call(this, this._current);
			return this;
		},
		/**
		 * 获取当前播放索引
		 * @returns {number}
		 */
		current: function () {
			return this._current;
		},
		next: function (isAutoplay) {
			this.goto(this._current + this.options.pageSize, Slide.LEFT, isAutoplay);
		},
		prev: function () {
			this.goto(this._current - this.options.pageSize, Slide.RIGHT);
		},
		play: function () {
			this.options.autoplay && this._autoplay();
		},
		pause: function () {
			clearTimeout(this.__autoplayTimer);
		},
		stop: function () {
			clearTimeout(this.__autoplayTimer);
			this.goto(0);
		},
		goto: function (index, swipeDirection, isAutoplay) {

			var self = this,
				env = this._runtime,
				options = this.options,
				direction = options.direction,
				continuous = options.autoplay && isAutoplay, //自动播放的支持连播
				max = env.count,
				from, to,
				maxScrollLeft = env.maxScrollLeft,
				width = env.width;
			//如果不可交互
			if (!this.isInteractive()) {
				this._current = index;
				this._prefetch();
				this.setCurrent(index);
				return;
			};

			index = parseInt(index, 10); //转成数字，否则IE下异常@see: current + prefetchCount - i * direction

			//连播边界处理
			if (continuous) {
				//左边界
				if (index < 0) index = max - 1;
				//右边界
				if (index >= max) index = 0;
			} else {
				//左边界
				if (index < 0) index = 0;
				//右边界
				if (index >= max) index = max - 1;
			};
			//如果索引为负数则跳到第一张
			if (index < 0) {
				index = 0;
			};
			//边界判断
			if (index >= 0 && index <= max) {
				from = direction * width * this._current;
				to = direction * width * index;
				//滚动超过即将右边界
				if (Math.abs(to) > Math.abs(maxScrollLeft)) {
					to = maxScrollLeft;
				};
				self.showCurrent(index, swipeDirection, options.animationDuration);
				//延迟事件，错开渲染高峰
				setTimeout(function () {
					self.options.onSwitch.call(self, index, self.source[index]);
				}, 10);

			};

		},
		setCurrent: function (index) {
			var activeCls = this.options.active,
				currentItem = $(this.items[index]);

			this._lastItem && this._lastItem.removeClass(activeCls);
			currentItem.addClass(activeCls);
			this._lastItem = currentItem;
			this._current = index;
		},
		showCurrent: function (index, swipeDirection, duration) {
			var env = this._runtime;

			duration = duration || 0;
			this.setCurrent(index);
			Slide.animate(env.root, this.options.direction * env.width * index, duration);
			this._prefetch(swipeDirection);
		},
		_prefetch: function (direction) {

			//如果无需预取
			if (this.options.prefetch < 0) return;

			if (!direction) direction = Slide.LEFT;

			var current = this._current,
				prefetchCount = this.options.prefetch,
				item,
				i = prefetchCount * direction;
			//先做一次再说！
			do {
				item = this.items[current + prefetchCount - i * direction];
				item = item && item.children[0];
				item && !$(item).data('loaded') && loadImg(item);
			} while (i -= direction);
		},
		_getSwipeDirection: function (start, end) {
			var offset = end - start,
				offsetABS = Math.abs(offset),
				direction;

			if (offsetABS > 0 && offsetABS > this.options.minSwipe) {
				direction = offset / offsetABS;
			};
			return direction;
		},
		_getRuntimeEnv: function () {
			var items = this.items,
				options = this.options,
				sample = $(items[0]),
				root = sample.parentNode(),
				stage = root.parentNode(),
				stageOffset = stage.offset(),
				width = options.width + (parseInt(sample.css('marginLeft'), 10) || 0) + (parseInt(sample.css('marginRight'), 10) || 0) || stageOffset.width, //cQuery .css('property') property必须驼峰，否则除chrome外都异常
				itemsCount = this.count();

			return {
				width: width,
				height: options.height || stageOffset.height,
				root: root,
				stage: stage,
				count: itemsCount,
				maxScrollLeft: -width * (itemsCount - options.pageSize)
			}

		},
		__touchStartHandler: function (event) {

			var touches = event.touches[0],
				root = this._getRuntimeEnv().root, //不能直接用zepto的offset()，有偏移
				translateX = root.css(CSS3ExpandoPrefix + 'transform');

			translateX = translateX && getTransformVal(translateX) || 0;
			this.__lastTouchStartPos = {
				left: Number(translateX),
				x: touches.pageX,
				y: touches.pageY,
				t: +new Date //时间戳
			};
		},
		__touchEndHandler: function (event) {
			var lastPos = this.__lastTouchStartPos,
				swipeDirection = this._getSwipeDirection(lastPos.x, event.changedTouches[0].pageX); //touchEnd没有pageX

			this[
					swipeDirection === Slide.LEFT ? 'next' :
					swipeDirection === Slide.RIGHT ? 'prev' :
				'goto'
				]();


		},
		__transitionEndHandler: function (event) {
			var current = this._current,
				self = this;

			setTimeout(function () {
				self.options.onSwitchEnd.call(self, event, current, self.source[current]);
			}, 10);
		},
		__moveHandler: function (event) {

			event.preventDefault(); //必须禁止默认行为，否则拖动卡
			//判断多指触摸，缩放
			if (event.touches.length > 1 || event.scale && event.scale !== 1) return;

			var touches = event.touches[0],
				env = this._getRuntimeEnv(),
				root = env.root,
				start = this.__lastTouchStartPos,
				offsetX = start.left + touches.pageX - start.x;
			//				requestAnimationFrame(function(){
			Slide.animate(root, offsetX, 0);
			//				});


		}

	});
	/**
	 * 向左滑动
	 * @static
	 * @type {number}
	 */
	Slide.LEFT = -1;
	/**
	 * 向右滑动
	 * @static
	 * @type {number}
	 */
	Slide.RIGHT = 1;
	/**
	 *
	 * @param dom
	 * @param dist
	 * @param duration
	 */
	Slide.animate = function (dom, dist, duration) {
		var slide = dom[0],
			style = slide && slide.style;

		if (!style) return;

		animationWorker(dom, dist, duration);
	};
	window.Slide = Slide;
})();
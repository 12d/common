/**
 * @author: xuweichen
 * @date: 2014/9/22 15:51
 * @descriptions cQuery plugin to create a flipping effect
 * @version 0.1
 * @requires cquery.js
 */
;(function ($, exports){
	var browser = $.browser,
		mix = $.extend,
//		isCSS3Supported = browser.isChrome || browser.isFirefox || browser.isIE10 || browser.isIE11 || browser.isIPad || false,
		isCSS3Supported = true,
		NULL = null,
		EMPTY = '',
		NOOP = function(){},
		MAX_INDEX = 9999,
		CSS3_PREFIX = (function () {
			var prefix = '';

			prefix = browser.isChrome || $.browser.isSafari ? '-webkit-' :
				browser.isFirefox ? '-moz-' :
					(browser.isIE10) ? '-ms-' :
						'';
			return prefix;

		})(),
		JSCSS3_PREFIX = CSS3_PREFIX.replace(/\-/g, '')
		TRANSITION_END = (function(){
			var prefix;
			prefix = browser.isChrome || $.browser.isSafari ? 'webkit' :
				browser.isFirefox ? 'Moz' :
					(browser.isIE10) ? 'MS' :
						'';
			return prefix ? prefix+'TransitionEnd' : 'transitionend';
		})();

	function Flip(options){
		this.options = {
			/**
			 * @cfg {CDOM} 正面dom元素
			 */
			positive: NULL,
			/**
			 * @cfg {CDOM} 反面dom元素
			 */
			negative: NULL,
			/**
			 * @cfg {CDOM} 需要翻转对象的容器
			 */
			container: NULL,
			/**
			 * @cfg {Array} 触发翻转的事件, 例如['mouseenter', 'click']
			 */
			triggerEvents: NULL,
			loop: 1,
			angle: 0,
			flipAngle: 90
		};
		//init 方法中提供的属性是当前实例方法
		this.initialize.call(this, mix(this.options, options));
	};

	Flip.prototype = {
		constructor: Flip,
		initialize: function(options){
			var triggerEvents = options.triggerEvents;

			this.isFlipping = false;
			this.status = 0;
			this.container = options.container || options.positive.parentNode();
			this.angle = options.angle;
            isCSS3Supported && this._prepare(this.container);
			this._isInteractive = triggerEvents && triggerEvents.length;
			this.loop = options.loop;
			this._bindEvents();
		},
		destroy: function(){
			this._unbindEvents();
		},
		flip: function(){
			var self = this,
				options = self.options;

			if(self.isFlipping) return;


			//如果循环次数用完，切执行了flip，默认加一次
			!self.loop && (self.loop=1);
			self._flipAction();

		},
		_getAngles: function(){
			var angle = this.angle;

			return {
				positive: 'rotateY('+angle+'deg)',
				negative: 'rotateY('+(angle-180)+'deg)'
			}
		},
		_getTransitions: function(){
			return {
				'in': CSS3_PREFIX+'transform 300ms ease-in 0ms',
				'out': CSS3_PREFIX+'transform 300ms ease-out 0ms'
			}
		},
		_prepare: function(){
			var self = this,
				options = self.options,
				container = self.container,
				angles = self._getAngles(),
				offset = container.offset();
			//初始化容器视角
			container.css3({
				perspective: Math.max(offset.width, offset.height),
				'perspective-origin': '60% 60%'
			});
//			self._flipAction(true);
			options.negative.css3({
				transform: angles.negative
			});
			setTimeout(function(){
				self.__setTransition(true);
			},0);

		},
		__setTransition: function(isIn){
			var self = this,
				options = self.options,
				transition = self._getTransitions()[isIn ? 'in' : 'out'];

			options.negative.css3({
				'transition': transition
			});
			options.positive.css3({
				'transition': transition
			});
		},
		_bindEvents: function(){
			var self = this,
				options = self.options,
				triggerEvents = options.triggerEvents;

			if(self._isInteractive){
				self.__flipHandler = self.flip.bind(self);
				triggerEvents.each(function (event){
					self.container.bind(event, self.__flipHandler);
				});
			};
			//绑定动画事件
			self.__onTransitionEnd = self._transitionEndHandler.bind(self);
			options.negative.bind(TRANSITION_END, self.__onTransitionEnd);

		},
		_unbindEvents: function(){
			var self = this,
				options = self.options,
				triggerEvents = options.triggerEvents;

			if(self._isInteractive && self.__flipHandler){
				triggerEvents.each(function (event){
					self.container.unbind(event, self.__flipHandler);
				});
			};
		},
		_flipInfo: function(){
			var self = this,
				options = self.options,
				val = (self.angle/options.flipAngle) % 4,
				obj = {
					turnIn: val === 0 || val === 1
				};
			console.log(self.angle);
			obj.zIndex = isCSS3Supported ? obj.turnIn : (val === 3 || val === 1);

			return obj;
		},
        _flipAction: function(turnIn){
            var self = this,
                options = self.options,
                angles,
	            positive = options.positive,
	            negative = options.negative,
	            isPositive = self.isPositive(),
	            flipInfo = self._flipInfo(),
	            needChangeZIndex = flipInfo.zIndex,
	            isTurnIn;

	        self.angle += options.flipAngle;
	        self.isFlipping = true;
	        angles = self._getAngles();
	        isTurnIn = turnIn || flipInfo.turnIn;
			if(isCSS3Supported){

	            positive.css3({
					transform: angles.positive
	            });
	            negative.css3({
		            transform: angles.negative
	            });
			}else{
				self._fakeTransform(isTurnIn);
			};


	        /*设置层级*/
	        positive.css({
		        'z-index': needChangeZIndex ? MAX_INDEX : EMPTY
	        });
	        negative.css({
		        'z-index': needChangeZIndex ? EMPTY : MAX_INDEX
	        });


        },
		_fakeTransform: function(isTurnIn){
			var self = this,
				isPositive = self.isPositive(),
				options = self.options;

			$.mod.load('animate', '1.0', function () {
				options.positive.animate({
					left: (isTurnIn ? 50 : 0) + "px",
					width: (isTurnIn ? 0 : 100) + "px"
				}, {
					duration: 300,
					easing: "swing",
					always: function(){
						self.__onTransitionEnd();
					}
				});
				options.negative.animate({
					left: (isTurnIn ? 50 : 0) + "px",
					width: (isTurnIn ? 0 : 100) + "px"
				}, {duration: 300, easing: "swing"});
			});
		},
        _transitionEndHandler: function(){
            var options = this.options,
                positive = options.positive,
                negative = options.negative;

	        this.isFlipping = false;
	        if(this.loop>0){
		        this._flipAction();
		        this.loop--;
	        };
	        this.status &= 1;
        },
		isPositive: function(){
			return (this.angle / 180) % 2 === 0;
		}
	};

	exports.Flip = Flip;
	$.fn.flip = function(options){
		Flip.flip(options);
	};
})(cQuery, window);
/*
( function( $ ) {

	var FALSE = false,
		NULL = null;

	$.quickFlip = {
		wrappers : [],
		opts  : [],
		objs     : [],

		init : function( options, box ) {
			var options = options || {};

			options.closeSpeed = options.closeSpeed || 180;
			options.openSpeed  = options.openSpeed  || 120;

			options.ctaSelector = options.ctaSelector || '.quickFlipCta';

			options.refresh = options.refresh || FALSE;

			options.easing = options.easing || 'swing';

			options.noResize = options.noResize || FALSE;

			options.vertical = options.vertical || FALSE;

			var $box = typeof( box ) != 'undefined' ? $(box) : $('.quickFlip'),
				$kids = $box.children();

			// define $box css
			if ( $box.css('position') == 'static' ) $box.css('position', 'relative');

			// define this index
			var i = $.quickFlip.wrappers.length;

			// close all but first panel before calculating dimensions
			$kids.each(function(j) {
				var $this = $(this);

				// attach standard click handler
				if ( options.ctaSelector ) {
					$this.find(options.ctaSelector).click(function(ev) {
						ev.preventDefault();
						$.quickFlip.flip(i);
					});
				}

				if ( j ) $this.hide();
			});

			$.quickFlip.opts.push( options );

			$.quickFlip.objs.push({$box : $($box), $kids : $($kids)});

			$.quickFlip.build(i);



			// quickFlip set up again on window resize
			if ( !options.noResize ) {
				$(window).resize( function() {
					for ( var i = 0; i < $.quickFlip.wrappers.length; i++ ) {
						$.quickFlip.removeFlipDivs(i);

						$.quickFlip.build(i);
					}
				});
			}
		},

		build : function(i, currPanel) {
			// get box width and height
			$.quickFlip.opts[i].panelWidth = $.quickFlip.opts[i].panelWidth || $.quickFlip.objs[i].$box.width();
			$.quickFlip.opts[i].panelHeight = $.quickFlip.opts[i].panelHeight || $.quickFlip.objs[i].$box.height();

			// init quickFlip, gathering info and building necessary objects
			var options = $.quickFlip.opts[i],

				thisFlip = {
					wrapper    : $.quickFlip.objs[i].$box,
					index      : i,
					half       : parseInt( (options.vertical ? options.panelHeight : options.panelWidth) / 2),
					panels     : [],
					flipDivs   : [],
					flipDivCols : [],
					currPanel   : currPanel || 0,
					options     : options
				};

			// define each panel
			$.quickFlip.objs[i].$kids.each(function(j) {
				var $thisPanel = $(this).css({
					position : 'absolute',
					top : 0,
					left : 0,
					margin : 0,
					padding : 0,
					width : options.panelWidth,
					height : options.panelHeight
				});

				thisFlip.panels[j] = $thisPanel;

				// build flipDivs
				var $flipDivs = buildFlip( thisFlip, j ).hide().appendTo(thisFlip.wrapper);

				thisFlip.flipDivs[j] = $flipDivs;
				thisFlip.flipDivCols[j] = $flipDivs.children();
			});

			$.quickFlip.wrappers[i] = thisFlip;

			function buildFlip( x, y ) {
				// builds one column of the flip divs (left or right side)
				function buildFlipCol(x, y) {
					var $col = $('<div></div>'),
						$inner = x.panels[y].clone().show();

					$col.css(flipCss);

					$col.html($inner);

					return $col;
				}

				var $out = $('<div></div>'),

					inner = x.panels[y].html(),

					flipCss = {
						width : options.vertical ? options.panelWidth : x.half,
						height : options.vertical ? x.half : options.panelHeight,
						position : 'absolute',
						overflow : 'hidden',
						margin : 0,
						padding : 0
					};

				if ( options.vertical ) flipCss.left = 0;
				else flipCss.top = 0;

				var $col1 = $(buildFlipCol(x, y)).appendTo( $out ),
					$col2 = $(buildFlipCol(x, y)).appendTo( $out );

				if (options.vertical) {
					$col1.css('bottom', x.half);

					$col2.css('top',  x.half);

					$col2.children().css({
						top : NULL,
						bottom: 0
					});
				}
				else {
					$col1.css('right', x.half);
					$col2.css('left', x.half);

					$col2.children().css({
						right : 0,
						left : 'auto'
					});
				}

				return $out;
			}
		},

		// function flip ( i is quickflip index, j is index of currently open panel)

		flip : function( i, nextPanel, repeater, options) {
			function combineOpts ( opts1, opts2 ) {
				opts1 = opts1 || {};
				opts2 = opts2 || {};

				for ( opt in opts1 ) {
					opts2[opt] = opts1[opt];
				}

				return opts2;
			}

			if ( typeof i != 'number' || typeof $.quickFlip.wrappers[i] == 'undefined' ) return;

			var x = $.quickFlip.wrappers[i],

				j = x.currPanel,
				k = ( typeof(nextPanel) != 'undefined' && nextPanel != NULL ) ? nextPanel : ( x.panels.length > j + 1 ) ? j + 1 : 0;
			x.currPanel = k,

				repeater = ( typeof(repeater) != 'undefined' && repeater != NULL ) ? repeater : 1;

			options = combineOpts( options, $.quickFlip.opts[i] );

			x.panels[j].hide()

			// if refresh set, remove flipDivs and rebuild
			if ( options.refresh ) {
				$.quickFlip.removeFlipDivs(i);
				$.quickFlip.build(i, k);

				x = $.quickFlip.wrappers[i];
			}

			x.flipDivs[j].show();

			// these are due to multiple animations needing a callback
			var panelFlipCount1 = 0,
				panelFlipCount2 = 0,
				closeCss = options.vertical ? { height : 0 } : { width : 0 },
				openCss = options.vertical ? { height : x.half } : { width : x.half };

			x.flipDivCols[j].animate( closeCss, options.closeSpeed, options.easing, function() {
				if ( !panelFlipCount1 ) {
					panelFlipCount1++;
				}
				else {
					x.flipDivs[k].show();

					x.flipDivCols[k].css(closeCss);

					x.flipDivCols[k].animate(openCss, options.openSpeed, options.easing, function() {
						if ( !panelFlipCount2 ) {
							panelFlipCount2++;
						}
						else {

							x.flipDivs[k].hide();

							x.panels[k].show();

							// handle any looping of the animation
							switch( repeater ) {
								case 0:
								case -1:
									$.quickFlip.flip( i, NULL, -1);
									break;

								//stop if is last flip, and attach events for msie
								case 1:
									break;

								default:
									$.quickFlip.flip( i, NULL, repeater - 1);
									break;
							}
						}
					});
				}
			});

		},

		removeFlipDivs : function(i) {
			for ( var j = 0; j < $.quickFlip.wrappers[i].flipDivs.length; j++ ) $.quickFlip.wrappers[i].flipDivs[j].remove();
		}
	};

	$.fn.quickFlip = function( options ) {
		this.each( function() {
			new $.quickFlip.init( options, this );
		});

		return this;
	};

	$.fn.whichQuickFlip = function() {
		function compare(obj1, obj2) {
			if (!obj1 || !obj2 || !obj1.length || !obj2.length || obj1.length != obj2.length) return FALSE;

			for ( var i = 0; i < obj1.length; i++ ) {
				if (obj1[i]!==obj2[i]) return FALSE;
			}
			return true;
		}

		var out = NULL;

		for ( var i=0; i < $.quickFlip.wrappers.length; i++ ) {
			if ( compare(this, $( $.quickFlip.wrappers[i].wrapper)) ) out = i;
		}

		return out;
	};

	$.fn.quickFlipper = function( options, nextPanel, repeater ) {
		this.each( function() {
			var $this = $(this),
				thisIndex = $this.whichQuickFlip();

			// if doesnt exist, set it up
			if ( thisIndex == NULL ) {
				$this.quickFlip( options );

				thisIndex = $this.whichQuickFlip();
			}

			$.quickFlip.flip( thisIndex, nextPanel, repeater, options );
		});
	};

})( jQuery );
    */
/**
 * @author: xuweichen
 * @date: 2014/9/22 15:51
 * @descriptions cQuery plugin to create a flipping effect
 * @version 0.1
 * @requires cquery.js (tested with v 1.3.2)
 * FOR USAGE INSTRUCTIONS SEE THE DOCUMENATION AT: http://dev.jonraasch.com/quickflip/docs
 */
;(function ($, exports){
	var NULL = null,
		EMPTY = '',
		NOOP = function(){},
		mix = $.extend,
		isCSS3Effect = true,
		Flip;

	function Flip(){
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
			/**
			 * @cfg {int} 正反面状态，0：正面 1：反面
			 */
			status: 0
		};
		//init 方法中提供的属性是当前实例方法
		this.initialize.call(this, options);
	};

	function prepareContainer(dom){
		dom.css3({
			perspective: dom
		});
	};

	Flip.prototype = {
		constructor: Flip,
		initialize: function(options){
			var triggerEvents = options.triggerEvents;

			this.container = options.container;
			this._bindEvents();
			this._isInteractive = triggerEvents && triggerEvents.length;

		},
		destroy: function(){
			this._unbindEvents();
		},
		flip: function(){
			var self = this,
				options = self.options;

			options.negative.addClass(options.flipOutCls);

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


		}
	};

	exports.flip = function(dom, options){
		Flip.flip(dom, options);
	};
	$.fn.flip = function(options){
		Flip.flip(options);
	};
})(cQuery, cQuery.BizMod.Effect);

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
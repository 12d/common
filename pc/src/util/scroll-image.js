/**
 * Created by li.xx on 14-7-3.
 * @description 首页图片轮播, 经测试在IE7+， 谷歌，firefox, 及360 运行正常
 * 依赖cQuery
 * 
 */
; (function ($, win, undefined) {
    function ScrollImage(options) {
        var defaultOpt = {
            wrap: $('#J_imgScrollBox'), //最外层容器

            timer: 5000, //控制图片转变效果
            play: null, //控制自动播放
            imgurl: [], //存放图片
            tpl: 'ul'
        };

        this.opt = $.extend(defaultOpt, options);
        this.wrap = $(this.opt.wrap);
        this.count = this.opt.imgurl.length;
        this.prev = 0;
        this.index = 0;
        this.init();
    }

    ScrollImage.prototype = {
        constructor: ScrollImage,
        init: function() {
            this.wrap.append(this._getImgageHtml());
            this.ulwrap = this.wrap.find('ul');
            this.imglist = this.ulwrap.find('li');

            for (var i = 0; i < this.count; i++) {
                this._setAlpha(i, 0);
            }
            this._setAlpha(0, 100);

            this.autoPlay();
            this.mouseoverout(this.wrap);
        },

        autoPlay: function() {
            var self = this;
            self.play = setInterval(function() {
                self.prev = self.index;
                self.index++;
                (self.index > (self.count - 1)) && (self.index = 0);
                self.showImage(self.index);
            }, this.opt.timer);
        },

        stopPlay: function() {
            clearInterval(this.play);
        },

        showImage: function(num) {
            var self = this,
                pralpha = 100,
                inalpha = 0;
            clearInterval(self.switchImage);
            self.index = num;

            for (var i = 0; i < self.count; i++) {
                self._setAlpha(i, 0);
            }
            self._setAlpha(self.prev, 100);
            self._setAlpha(self.index, 0);

            self.switchImage = setInterval(function() {
                inalpha += 2;
                pralpha -= 2;
                inalpha > 100 && (inalpha = 100);
                pralpha < 0 && (pralpha = 100);

                self._setAlpha(self.prev, pralpha);
                self._setAlpha(self.index, inalpha);

                inalpha === 100 && pralpha === 0 && clearInterval(self.switchImage);
            }, 20);//20ms 切换一次透明度

        },

        //生成img dom
        _getImgageHtml: function() {
            var html = [], i, opt = this.opt;
            html.push('<ul>');
            for (i = 0; i < this.count; i++) {
                html.push('<li><img src="' + opt.imgurl[i] + '"></li>');
            }
            html.push('</ul>');
            return html2dom(html.join(''));
        },
        //设置透明度
        _setAlpha: function(index, opacity) {
            var img = this.imglist[index];
            img.style.opacity = opacity / 100;
            img.style.filter = 'alpha(opacity=' + opacity + ')';
        },

        mouseoverout: function(dom) {
            var self = this;
            if (!$.browser.isIPad) {
                dom.bind('mouseover', function() {
                    clearInterval(self.play);
                });

                dom.bind('mouseout', function() {
                    self.autoPlay();
                })
            }
        },

        showPrev: function() {
            clearInterval(self.switchImage);
            this.stopPlay();
            this.prev = this.index;
            this.index--;
            (this.index < 0) && (this.index = this.count - 1);
            this.showImage(this.index);
        },
        showNext: function() {
            clearInterval(self.switchImage);
            this.stopPlay();
            this.prev = this.index;
            this.index++;
            (this.index > this.count -1) && (this.index = 0);
            this.showImage(this.index);
        }

    };



    function html2dom(html) {
        var fragment = document.createDocumentFragment();
        var div = document.createElement('div');

        div.innerHTML = html;
        var children = div.children;

        while (children.length > 0) {
            fragment.appendChild(children[0]);
        }

        return fragment;
    }

	/*
	 *  测试代码
 	*/
    var imgUrlList = ['http://pic.c-ctrip.com/hotels121118/zzz1920_572_3.jpg',
        'http://pic.c-ctrip.com/hotels121118/zzz1920_572_2.jpg',
        'http://pic.c-ctrip.com/hotels121118/zzz1920_572_1.jpg'];

    var $imgBox = $('#J_imgScrollBox');

    var scrollImage = new ScrollImage({
        imgurl: imgUrlList,
        wrap: $imgBox
    });
    $imgBox.find('.btn_prev').bind('click', function() {
        scrollImage.showPrev();
    });
    $imgBox.find('.btn_next').bind('click', function() {
        scrollImage.showNext();
    });

})(cQuery, window, undefined);
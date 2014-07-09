/**
* @author: xuweichen
* @date: 12-11-27 下午3:23
* @descriptions
*/
;
(function (cQuery, WINDOW, undefined) {
    var BizMod = cQuery.BizMod || {},
        Util = {};

    /**
    * copy all properties in the supplier to the receiver
    * this method is much more efficial than $.extend
    * @param r {Object} receiver
    * @param s {Object} supplier
    * @param or {boolean=} whether override the existing property in the receiver
    * @param cl {(Array.<string>)=} copy list, an array of selected properties
    */
    function mix(r, s, or, cl) {
        if (!s || !r) return r;
        var i = 0, c, len;
        or = or || or === undefined;

        if (cl && (len = cl.length)) {
            for (; i < len; i++) {
                c = cl[i];
                if ((c in s) && (or || !(c in r))) {
                    r[c] = s[c];
                }
            }
        } else {
            for (c in s) {
                if (or || !(c in r)) {
                    r[c] = s[c];
                }
            }
        }
        return r;
    }

    ;
    function htmlToDom(html, win) {
        var div = win ? win.document.createElement('div') : document.createElement('div'),
            fragment = document.createDocumentFragment();

        div.innerHTML = html;
        var children = div.children;

        if (children.length > 1) {
            while (children.length > 0) {
                fragment.appendChild(children[0]);
            }
            return fragment;
        } else {
            return children[0];
        }
    }

    ;

    BizMod.Util = Util = {
        mix: mix,
        htmlToDom: htmlToDom
    };


    ['Function', 'String', 'Object', 'Array', 'Number'].each(function (item) {
        Util['is' + item] = function (data) {
            return $.type(data) === item.toLowerCase();
        }
    });

    mix(Util, {
        // TODO: this method is temperary
        makeArray: function (obj) {
            //for IE lte 8, browser will throw an error when "this" is nodelist,"if(C.browsers.ie<9)" is better, but cQuery is not support
            if (cQuery.browser.isIE) {
                var j, i = 0, rs = [];
                while (j = obj[i])
                    rs[i++] = j;
                return rs;
            } else {
                return Array.prototype.slice.call(obj);
            }
        }
    });
    /**
    * @module Toggle
    */
    ;
    (function (C, WIN, undefined) {
        var NOOP = function () {
        },
            NULL = null,
            EMPTY = '',
            Toggle = function (options) {
                var self = this,
                    DEFAULT_OPTIONS = {
                        eventType: 'click',
                        status: 0,
                        btn: NULL,
                        btnActiveCls: EMPTY
                    };

                self.options = options = mix(DEFAULT_OPTIONS, options);
                self.__status = options.status;
                self.initialize(options);

            };
        Toggle.prototype = {
            constructor: Toggle,
            initialize: function (options) {
                var self = this;
                options.btn.bind(options.eventType, function (e) {
                    //e.stop();
                    self._changeView();
                });
            },
            __status: 0,
            _changeView: function (status) {
                var self = this,
                    options = self.options,
                    btnCls = options.btnActiveCls;

                status = status || self.__status;

                btnCls && options.btn[status ? 'addClass' : 'removeClass'](btnCls);
                self.__status = self.__status ? 0 : 1;
                options.onChange && options.onChange.call(self, options.btn, self.__status);
            }
        };

        //exports
        return BizMod.Toggle = Toggle;

    })(cQuery, WINDOW);

    ;
    (function (C, WIN, undefined) {
        function Pagination(options) {
            var self = this,
                NULL = null,
                DEFAULT_OPTIONS = {
                    pageSize: 10,
                    source: NULL,
                    ftl: '<a href="javascript:void(0);">${page}</a>',
                    wrap: NULL,
                    activeClass: 'c_page_mini_current',
                    onNav: function () {
                    }
                };

            self.options = options = mix(DEFAULT_OPTIONS, options);
            self.wrap = options.wrap;

        };
        Pagination.prototype = {
            _cut: function (source, pageSize) {
                this.currentPage = 0;
                this.totalPage = Math.ceil(source.length / pageSize);
            },
            id: 'pagination',
            _renderUI: function () {
                var options = this.options,
                    total = this.totalPage + 1,
                    html = '',
                    btns;

                while (--total) {
                    html = $.tmpl.render(options.ftl, { page: total }) + html;
                }
                !options.leftBtn && (options.leftBtn = $.tmpl.render(options.ftl, { page: '<-' }));
                !options.rightBtn && (options.rightBtn = $.tmpl.render(options.ftl, { page: '->' }));
                this.wrap.html(options.leftBtn + html + options.rightBtn);

                btns = Util.makeArray(this.wrap[0].children);
                this.leftBtn = btns[0];
                this.rightBtn = btns[btns.length - 1];
                this.btns = btns.slice(1, -1);
                this._btnTag = this.btns[0].tagName.toLowerCase();
            },
            initialize: function (setting) {
                var self = this;
                self.source = setting.source;
                self.paging(self.source || self.options.source);
                self._bindEvent();
                self.navPage(0);
            },
            _bindEvent: function () {
                var self = this;
                self.wrap.bind('click', function (e) {
                    var target = e.target,
                        index;

                    if (self._btnTag == target.tagName.toLowerCase()) {
                        index = self.btns.indexOf(e.target);
                        if (index !== -1) {
                            self.navPage(index);
                        } else if (target === self.leftBtn) {
                            self.backward();
                        } else if (target === self.rightBtn) {
                            self.forward();
                        }
                    }


                });
            },
            paging: function (source) {
                if (!source || !source.length) C.error('no source to paging');
                var self = this,
                    options = self.options;
                self.source = source;
                self._cut(source, options.pageSize);
                self._renderUI();

                return self;
            },
            forward: function () {
                this.navPage(this.currentPage + 1);
            },
            backward: function () {
                this.navPage(this.currentPage - 1);
            },
            navPage: function (page) {
                var self = this,
                    btns = self.btns,
                    options = self.options,
                    activeClass = options.activeClass,
                    pageSize = options.pageSize,
                    lastBtn;

                self.lastPage = self.currentPage;
                lastBtn = btns[self.lastPage];
                lastBtn && C(lastBtn).removeClass(activeClass);
                if (page < 0) page = 0;
                if (page >= self.totalPage) page = (self.totalPage - 1);
                options.onNav.call(self, self.source.slice(pageSize * page, pageSize * (page + 1)), btns[page]);
                C(btns[page]).addClass(activeClass);

                self.currentPage = page;
                return self;
            }
        };
        return BizMod.Pagination = Pagination;
    })(cQuery, WINDOW);

    /**
    * @module Suggest
    * @options
    *      rootTag:
    *      delay:
    *      onSelection:
    *      source:
    *      filter
    *      activeClass
    *      rootClass
    *      tpl
    *
    */

    ;
    (function (C, WIN, undefined) {
        var NOOP = function () {
        },
            NULL = null,
            KEYS = {
                DOWN: 40,
                UP: 38,
                LEFT: 37,
                RIGHT: 39,
                ENTER: 13
            },
            hideCls = 'hidden',
            doc = WIN.document,
            body = C(doc.body);
        /*
        function selectRange(target, start, end) {
        target = target[0];
        if (C.browser.isIE) {
        var range = target.createTextRange();
        range.collapse(true);
        range.moveEnd('character', end);
        range.moveStart('character', start);
        range.select();
        } else {
        target.focus();
        target.setSelectionRange(start, end);
        }
        return target;
        }
        */
        function arrestItem(dom, parent) {
            if (!parent.contains(dom)) return null;
            dom = dom[0];
            parent = parent[0];
            while (dom.parentNode !== parent) {
                dom = dom.parentNode
            }
            return dom;
        }

        ;

        function Suggest(input, wrap, opt) {
            if (!C.isCDom(input)) C.error('no suggest input!');

            var self = this,
                timer,
                DEFAULT_OPTIONS = {
                    rootTag: 'ul',
                    delay: 300,
                    filter: function () {
                        return true;
                    },
                    enableFilter: false,
                    onChange: function (data) {
                        //this.display(data);
                    },
                    activeClass: '',
                    enableEmpty: true
                };

            if (C.isPlainObject(wrap)) {
                opt = wrap;
                wrap = NULL;
            }

            self.options = opt = mix(DEFAULT_OPTIONS, opt);
            self.selectedIndex = -1;
            self.input = input;
            self.wrap = wrap;
            self._root = self._createRoot();
            if (!wrap) {
                self.wrap = self._root;
            } else {
                self._root.removeClass(hideCls);
            }
            self._render = opt.render;
            self._plugins = {};
            self.source = opt.source;
            self.initialize();
            opt.enableEmpty && (self.__cache[''] = opt.source); // show all when conditions
            //delay filter, upgrate performance!
            self.input.bind('keydown', function (e) {
                if (self.visible) {
                    if (self._isCommand(e.keyCode)) {
                        self._command(e);
                    } else {
                        clearTimeout(timer);
                        timer = setTimeout(function () {
                            self._input();
                        }, opt.delay);
                    }
                }
            });

            self._root.bind('click', function (e) {
                var target = arrestItem(C(e.target), self._root),
                    index = target ? self.__domList.indexOf(target) : -1;

                index > -1 && self.select(index, target);
            });

            self.input.bind('focus', function (e) {
                self.show();
            });


        }

        Suggest.prototype = {
            constructor: Suggest,
            initialize: function () {
                var self = this;
                self.__cache = {};
                self.selectIndex = -1;
                self.value = NULL;
                self.visible = false;
            },
            _position: function (refer, offset) {
                var position = refer.offset();
                !offset && (offset = {});
                this.wrap.css({
                    position: 'absolute',
                    zIndex: 999,
                    top: position.top + (offset.top || 0) + 'px',
                    left: position.left + (offset.left || 0) + 'px'
                });
            },
            plugin: function (mod) {
                this._plugins[mod.id] = mod;
                mod.initialize({ source: this.source });
                return this;
            },
            _createRoot: function (tag) {
                var self = this,
                    opts = self.options,
                    cls = opts.rootClass,
                    wrap = self.wrap,
                    root;

                if (root = opts.root) return root;
                root = doc.createElement(tag || opts.rootTag);
                cls && (root.className = cls);
                root = C(root);
                root.addClass(hideCls);
                (wrap ? wrap : body).append(root);
                return root;
            },
            _isCommand: function (code) {
                return [KEYS.LEFT, KEYS.RIGHT, KEYS.UP, KEYS.DOWN, KEYS.ENTER].indexOf(code) != -1;
            },
            _preSelect: function (index) {
                var self = this,
                    list = self.__domList,
                    activeClass = self.options.activeClass,
                    cur = list[index];

                if (cur) {
                    C(list[self._preSelectedIndex]).removeClass(activeClass);
                    C(cur).addClass(activeClass);
                    self._preSelectedIndex = index;
                }

            },
            select: function (index, item) {
                var self = this,
                    onSelection = self.options.onSelection;

                item = item || self.__domList[index];
                self.selectedIndex = index;
                onSelection && onSelection.call(self, item, self.__dataList[index]);
                self.close();
            },
            _filter: function (data) {
                var filter = this.options.filter,
                    filteredData = [],
                    len = data.length,
                    cur,
                    self = this,
                    i = 0,
                    str = self.input.value().trim();

                if (!str) return filteredData;
                for (; i < len; i++) {
                    if (filter(cur = data[i], str)) filteredData.push(cur);
                }
                return !!(filteredData.length) && filteredData;

            },
            _move: function (step) {
                var self = this,
                    cur = self._preSelectedIndex,
                    list = self.__domList,
                    rsLength = list.length;

                cur = step + cur;
                cur = cur > rsLength - 1 ? cur - rsLength : cur < 0 ? rsLength + cur : cur;
                list = list[cur];
                if (list) {
                    //list.scrollIntoView(false);
                    self._preSelect(cur);
                }
            },
            _command: function (e) {
                var self = this,
                    pagination;

                switch (e.keyCode) {
                    case KEYS.LEFT:
                        (pagination = self._plugins['pagination']) && pagination.backward();
                        break;
                    case KEYS.RIGHT:
                        (pagination = self._plugins['pagination']) && pagination.forward();
                        break; // do what should do when press ←  →
                    case KEYS.UP:
                        e.stop();
                        self._move(-1);
                        break;
                    case KEYS.DOWN:
                        e.stop();
                        self._move(1);
                        break; //down
                    case KEYS.ENTER:
                        e.stop();
                        self.select(self._preSelectedIndex);
                        break;
                }

            },
            _input: function () {
                var self = this,
                    currentList,
                    list = self.options.source,
                    val = self.value = self.input.value().trim();

                currentList = self.options.enableFilter ? (self.__cache[val] || (self.__cache[val] = self._filter(list))) : list;
                self.options.onChange.call(self, currentList);
            },
            display: function (data) {
                var html = '',
                    self = this,
                    tpl = self.options.tpl,
                    parse = C.tmpl.render;

                data && data.each(function (item, key) {
                    html += C.tmpl.render(tpl, item);
                });
                self.__dataList = data;
                self._root.html(html);
                self.__domList = Util.makeArray(self._root[0].children);
                self.reset();
                return self;
            },
            show: function (refer) {
                var self = this;

                if (!self.visible) {
                    this.trigger = refer ? C(refer) : this.input;
                    this._input();
                    this._position(this.trigger, this.options.offset);
                    this.wrap.removeClass(hideCls);
                    this.visible = true;

                    this._blurClose = function (e) {
                        var target = e.target,
                            wrap = self.wrap;

                        self.visible && !(wrap.contains(C(target)) || wrap[0] === target) && self.close();
                    };

                    body.bind('mousedown', self._blurClose);
                }
                return this;
            },
            close: function () {
                body.unbind('mousedown', this._blurClose);
                this.wrap.addClass(hideCls);
                this.visible = false;
                this.reset();
                return this;
            },
            reset: function () {
                var self = this,
                    list = self.__domList,
                    preIndex = self._preSelectedIndex,
                    current = list && preIndex > -1 && list[preIndex] || undefined;

                current && C(current).removeClass(self.options.activeClass);
                self._preSelectedIndex = self.selectedIndex = -1;
            }
        }

        return BizMod.Suggest = Suggest;

    })(cQuery, WINDOW);

    /**
    * @description: placeholder module for jQuery
    * @warns: you must use placeholder after domready, or it will cause some problem in IEs
    * @version: v1.0
    * @blog: 12d.iteye.com
    * @email: next_100@sina.com
    * @author: xuwei.chen
    */
    //"use strict";
    (function (C, WIN, undefined) {
        var doc = WIN.document,
            browser = C.browser,
            supportNativePlaceHolder = 'placeholder' in doc.createElement('input'),
        //supportNativePlaceHolder = false,
        // @const
            INPUT_TYPE_RE = /(<\s*input.*\s+type=['"]*)(?:\w+)(['"]*\s+.*>)/gi,
            EMPTY = '',
        //IElte8 = browser.msie && parseFloat(browser.version)<9, //for jQuery
            IElte8 = browser.isIE && (browser.isIE6 || browser.isIE7 || browser.isIE8), // for cQuery
        //IElte8 = browser.ie<=8, // nice!
            IElte8_PASSWORD = false, //will suport in next version
            PASSWORD = 'password',
            FAKE_DOM = 'data-fakedom',
            FAKED = 'data-faked';


        function triggerPlaceHolder(data, force) {
            var self = C(this),
                v = self.value().trim(),
                p = data.txt,
                hasVal = !(v == EMPTY || v == p);

            self[(hasVal || force) ? 'removeClass' : 'addClass'](data.cls);
            return hasVal;
        }

        function fakePassword(dom) {
            var div = C(doc.createElement('div')),
                fake;


            dom = C(dom);
            //dom.clone().removeAttr('id').removeAttr('name').attr('real-type', 'password').appendTo(div); //for jQuery
            /* for cQuery */
            var clonedDom = dom.clone();
            clonedDom.attr('real-type', 'password');
            clonedDom[0].removeAttribute('id');
            clonedDom[0].removeAttribute('name');
            clonedDom.appendTo(div);
            /* for cQuery */
            div.html(div.html().replace(INPUT_TYPE_RE, "$1text$2"));
            //dom.after(fake = div.children().first()); for jQuery
            (fake = div.find('*').first()).insertAfter(dom); //for cQuery
            dom.hide();
            fake.bind('focus', function () {
                C(this).hide();
                dom.show();
                dom[0].focus();
            });
            return fake;
        }

        function makeSimulator(isPassword) {
            return {
                focus: function (evt, data) {
                    var dom = C(this);

                    data = data || evt.data; //compatible to cQuery
                    /* ie=9 */
                    if (isPassword && dom.data(FAKED)) {
                        this.setAttribute('type', 'password'); //  jQuery is not allowed to set type of input
                        dom.data(FAKED, false);
                    }
                    if (!triggerPlaceHolder.call(this, data, true)) {
                        dom.value(EMPTY);
                    }
                    ;

                },
                blur: function (evt, data) {
                    var fake, txt,
                        dom = C(this);

                    data = data || evt.data; //compatible to cQuery
                    data.txt = dom.data('placeholder')._placeholder || data.txt;
                    if (!triggerPlaceHolder.call(this, data)) {
                        dom.value(txt = data.txt);
                        if (fake = dom.data(FAKE_DOM)) { //ie<9
                            dom.hide();
                            fake.show().value(txt);
                        } else if (isPassword) { //ie=9
                            this.setAttribute('type', 'text');
                            dom.data(FAKED, true);
                        }
                        ;
                    }
                    ;
                }
            }

        }

        function forcePlaceHolder(dom, cls, txt, isPassword) {
            var si = makeSimulator(isPassword),
                obj = { cls: cls, txt: txt };

            //(IElte8_PASSWORD = isPassword && IElte8) && dom.data(FAKE_DOM, fakePassword(dom).addClass(cls).val(txt)); //for jQuery
            //dom.bind('focus', obj, si.focus).bind('blur', obj, si.blur); // for jQuery
            (IElte8_PASSWORD = isPassword && IElte8) && (function () {
                var fake = fakePassword(dom);
                fake.addClass(cls);
                fake.value(txt);
                dom.data(FAKE_DOM, fake);
            })(); // for cQuery
            dom.bind('focus', si.focus, { arguments: obj }).bind('blur', si.blur, { arguments: obj }); //for cQuery
        }

        /**
        * @param dom {DOM} the DOM element waiting for initialize placeholder
        * @param options {Object} (optical) options for placeholder
        */
        function PlaceHolder(dom, options) {
            var self = this,
                DEFAULT_OPTIONS = {
                    text: EMPTY,
                    cls: 'placeholder' // class supports browsers that have no native placeholder expando
                },
                txt;

            dom.data('placeholder', self);
            self.dom = dom;
            (txt = options.text) && self.text(txt);
            if (!dom || supportNativePlaceHolder) return this;
            self.options = mix(DEFAULT_OPTIONS, options || {});
            self.initialize(self.options);
            dom.trigger('blur');
        }

        PlaceHolder.prototype = {
            constructor: PlaceHolder,
            initialize: function (options) {
                var dom = this.dom,
                    txt;

                forcePlaceHolder(dom, options.cls, txt || dom.attr('placeholder'), dom.attr('type') == PASSWORD);
            },
            _placeholder: EMPTY,
            /**
            * @setter, @getter for placeholder attribute
            * @param placeholder {String} (optical), placeholder text, no args will be a getter for placeholder
            * @returns {PlaceHolder||String}
            */
            text: function (str) {
                var self = this,
                    str = str && str.toString().trim();

                self._placeholder = str || self.dom.attr('placeholder') || EMPTY;
                return str ? (function (sf) { // setter
                    return sf.dom.attr('placeholder', self._placeholder = str);
                })(self) : (function (sf) { //getter
                    return sf._placeholder; // || sf.dom.attr('placeholder') || EMPTY
                })(self);
            }
        }

        C.fn.placeholder = function (options) {
            return this.data('placeholder') || new PlaceHolder(this, options || {});
        };
        return BizMod.PlaceHolder = PlaceHolder;

    })(cQuery, WINDOW);


    BizMod.Form = {}; // namespace for form package
    /**
    * @module FormField
    * @param wrap {DOM} wrap for all form elements
    */
    ;
    (function (C, WIN, undefined) {

        function Field(options) {
            var self = this,
                NULL = null,
                NOOP = function () {

                },
                DEFAULT_OPTIONS = {
                    dom: NULL,
                    rules: NULL,
                    onCheck: NOOP,
                    required: true,
                    triggerEvent: 'blur'
                };

            self.options = mix(DEFAULT_OPTIONS, options || {});
            self.dom = self.options.dom;
            self.initialize();
        }

        Field.prototype = {
            initialize: function () {
                var self = this,
                    dom = self.dom;

                self.required = self.options.required;
                if (!(dom && dom[0])) return;
                self.__blurHandler = function () {
                    self.check();
                };
                dom.bind(self.options.triggerEvent, self.__blurHandler);
            },
            constructor: Field,
            check: function () {
                var dom = this.dom,
                    val = dom && dom.value() || '',
                    options = this.options,
                    rules = options.rules,
                    result = 1,
                    i = 0,
                    rule,
                    required = this.required,
                    l,
                    isFunction = Util.isFunction;

                !Util.isArray(rules) && (rules = [rules]);
                l = rules.length;
                for (; i < l; i++) {
                    rule = rules[i];
                    if (!required && !val) continue;
                    if (result &= (isFunction(rule) ? rule(val) : rule.test(val))) break;
                }
                ;
                options.onCheck.call(this, !!result, { val: val, dom: dom, rule: --i });
                return result || !required;
            },
            destroy: function () {
                var self = this,
                    dom = self.dom;

                dom && dom.unbind(self.options.triggerEvent, self.__blurHandler);
                return true;
            }
        }
        return BizMod.Form.Field = Field;
    })(cQuery, WINDOW);
    /**
    * @module FormValidator
    * @param wrap {DOM} wrap for all form elements
    */
    ;
    (function (C, WIN, undefined) {

        function Validator(wrap, options) {
            var self = this,
                DEFAULT_OPTIONS = {
                    forceCheckAll: false
                };

            self.options = mix(DEFAULT_OPTIONS, options || {});
            self._fields = [];
            // self.initialize();
        }

        Validator.prototype = {
            constructor: Validator,
            addField: function (field) {
                var self = this;
                self._fields.push(field);
                //return self._fields.length-1;
                return self;
            },
            removeField: function (index) {
                var fields = this._fields;
                index = C.type(index) == 'number' ? index : fields.indexOf(index);

                return (index > -1 && index < fields.length) && (fields.splice(index, 1))[0].destroy();
            },
            check: function () {
                var fields = this._fields,
                    l = fields.length,
                    result = 1,
                    force = this.options.forceCheckAll,
                    i = 0;

                if (l) {
                    for (; i < l; i++) {
                        result &= fields[i].check();
                        if (!result && !force) break;
                    }
                }

                return !!result;
            }
        }

        return BizMod.Form.Validator = Validator;

    })(cQuery, WINDOW);
    /**
    *
    */
    (function (C, WIN, undefined) {
        var NULL = null,
            hideCls = 'hidden',
            doc = WIN.document;

        Mbox.ALERT = 'alert';
        Mbox.PROMPT = 'prompt';
        /**
        * @module Mbox
        * @options
        */
        function Mbox(options) {
            var NOOP = function () {
            },
                DEFAULT_OPTIONS = {
                    wrapClass: 'base_pop',
                    closeBtnClass: 'delete',
                    size: {
                        x: 300
                    },
                    title: '',
                    isModal: true,
                    yesBtnClass: 'yes-btn',
                    noBtnClass: 'no-btn',
                    yesLabel: 'YES',
                    noLabel: 'NO',
                    onOpen: NOOP,
                    onClose: NOOP,
                    onYes: NOOP
                },
                self = this;

            self.options = mix(DEFAULT_OPTIONS, options);
            self._isOpened = false;
            self.type = self.options.type;
            self._buildUI();
            self._bindUI();
        }

        Mbox.prototype = {
            constructor: Mbox,
            open: function (content) {
                content && this.body.html(content);
                this.wrap.removeClass(hideCls);
                this.wrap.mask();
                this._isOpened = true;
                return this;
            },

            _buildUI: function () {
                var self = this,
                    options = self.options,
                    wrapClass = options.wrapClass,
                    closeBtnClass = options.closeBtnClass,
                    noBtnClass = options.noBtnClass,
                    yesBtnClass = options.yesBtnClass,
                    noBtn,
                    width = options.size.x,
                    wrap,
                    html = '<div style="' + (width ? ('width: ' + width + 'px') : '') + ';" class="' + wrapClass + '">' +
                        '<div class="pop_hd"><h3>' + options.title + '</h3><a class="' + closeBtnClass + '" href="javascript:">×</a></div>' +
                        '<div class="pop_bd">' +
                        (options.content || '') +
                        '</div>' +
                        '<div class="pop_ft">' +
                        '<input type="button" value="' + options.yesLabel + '" class="' + yesBtnClass + '"/>' +
                        (self.type === Mbox.ALERT ? '' : '<input type="button" value="' + options.noLabel + '" class="' + noBtnClass + '"/>') +
                        '</div>' +
                        '</div>';

                self.wrap = wrap = C(htmlToDom(html));
                self.title = wrap.find('h3');
                self.closeBtn = wrap.find('.' + closeBtnClass);
                noBtn = wrap.find('.' + noBtnClass);
                self.noBtn = noBtn.length ? noBtn : NULL;
                self.yesBtn = wrap.find('.' + yesBtnClass);
                self.body = wrap.find('.pop_bd');

                wrap.css('position', 'absolute');
                doc.body.appendChild(wrap[0]);
            },
            _bindUI: function () {
                var self = this,
                    options = self.options;

                self.__closeHandler = function (e) {
                    self.close();
                    options.onClose.call(self, e.target);
                }
                self.__yesHandler = function () {
                    self.close();
                    options.onYes.call(self);
                }
                self.closeBtn && self.closeBtn.bind('click', self.__closeHandler);
                self.noBtn && self.noBtn.bind('click', self.__closeHandler);
                self.yesBtn && self.yesBtn.bind('click', self.__yesHandler);
            },
            close: function () {
                var self = this,
                    wrap = self.wrap;

                self.closeBtn.unbind('click', self.__closeHandler);
                self.noBtn && self.noBtn.unbind('click', self.__closeHandler);
                self.yesBtn && self.yesBtn.unbind('click', self.__yesHandler);
                wrap.addClass(hideCls).unmask();
                wrap.remove();
                wrap = self.wrap = self.noBtn = self.yesBtn = self.closeBtn = self.title = self.body = self.__closeHandler = self.options = NULL;

                self._isOpened = false;
                return NULL;
            }
        };
        /**
        * @param {String} content
        * @param {String} [title]
        * @param {Object} [size]
        * @return {Mbox}
        */
        Mbox.open = function (content, title, size, config) {
            config = config || {};
            config.title = title || '';
            config.content = content;

            if (size) config.size = size;
            return new Mbox(config).open();
        }
        /**
        * @desc alert box
        * @param {String} content
        * @param {uint} [autoClose] milliseconds of delay
        * @param {Object} [config] configure for mbox
        */
        Mbox.alert = function (content, autoClose, config) {
            config = config || {};
            config.content = content;
            config.type = Mbox.ALERT;
            config.onYes = function () {
                clearTimeout(timer);
            };

            var mbox = new Mbox(config),
                timer;

            autoClose > 0 && (timer = setTimeout(function () {
                mbox.close();
            }, autoClose));
            return mbox.open();
        }
        /**
        * @desc prompt box
        * @param {String} msg
        * @param {Function} onYes
        * @param {Object} configure for Mbox
        */
        Mbox.prompt = function (content, onYes, config) {
            config = config || {};
            config.content = content;
            config.type = Mbox.PROMPT;
            onYes && (config.onYes = onYes);
            return new Mbox(config).open();
        }
        return BizMod.Mbox = Mbox;
    })(cQuery, WINDOW);
    /**
    * float module for cQuery
    * this module just supports floating to top
    * @TODO: to support float to bottom
    * @module
    *
    */
    (function (C, WIN, undefined) {
        var NOOP = function () { },
            WIN = window,
            DOC = WIN.document,
            isIE6 = C.browser.isIE6;

        /**
        *
        * @param options
        * <code>
        *     {
        *         container: CDOM ,
        *         startPos: int (optical),
        *         offsetTop: int (optical),
        *         onScroll: Function (optical)
        *     }
        * </code>
        * @constructor
        */
        function Float(options) {
            var opts = options,
                self = this,
                container = opts.container;

            this.container = container;
            this._onScroll = opts.onScroll || NOOP;
            this._startPos = opts.startPos || 0;
            this.setEnd(opts.endPos || -1e7);
            this._offsetTop = opts.offsetTop || 0;
            this._originPos = parseInt(container.css('top')) || this._startPos || 0;
            this._originPosType = container.css('position') || ''; // if position set to 'static', ie6 will automaticly scroll by left++
            this._bindEvents();
            this.options = opts;

            this._step = isIE6 ? function (offsetTop) {
                container.css({ 'top': offsetTop + self._offsetTop + 'px', 'position': 'absolute' });
                container.removeClass("sta_fixed");
            } : function () {
                container.css({
                    'position': 'fixed',
                    'top': self._offsetTop + 'px'
                });
                container.addClass("sta_fixed");
            }
        }

        Float.prototype = {
            constructor: Float,
            play: function () {
                this._isScrolling = true;
                return this;
            },
            /**
             * 动态设置底部结束浮动的距离
             * @param {int} end 底部距离数
             */
            setEnd: function(end){
                this._endPos = end + this.container.offset().height;
				//this._isPaused = false;
            },
            stop: function () {
                this.reset();
                this._isScrolling = false;
                return this;
            },
            reset: function (top) {
                var originPosType = this._originPosType.toLowerCase();

                this._isPaused = true;
                this.container.css({
                    'position': top ? 'absolute' : originPosType,
                    'top': top+"px" || 'auto'
                });
            },
            _bindEvents: function () {
                var self = this;

                self._scrollHandler = function () {
                    self._isScrolling && self._scroll();
                }
                C(WIN).bind('scroll', self._scrollHandler);
            },
            _scroll: function () {
                var offsetTop = DOC.documentElement.scrollTop || DOC.body.scrollTop,
                    offsetTopMax = DOC.body.scrollHeight - this._endPos,
                    self = this,
                    isBottomMax = offsetTop >= offsetTopMax;
                
                self._offsetTopMax = offsetTopMax;
                if (offsetTop > self._startPos && !isBottomMax) {
                    self._isPaused = false;
                    self._step(offsetTop);
                    self._onScroll.call(self, offsetTop);
                } else {
                    self.reset(isBottomMax ? offsetTopMax : 0);
                }

            }
        }
        C.fn.float = function (startPos, endPos, offsetTop, onScroll) {
            return new Float({
                container: this,
                startPos: startPos || this.offset().top,
                endPos: endPos,
                offsetTop: offsetTop,
                onScroll: onScroll
            }).play();
        }

        return BizMod.Float = Float;
    })(cQuery, window);

    cQuery.BizMod = BizMod;
})(cQuery, window);

/**
* change logs
* 2013-01-23 by xuwei.chen
* - Fix 'check' in Field, breaking in wrong condtion
* 2013-01-24 by xuwei.chen
* - adding 'isFixed' option to Suggest, to support always-visible suggest
* 2013-02-04 by xuwei.chen
* - Field.check, if(dom) -> if(dom && dom.length)
* 2013-05-20 by xuwei.chen
* - support Float to configure 'endPos'
* 2014-03-27 by xuwei.chen
* - add 'setEnd'
*/

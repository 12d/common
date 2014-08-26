/**
 * Created by li.xx on 14-8-26.
 */
(function($) {
define([], function() {
    var CityId, Province, EMPTY_CITY = { id: '', name: '' };

    function CityList(options) {
        var defaultOpt = {
            SourceUrl: 'http://hotels.ctrip.com/Domestic/hotelsignup/tool/AjaxCityMask.aspx',
            FilterUrl: 'http://hotels.ctrip.com/Domestic/hotelsignup/tool/AjaxQueryCity.aspx',
            suggestionTpl: '<div class="city_select_lhsl"><a class="close" href="javascript:;">×</a><p class="title">支持中文/拼音/简拼输入</p><ul class="tab_box">{{enum(key) data}}<li><b></b><span>${key}</span></li>{{/enum}}</ul>{{enum(key,arr) data}}<div class="city_item city_item_list">{{each arr}}<a href="javascript:void(0);" data="${data}">${display}</a>{{/each}}</div>{{/enum}}</div>',
            filterTpl: '{{if $data.hasResult }}    <div class="keyword_prompting_lhsl city_suggestion_pop">        <p class="title"><a class="close CQ_suggestionClose" href="javascript:;">×</a><span class="text_input">${$data.val}，</span>若需缩小范围，请输入更多条件。</p>        <div class="sug_item">            {{each (i,item) list}}                <a href="javascript:;" data="${item.data}" ><span class="city" title="${right}，${data.split("|")[4]}">${right.replace(val, "<b>"+val+"</b>")}，${data.split("|")[4].replace(val, "<b>"+val+"</b>")}</span></a>            {{/each}}        </div>        {{if page.max>-1}}        <div class="c_page_mini" style="display: block;">            {{if page.current>0}}            <a href="javascript:void(0);" page="${page.current-1}">&lt;-</a>            {{/if}}            {{if page.current<2}}            {{loop(index) Math.min(5,page.max+1)}}            <a href="javascript:void(0);"{{if page.current==index}} class="address_current"{{/if}} page="${index}">${index+1}</a>            {{/loop}}            {{else page.current>page.max-2}}            {{loop(index) Math.max(0,page.max-4),page.max+1}}            <a href="javascript:void(0);"{{if page.current==index}} class="address_current"{{/if}} page="${index}">${index+1}</a>            {{/loop}}            {{else}}            {{loop(index) Math.max(0,page.current-2),Math.min(page.current+3,page.max+1)}}            <a href="javascript:void(0);"{{if page.current==index}} class="address_current"{{/if}} page="${index}">${index+1}</a>            {{/loop}}            {{/if}}            {{if page.current<page.max}}            <a href="javascript:void(0);" page="${page.current+1}">-&gt;</a>            {{/if}}        </div>        {{/if}}    </div>{{else}}    <div class="keyword_prompting_lhsl notfound_pop">        <p class="title"><a class="close CQ_suggestionClose" href="javascript:;">×</a>对不起，找不到：${$data.val}</p>    </div>{{/if}}',
            city: $('#J_city')
        };

        this.opt = $.extend(defaultOpt, options);
        this.SourceUrl = this.opt.SourceUrl;
        this.FilterUrl = this.opt.FilterUrl;
        this.suggestionTpl = this.opt.suggestionTpl;
        this.filterTpl = this.opt.filterTpl;
        this.city = this.opt.city;
        this.initCity();
    }

    CityList.prototype = {
        constructor: CityList,
        CitySelector: '',
        CitySuggest: '',
        updateCityDom: function($city) {
            this.city = $($city);
            this.initCity();
        },
        initCity: function() {
            $.mod.load('address', '1.0', function() {});
            var city = this.city, self = this;

            if (!city || !city.length) {return false;}
            this.CitySuggest = city.regMod('address', '1.0', {
                name: 'J_city',
                jsonpSource: this.SourceUrl,
                jsonpFilter: this.FilterUrl + "?keyword=${key}",
                isAutoCorrect: true,
                delay: 500,
                sort: ['^0$', '^1$', '0+'],
                template: {
                    suggestion: this.suggestionTpl,
                    filter: this.filterTpl,
                    filterPageSize: 7,
                    filterInit: function (filterpanel) {
                        filterpanel.find('.close').bind('mousedown', function () {
                            city.value('');
                            city[0].blur();
                        });
                    },
                    suggestionInit: function (suggestPanel) {
                        defaultSuggestInit(suggestPanel);
                        suggestPanel.find('.close').bind('mousedown', function () {
                            city[0].blur();
                        });
                    } .bind(this)
                }
            });

            this.CitySuggest.method('bind', 'change', function (mod, data) {
                data = data.items || EMPTY_CITY;
                self.select(data[2] || data.id, data[1] || data.name, data[3]);
            });

            self._lastCityData = EMPTY_CITY;
        },
        getCity: function () {
            return this._lastCityData;
        },
        reset: function () {
            this._lastCityData = EMPTY_CITY;
        },
        validate: function () {
            return this._lastCityData.id;
        },
        select: function (id, name, pid) {
            // var onChange = options.onChange;
            //always set city name;
            this.city.value(name);
            //no change, reload page or specified value by .net
            if (id === CityId) {return this;}
            CityId = id;
            Province = pid;
            //if id is null, clear selected city
            if (!id) {id = this._lastCityData.id;}
            this._lastCityData = { id: id, name: name, pid: pid };
            //trigger change event
            // onChange && onChange.call(this, id, name);
        },
        getContainer: function () {
            return $("#address_suggestionContainer_" + this.CitySuggest.uid);
        }
    };

    function defaultSuggestInit(obj) {
        //must be opti
        var spans = obj.find('.tab_box li');
        var uls = obj.find('div.city_item_list');
        if (!spans.length) {
            return;
        }

        function switchTab() {
            var _this = this;
            spans.each(function (span, i) {
                if (span[0] == _this) {
                    span.addClass('hot_selected');
                    uls[i].style.display = '';
                } else {
                    span.removeClass('hot_selected');
                    uls[i].style.display = 'none';
                }
            });
        }

        var w = 30;
        for (var i = 0, n = spans.length; i < n; i++) {
            w += spans[i].offsetWidth;
        }

        var t = obj.find('div').first();
        if (t[0]) {
            if (w > 278) {
                t.css('width', '378px');
            }
        }

        spans.bind('mousedown', switchTab);
        switchTab.apply(spans[0]);
    }

    return CityList;
});
})(cQuery);

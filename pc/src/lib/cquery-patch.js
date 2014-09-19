/**
 * @author: xuweichen
 * @date: 2014/9/19 10:38
 * @description 对cQuery库的一个API扩展，以及API的补丁
 * @warn 写的时候一定要考虑是会影响到框架自身，禁止重载框架方法，给fn添加方法前一定要判断，比如 !$.fn.show && ($.fn.show=...)
 */

 //静态方法
 (function ($, undefined){

})(cQuery);

//动态方法
 (function ($, fn, undefined){
    methods =  {};
    methods.show = function (option) {
        this.each(function (item) {
            item.css('display', option || '');
        });
    };
    methods.hide = function () {
        this.each(function (item) {
            item.css('display', 'none');
        });
    };
    
    (function exportDynamicMethods (methods) {
        var name;
        for (name in methods) if (methods.hasOwnProperty(name)) {
            fn[name] === undefined && (fn[name] = methods[name]);
        }
    } (methods));
})(cQuery, cQuery.fn);


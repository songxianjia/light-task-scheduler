/**
 * 这里封装一些公共的JS
 * @author Robert HG (254963746@qq.com)
 */

/**
 * @type {{}}
 */
var LTS = {
    colFormatter: {},
    ReExp: {
        time: /^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/         // yyyy-MM-dd HH:mm:ss

    }
};

/**
 * 将JSON对象转为字符串
 */
LTS.colFormatter.stringifyJSON = function (obj) {
    return obj ? JSON.stringify(obj) : obj;
};

LTS.colFormatter.needFeedbackLabel = function (obj) {
    return obj ? "需要" : "不需要";
};

template.helper('dateFormat', function (date, format) {
    return DateUtil.format(date, format);
});

template.helper('format', function (obj, colFormatter, row) {
    var formatterFn = LTS.colFormatter[colFormatter];
    return formatterFn ? formatterFn(obj, row) : obj;
});

/**
 * 封装的分页表格
 */
function LtsTable(options) {
    this.cachedParams = {};

    //var defaultOpts = {
    //    url: '',
    //    templateId: '',
    //    pageSize: 10,
    //    container: null
    //};

    this.container = options.container;
    this.pageSize = options.pageSize || 10;
    this.templateId = options.templateId;
    this.url = options.url;

    var _this = this;

    _this.renderEmpty = function(){
        _this.render({}, 0, {}, 1);
    };

    _this.render = function (rows, results, params, curPage) {
        var html = template(_this.templateId, {rows: rows, results: results, pageSize: _this.pageSize});
        _this.container.html(html);
        _this.container.children('table').footable();

        if (results == 0) results = 1;
        _this.container.find(".pagination-sm").twbsPagination({
            totalPages: (results % _this.pageSize == 0) ? results / _this.pageSize : results / _this.pageSize + 1,
            visiblePages: 7,
            startPage: curPage,
            first: '«',
            prev: '‹',
            next: '›',
            last: '»',
            onPageClick: function (event, page) {
                _this.post(_this.cachedParams, page);
            }
        });
    };

    _this.post = function (params, curPage) {
        params['start'] = (curPage - 1) * _this.pageSize;
        params['limit'] = _this.pageSize;
        _this.showLoading();
        $.ajax({
            url: _this.url,
            type: 'GET',
            dataType: 'json',
            data: params,
            success: function (json) {
                if (json && json.success) {
                    _this.cachedParams = params;
                    var results = json['results'];
                    var rows = json['rows'];
                    _this.render(rows, results, params, curPage);
                } else {
                    if (json) {
                        swal(json['msg']);
                    }
                }
            },
            complete: function () {
                _this.hideLoading();
            }
        });
    };

    _this.showLoading = function () {
        var loading = '<div id="loading" style="width:50px;position:absolute;left: -100px;"><img src="assets/img/loading.gif" style="width:30px;"/></div>';
        var offset = _this.container.offset();
        var left = _this.container.width() / 2 + offset.left;
        if ($("#loading").length == 0) {
            $('body').append(loading);
        }
        $("#loading").offset({top: offset.top + _this.container.height() / 2, left: left});
    };

    _this.hideLoading = function () {
        $("#loading").offset({
            left: -100
        });
    };
}

jQuery.fn.extend({
    ltsTable: function (options) {
        var container = $(this);
        var opts = {};
        $.extend(opts, options, {container: container});
        return new LtsTable(opts);
    }
});
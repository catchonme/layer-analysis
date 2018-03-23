;!function(window, undefined) {
  "use strict";

  var $, win, ready = {
    btn: ['&#x786E;&#x5B9A;', '&#x53D6;&#x6D88;'] // ['确认','取消']的unicode编码
  };

  var layer = {
    index: (window.layer) ? 100000 : 0,

    alert:function(content, options, yes) {
      var type = typeof options === 'function';
      if (type) {
        yes = options;
      }
      return layer.open($.extend({
        content:content,
        yes:yes
      }, type ? {} : options));
    }

  };

  var Class = function(settings) {
    var that = this;
    that.index = ++ layer.index;
    that.config = $.extend({}, that.config, settings);
    document.body ? that.creat() : setTimeout(function() {
      that.creat();
    }, 30);
  };

  Class.pt = Class.prototype;

  Class.pt.config = {
    title: '&#x4FE1;&#x606F;', // '信息'的unicode编码
    time:0,
    zIndex:19891014,
    icon:-1
  }

  Class.pt.vessel = function(callback) {
    var that = this, times = that.index, config = that.config;
    var zIndex = config.zIndex + times;
    config.zIndex = zIndex;

    var html =
      //遮罩
      '<div class="layui-layer-shade" id="layui-layer-shade'+times+'" style="z-index:'+(zIndex - 1)+'; background-color:#000; opacity:0.3;"></div>'
      // 主体
      + '<div class="layui-layer layui-layer-dialog layer-anim" id="layui-layer'+times+'" style="z-index:'+zIndex+'">'
      +   '<div class="layui-layer-title">'+config.title+'</div>'
      +   '<div class="layui-layer-content layui-layer-padding">'
      +     '<i class="layui-layer-ico layui-layer-ico'+config.icon+'"></i>'
      +       config.content
      +   '</div>'
      +   '<span class="layui-layer-setwin">'
      +      '<a class="layui-layer-ico layui-layer-close layui-layer-close1" href="javascript:;"></a>'
      +   '</span>'
      +   '<div class="layui-layer-btn">'
      +     '<a class="layui-layer-btn0">'+[config.btn]+'</a>'
      +   '</div>'
      + '</div>';

    callback(html);
    return that;
  };

  Class.pt.creat = function() {
    var that = this
      ,config = that.config
      ,times = that.index
      ,body = $('body');

    // 确认右下角有几个button
    config.btn = ('btn' in config) ? config.btn : ready.btn[0];

    that.vessel(function(html){
      body.append(html);
      that.layero = $('#layui-layer' + times);
    });

    that.offset();
    win.on('resize', function(){
      that.offset();
    });

    that.move().callback();
  };

  Class.pt.offset = function() {
    var that = this, layero = that.layero;
    var area = [layero.outerWidth(), layero.outerHeight()];
    that.offsetTop = (win.height() - area[1])/2;
    that.offsetLeft = (win.width() - area[0])/2
    layero.css({top:that.offsetTop, left:that.offsetLeft});
  };

  Class.pt.move = function() {
    var that = this
      ,config = that.config
      ,doc = $(document)
      ,layero = that.layero
      ,moveElem = layero.find('.layui-layer-title')
      ,dict = {};

    moveElem.css('cursor','move');

    moveElem.on('mousedown', function(e){
      e.preventDefault();
      dict.moveStart = true;
      dict.offset = [
        e.clientX - parseFloat(layero.css('left')),
        e.clientY - parseFloat(layero.css('top'))
      ];
    });

    doc.on('mousemove', function(e) {
      if (dict.moveStart) {
        e.preventDefault();

        var X = e.clientX - dict.offset[0],
          Y = e.clientY - dict.offset[1];

        dict.stX = win.scrollLeft();
        dict.stY = win.scrollTop();

        if (!config.moveOut) {
          var setRig = win.width() - layero.outerWidth() + dict.stX,
            setBot = win.height() - layero.outerHeight() + dict.stY;
          X < dict.stX && (X = dict.stX);
          X > setRig && (X = setRig);
          Y < dict.stY && (Y = dict.stY);
          Y > setBot && (Y = setBot);
        }

        layero.css({
          left:X,
          top:Y
        })
      }
    }).on('mouseup', function(e) {
      if (dict.moveStart) {
        delete dict.moveStart;
      }
      if (dict.resizeStart) {
        delete dict.resizeStart;
      }
    });

    return that;
  };

  // 给确定/右上角绑定关闭事件
  Class.pt.callback = function(){
    var that = this, layero = that.layero, config = that.config;

    layero.find('.layui-layer-btn').children('a').on('click', function() {
      layer.close(that.index);
      if (config.yes) {
        config.yes();
      }
    });

    layero.find('.layui-layer-close').on('click', function(){
      layer.close(that.index)
    });
  };

  // 关闭当前弹窗
  layer.close = function(index) {
    var layero = $('#layui-layer'+index);
    if(!layero[0]) return;

    $(".layui-layer").remove();

    $('.layui-layer-move, #layui-layer-shade'+index).remove();
  };

  ready.run = function(_$) {
    $ = _$;
    win = $(window);
    layer.open = function(deliver) {
      var o = new Class(deliver);
      return o.index;
    };
  };

  ready.run(window.jQuery);

  window.layer = layer;
}(window)
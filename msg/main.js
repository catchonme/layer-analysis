;!function(window, undefined) {
  "use strict";

  var $, win;

  var layer = {
    index: (window.layer) ? 100000 : 0,
    btn: ['&#x786E;&#x5B9A;', '&#x53D6;&#x6D88;'], // ['确认','取消']的unicode编码

    alert:function(content, options, yes) {
      var type = typeof options === 'function';
      if (type) {
        yes = options;
        options = {};
      }
      return layer.open($.extend({
        content:content,
        yes: yes,
        btn:this.btn[0]
      }, options));
    },

    confirm: function(content, options, yes, cancel) {
      var type = typeof options === 'function';
      if (type) {
        cancel = yes;
        yes = options;
        options = {};
      }
      return layer.open($.extend({
        content:content,
        yes:yes,
        cancel:cancel,
        btn:this.btn
      }, options));
    },

    msg: function(content, options, yes) {
      var type = typeof options === 'function';
      if (type) {
        yes = options;
        options = {};
      }
      return layer.open($.extend({
        content:content,
        yes:yes,
        btn:false,
        title:false, // msg样式的弹出，取消title
        closeBtn:false, // 右上角的关闭
        time:3000 // 3000ms后自动关闭弹窗
      }, options))
    },
  };

  var Class = function(settings) {
    var that = this;
    that.index = ++ layer.index;
    that.config = $.extend({}, that.config, settings);
    document.body ? that.create() : setTimeout(function() {
      that.create();
    }, 30);
  };

  Class.pt = Class.prototype;

  Class.pt.config = {
    title: '&#x4FE1;&#x606F;', //'信息'的unicode编码
    zIndex:19891014,
    icon:-1,
    closeBtn:true, // msg 没有确定/取消按钮
    time:0, // 弹出框多久自动关闭，0代表不自动关闭
  }

  // 这里就是 UI
  Class.pt.buildUI = function() {
    var that = this, times = that.index, config = that.config;
    var zIndex = config.zIndex + times;
    config.zIndex = zIndex;

    var titleHTML = '';
    if (config.title) {
      titleHTML = '<div class="layui-layer-title">'+config.title+'</div>';
    }

    var closeX = "";
    if (config.closeBtn) {
      closeX ='<a class="layui-layer-ico layui-layer-close layui-layer-close1" href="javascript:;"></a>'
    }

    // alert只有一个[确定]按钮，confirm有两个按钮[确定, 取消]， msg没有按钮
    var buttonHTML = '';
    if (typeof (config.btn) == 'object') {
      buttonHTML += '<div class="layui-layer-btn">';
      for (var i=0, len=config.btn.length; i<len; i++) {
        buttonHTML += '<a class="layui-layer-btn'+i+'">'+config.btn[i]+'</a>'
      }
      buttonHTML += '</div>';
    }

    var html =
      //遮罩
      '<div class="layui-layer-shade" id="layui-layer-shade'+times+'" style="z-index:'+(zIndex-1)+'; background-color:#000; opacity:0.3;"></div>'
      // 主体
      + '<div class="layui-layer layui-layer-dialog layer-anim" id="layui-layer'+times+'" style="z-index:'+zIndex+'">'
      +   titleHTML
      +   '<div class="layui-layer-content layui-layer-padding">'
      +     '<i class="layui-layer-ico layui-layer-ico'+config.icon+'"></i>'
      +       config.content
      +    '</div>'
      +   '<span class="layui-layer-setwin">'
      +      closeX
      +   '</span>'
      +   buttonHTML
      + '</div>'

    $('body').append(html);
    that.layero = $('#layui-layer'+times);
    return that;
  };

  Class.pt.create = function() {
    var that = this;

    that.buildUI();

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
      ,doc = $(document)
      ,layero = that.layero
      ,moveElem = layero.find('.layui-layer-title')
      ,dict = {};

    moveElem.css('cursor','move');

    moveElem.on('mousedown', function(e){
      e.preventDefault();
      dict.moveStart = true;
      // 鼠标按下的位置距离弹出栏的最左端/最右端的距离
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

        var minLeft = win.scrollLeft(),
            minTop = win.scrollTop();

        // 保持弹出栏在窗口内
        var maxLeft = win.width() - layero.outerWidth() + win.scrollLeft(),
            maxTop = win.height() - layero.outerHeight() + win.scrollTop();

        X < minLeft && (X = minLeft);
        X > maxLeft && (X = maxLeft);
        Y < minTop && (Y = minTop);
        Y > maxTop && (Y = maxTop);

        layero.css({
          left:X,
          top:Y
        })
      }
    }).on('mouseup', function(e) {
      if (dict.moveStart) {
        delete dict.moveStart;
      }
    });
    return that;
  };

  // 给确定/右上角的'X'绑定关闭事件
  Class.pt.callback = function(){
    var that = this, layero = that.layero, config = that.config;

    // 是否设定自动关闭弹窗时间
    if (config.time && config.time > 0) {
      setTimeout(function(){
        layer.close(that.index);
        if (config.yes) {
          config.yes();
        }
      }, config.time);
    } else {
      layero.find('.layui-layer-btn').children('a').on('click', function(event) {
        layer.close(that.index);

        if (event.target.className == 'layui-layer-btn0') {
          if (config.yes) {
            config.yes();
          }
        } else if (event.target.className == 'layui-layer-btn1') {
          if (config.cancel) {
            config.cancel();
          }
        }
      });

      layero.find('.layui-layer-close').on('click', function(){
        layer.close(that.index)
      });
    }

  };

  // 关闭当前弹窗
  layer.close = function(index) {
    var layero = $('#layui-layer'+index);
    if(!layero[0]) return;

    $('.layui-layer, #layui-layer-shade'+index).remove();
  };

  layer.run = function(_$) {
    $ = _$;
    win = $(window);
    layer.open = function(params) {
      var box = new Class(params);
      return box.index;
    };
  };

  layer.run(window.jQuery);

  window.layer = layer;
}(window)
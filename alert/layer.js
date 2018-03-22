;!function(window, undefined){
  "use strict";

  var $, win, ready = {
    config: {},
    btn: ['&#x786E;&#x5B9A;', '&#x53D6;&#x6D88;'],
    //五种原始层模式
    type: ['dialog']
  };

//默认内置方法。
  var layer = {
    index: (window.layer) ? 100000 : 0,
    //各种快捷引用
    alert: function(content, options){
      return layer.open($.extend({
        content: content,
      }, options));
    },
  };

  var Class = function(setings){
    var that = this;
    that.index = ++layer.index;
    that.config = $.extend({}, that.config, ready.config, setings);
    document.body ? that.creat() : setTimeout(function(){
      that.creat();
    }, 30);
  };

  Class.pt = Class.prototype;

//缓存常用字符
  var doms = [];
  doms.anim = ['layer-anim'];

//默认配置
  Class.pt.config = {
    type: 0,
    shade: 0.3,
    fixed: true,
    move: '.layui-layer-title',
    title: '&#x4FE1;&#x606F;',
    offset: 'auto',
    area: 'auto',
    closeBtn: 1,
    time: 0, //0表示不自动关闭
    zIndex: 19891014,
    anim: 0,
    isOutAnim: true,
    icon: -1,
  };

//容器
  Class.pt.vessel = function(conType, callback){
    var that = this, times = that.index, config = that.config;
    var zIndex = config.zIndex + times
    var titleHTML = '<div class="layui-layer-title">' + config.title + '</div>';
    config.zIndex = zIndex;

    callback([
      //遮罩
      config.shade ? ('<div class="layui-layer-shade" id="layui-layer-shade'+ times +'" times="'+ times +'" style="'+ ('z-index:'+ (zIndex-1) +'; background-color:'+ (config.shade[1]||'#000') +'; opacity:'+ (config.shade[0]||config.shade) +'; filter:alpha(opacity='+ (config.shade[0]*100||config.shade*100) +');') +'"></div>') : '',

      //主体
      '<div class="'+ 'layui-layer layui-layer-dialog'  + ' ' +'" id="'+ 'layui-layer' + times +'" type="dialog" times="'+ times +'" showtime="'+ config.time +'" conType="'+ (conType ? 'object' : 'string') +'" style="z-index: '+ zIndex +'; width:'+ config.area[0] + ';height:' + config.area[1] + (config.fixed ? '' : ';position:absolute;') +'">'
      + titleHTML
      + '<div class="layui-layer-content layui-layer-padding">'
      + '<i class="layui-layer-ico layui-layer-ico'+ config.icon +'"></i>'
      + config.content
      + '</div>'
      + '<span class="layui-layer-setwin">'
      + '<a class="layui-layer-ico layui-layer-close layui-layer-close1" href="javascript:;"></a>'
      + '</span>'
      + '<div class="layui-layer-btn">'
      +   '<a class="layui-layer-btn0">'+ [config.btn] +'</a>'
      + '</div>'
      + '</div>'
    ], titleHTML, $('<div class="layui-layer-move"></div>'));
    return that;
  };

//创建骨架
  Class.pt.creat = function(){
    var that = this
      ,config = that.config
      ,times = that.index
      ,content = config.content
      ,conType = typeof content === 'object'
      ,body = $('body');

    config.btn = ('btn' in config) ? config.btn : ready.btn[0];

    //建立容器
    that.vessel(conType, function(html, titleHTML, moveElem){
      body.append(html[0]);
      body.append(html[1]);
      $('.layui-layer-move')[0] || body.append(ready.moveElem = moveElem);
      that.layero = $('#layui-layer' + times);
    }).auto(times);

    //坐标自适应浏览器窗口尺寸
    that.offset()
    if(config.fixed){
      win.on('resize', function(){
        that.offset();
        (/^\d+%$/.test(config.area[0]) || /^\d+%$/.test(config.area[1])) && that.auto(times);
      });
    }

    config.time <= 0 || setTimeout(function(){
      layer.close(that.index)
    }, config.time);
    that.move().callback();

    //为兼容jQuery3.0的css动画影响元素尺寸计算
    if(doms.anim[config.anim]){
      that.layero.addClass(doms.anim[config.anim]);
    };

    //记录关闭动画
    if(config.isOutAnim){
      that.layero.data('isOutAnim', true);
    }
  };

//自适应
  Class.pt.auto = function(index){
    var that = this, config = that.config, layero = $('#layui-layer' + index);
    if(config.area[0] === '' && config.maxWidth > 0){
      layero.outerWidth() > config.maxWidth && layero.width(config.maxWidth);
    }
    return that;
  };

//计算坐标
  Class.pt.offset = function(){
    var that = this, layero = that.layero;
    var area = [layero.outerWidth(), layero.outerHeight()];
    that.offsetTop = (win.height() - area[1])/2;
    that.offsetLeft = (win.width() - area[0])/2;
    layero.css({top: that.offsetTop, left: that.offsetLeft});
  };

//拖拽层
  Class.pt.move = function(){
    var that = this
      ,config = that.config
      ,_DOC = $(document)
      ,layero = that.layero
      ,moveElem = layero.find(config.move)
      ,dict = {};

    if(config.move){
      moveElem.css('cursor', 'move');
    }

    moveElem.on('mousedown', function(e){
      e.preventDefault();
      if(config.move){
        dict.moveStart = true;
        dict.offset = [
          e.clientX - parseFloat(layero.css('left'))
          ,e.clientY - parseFloat(layero.css('top'))
        ];
        ready.moveElem.css('cursor', 'move').show();
      }
    });

    _DOC.on('mousemove', function(e){

      //拖拽移动
      if(dict.moveStart){
        var X = e.clientX - dict.offset[0]
          ,Y = e.clientY - dict.offset[1]
          ,fixed = layero.css('position') === 'fixed';

        e.preventDefault();

        dict.stX = fixed ? 0 : win.scrollLeft();
        dict.stY = fixed ? 0 : win.scrollTop();

        //控制元素不被拖出窗口外
        if(!config.moveOut){
          var setRig = win.width() - layero.outerWidth() + dict.stX
            ,setBot = win.height() - layero.outerHeight() + dict.stY;
          X < dict.stX && (X = dict.stX);
          X > setRig && (X = setRig);
          Y < dict.stY && (Y = dict.stY);
          Y > setBot && (Y = setBot);
        }

        layero.css({
          left: X
          ,top: Y
        });
      }

    }).on('mouseup', function(e){
      if(dict.moveStart){
        delete dict.moveStart;
        ready.moveElem.hide();
      }
      if(dict.resizeStart){
        delete dict.resizeStart;
        ready.moveElem.hide();
      }
    });

    return that;
  };

  Class.pt.callback = function(){
    var that = this, layero = that.layero;

    //按钮
    layero.find('.layui-layer-btn').children('a').on('click', function(){
      layer.close(that.index);
    });

    //右上角关闭回调
    layero.find('.layui-layer-close').on('click', function(){
      layer.close(that.index);
    });
  };

  /** 内置成员 */
  window.layer = layer;

  //关闭layer
  layer.close = function(index){
    var layero = $('#layui-layer'+ index), closeAnim = 'layer-anim-close';
    if(!layero[0]) return;

    if(layero.data('isOutAnim')){
      layero.addClass(closeAnim);
    }

    $('#layui-layer-moves, #layui-layer-shade' + index).remove();
  };

//主入口
  ready.run = function(_$){
    $ = _$;
    win = $(window);
    doms.html = $('html');
    layer.open = function(deliver){
      var o = new Class(deliver);
      return o.index;
    };
  };

  // 运行的入口
  ready.run(window.jQuery);

}(window);

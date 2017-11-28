/**

 @Name：layer v3.0.3 Web弹层组件
 @Author：贤心
 @Site：http://layer.layui.com
 @License：MIT
    
 */

;!function(window, undefined){
"use strict";

var isLayui = window.layui && layui.define,
    $,
    win,
    ready = {
      // 这个是从内部最后的一个的 js 文件，拿到文件名前面的路径
      getPath: function(){
        var js = document.scripts, script = js[js.length - 1], jsPath = script.src;
        if(script.getAttribute('merge')) return;
        return jsPath.substring(0, jsPath.lastIndexOf("/") + 1);
      }(),

      config: {}, end: {}, minIndex: 0, minLeft: [],
      btn: ['&#x786E;&#x5B9A;', '&#x53D6;&#x6D88;'], // [确定,取消] 的 unicode 符

      //五种原始层模式
      type: ['dialog', 'page', 'iframe', 'loading', 'tips']
    };

//默认内置方法, 从 window.layer 暴露初始的接口后，这里是最初的入口
// layer 是个对象，所有的方法都是内部的属性
var layer = {
  v: '3.0.3',
  ie: function(){ //ie版本
    var agent = navigator.userAgent.toLowerCase();
    return (!!window.ActiveXObject || "ActiveXObject" in window) ? (
      (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由于ie11并没有msie的标识
    ) : false;
  }(),
  index: (window.layer && window.layer.v) ? 100000 : 0,
  path: ready.getPath,
  config: function(options, fn){
    options = options || {};
    layer.cache = ready.config = $.extend({}, ready.config, options);
    layer.path = ready.config.path || layer.path;
    typeof options.extend === 'string' && (options.extend = [options.extend]);
    
    if(ready.config.path) layer.ready();
    
    if(!options.extend) return this;
    
    isLayui // layer 是否在window的属性中，如果不在，就添加进来
      ? layui.addcss('modules/layer/' + options.extend)
    : layer.link('skin/' + options.extend);
    
    return this;
  },
  
  //载入CSS配件
  link: function(href, fn, cssname){
    
    //未设置路径，则不主动加载css
    if(!layer.path) return;
    
    var head = $('head')[0], link = document.createElement('link');
    if(typeof fn === 'string') cssname = fn;
    var app = (cssname || href).replace(/\.|\//g, '');
    var id = 'layuicss-'+app, timeout = 0;
    
    link.rel = 'stylesheet';
    link.href = layer.path + href;
    link.id = id;
    
    if(!$('#'+ id)[0]){
      head.appendChild(link);
    }
    
    if(typeof fn !== 'function') return;
    
    //轮询css是否加载完毕
    (function poll() {
      if(++timeout > 8 * 1000 / 100){
        return window.console && console.error('layer.css: Invalid');
      };
      parseInt($('#'+id).css('width')) === 1989 ? fn() : setTimeout(poll, 100);
    }());
  },
  
  ready: function(callback){
    var cssname = 'skinlayercss', ver = '303';
    // 在layer.css 之后加上 v(版本) 参数，是为了更新 layer 后能够浏览器渲染（同名文件浏览器不再重新加载）
    isLayui ? layui.addcss('modules/layer/default/layer.css?v='+layer.v+ver, callback, cssname)
    : layer.link('skin/default/layer.css?v='+layer.v+ver, callback, cssname);
    return this;
  },
  
  //替代 alert 的函数，options 可有也可没有，yes是个函数，所以就应该考虑到使用的习惯
    // 不实用参数的时候，直接在第二个参数上些函数即可
  alert: function(content, options, yes){
    // 第二个参数 options 可以是配置，也可以是函数，默认是配置，如果是函数，就需要替换给 yes
    var type = typeof options === 'function';
    if(type) yes = options;
    // 只需要传递两个参数，默认是一个按钮，所以这里不需要配置按钮
    return layer.open($.extend({
      content: content,
      yes: yes
    }, type ? {} : options));
  }, 

    // 替代 confirm 的函数
  confirm: function(content, options, yes, cancel){
    // 照例，如果没有配置参数，就需要处理把 options, yes 的函数，替换到 yes, cancel
    var type = typeof options === 'function';
    if(type){
      cancel = yes;
      yes = options;
    }
    // 配合原生元素，需要配置确认和取消按钮，给对应的事件
    return layer.open($.extend({
      content: content,
      btn: ready.btn,
      yes: yes,
      btn2: cancel
    }, type ? {} : options));
  },

    //最常用提示层
  msg: function(content, options, end){ // end 是回调函数
    // 点击提示后，是否有回调函数
    var type = typeof options === 'function', rskin = ready.config.skin;
    var skin = (rskin ? rskin + ' ' + rskin + '-msg' : '')||'layui-layer-msg';
    var anim = doms.anim.length - 1;
    if(type) end = options;
    return layer.open($.extend({
      content: content,
      time: 3000, // 默认是 3s 后自动消息
      shade: false,
      skin: skin,
      title: false, // 因为默认是给 alert 这种弹出的，所以 msg 不需要 title 就需要取消掉
      closeBtn: false,
      btn: false,
      resize: false,
      end: end
    }, (type && !ready.config.skin) ? {
      skin: skin + ' layui-layer-hui',
      anim: anim // 也可以配置动画
    } : function(){
       options = options || {};
       if(options.icon === -1 || options.icon === undefined && !ready.config.skin){
         options.skin = skin + ' ' + (options.skin||'layui-layer-hui');
       }
       return options;
    }()));  
  },

    // 加载层 type 为 3，默认 icon 为 0
  load: function(icon, options){
    return layer.open($.extend({
      type: 3,
      icon: icon || 0,
      resize: false,
      shade: 0.01 // load 事件就需要配置 shade ，让背景有阴影
    }, options));
  }, 

    // 提示层，type 为 4, content 是内容，follow 是在页面的 id,class,tagName 处
  tips: function(content, follow, options){
    return layer.open($.extend({
      type: 4,
      content: [content, follow],
      closeBtn: false,
      time: 3000,
      shade: false,
      resize: false,
      fixed: false,
      maxWidth: 210
    }, options));
  }
};

// 初始的函数，从这里开始构建内部的主要函数
var Class = function(setings){  
  var that = this;
  that.index = ++layer.index;
  that.config = $.extend({}, that.config, ready.config, setings);
  // creat() 是构建初始的模版
  document.body ? that.creat() : setTimeout(function(){
    that.creat();
  }, 30);
};

// 简写 prototype
Class.pt = Class.prototype;

//缓存常用字符
var doms = ['layui-layer', '.layui-layer-title', '.layui-layer-main', '.layui-layer-dialog', 'layui-layer-iframe', 'layui-layer-content', 'layui-layer-btn', 'layui-layer-close'];
doms.anim = ['layer-anim', 'layer-anim-01', 'layer-anim-02', 'layer-anim-03', 'layer-anim-04', 'layer-anim-05', 'layer-anim-06'];

//默认配置
Class.pt.config = {
  type: 0,
  shade: 0.3,
  fixed: true,
  move: doms[1], // 拖动时候的元素，是 doms[1] 也就是 .layui-layer-title
  title: '&#x4FE1;&#x606F;', // &#x4FE1;&#x606F 信息
  offset: 'auto',
  area: 'auto', // 默认居中
  closeBtn: 1, // 默认是一个
  time: 0, //0表示不自动关闭
  zIndex: 19891014,  // 当前的zIndex , 每个弹出层都会有一个 zIndex, 越靠后的弹出层，zIndex 越大
  maxWidth: 360, // 最大的宽度
  anim: 0, // 默认的动画效果
  isOutAnim: true,
  icon: -1,
  moveType: 1,
  resize: true, // 默认是可以调整大小的，默认是可以resize，但是好像没有看到 resize 啊
  scrollbar: true, //是否允许浏览器滚动条
  tips: 2 // 默认tips 为2 (方位是向右的)
};

//容器
Class.pt.vessel = function(conType, callback){
  var that = this, times = that.index, config = that.config;
  // 当前的弹出层的 zIndex 为默认的加上当前的， titype 是否有 title
  var zIndex = config.zIndex + times, titype = typeof config.title === 'object';
  // 不知道 maxmin 是什么，CSS里面的maxmin就是个background-position && 弹出类型是否是 page 或者 iframe ，也就是都已整个页面型
  var ismax = config.maxmin && (config.type === 1 || config.type === 2);
  // 根据是否传入的参数里面有 title ,决定是否显式，比如msg就没有title，所以就可以不显示，所以 titleHTML 就需要换整个弹出层分离，单独设置
  var titleHTML = (config.title ? '<div class="layui-layer-title" style="'+ (titype ? config.title[1] : '') +'">' 
    + (titype ? config.title[0] : config.title) 
  + '</div>' : '');

  // 更新默认的 zIndex，这样下个弹出层就能够使用这个 zIndex
  config.zIndex = zIndex;

  // 调用 callback 函数，传入三个参数，层出的页面元素、头部栏、一个layui-layer-move的div
  callback([
    //遮罩
    config.shade ? ('<div class="layui-layer-shade" id="layui-layer-shade'+ times +'" times="'+ times +'" style="'+ ('z-index:'+ (zIndex-1) +'; background-color:'+ (config.shade[1]||'#000') +'; opacity:'+ (config.shade[0]||config.shade) +'; filter:alpha(opacity='+ (config.shade[0]*100||config.shade*100) +');') +'"></div>') : '',
    
    //主体 doms[0] => layui-layer, doms[6] => layui-layer-btn, doms[7] => layui-layer-close
          // type[0] => dialog, type[2] => iframe
    '<div class="'+ doms[0] + (' layui-layer-'+ready.type[config.type]) + (((config.type == 0 || config.type == 2) && !config.shade) ? ' layui-layer-border' : '') + ' ' + (config.skin||'') +'" id="'+ doms[0] + times +'" type="'+ ready.type[config.type] +'" times="'+ times +'" showtime="'+ config.time +'" conType="'+ (conType ? 'object' : 'string') +'" style="z-index: '+ zIndex +'; width:'+ config.area[0] + ';height:' + config.area[1] + (config.fixed ? '' : ';position:absolute;') +'">'
      + (conType && config.type != 2 ? '' : titleHTML) // type != iframe 的时候，就把 title 加上去
      + '<div id="'+ (config.id||'') +'" class="layui-layer-content'+ ((config.type == 0 && config.icon !== -1) ? ' layui-layer-padding' :'') + (config.type == 3 ? ' layui-layer-loading'+config.icon : '') +'">'
        + (config.type == 0 && config.icon !== -1 ? '<i class="layui-layer-ico layui-layer-ico'+ config.icon +'"></i>' : '')
        + (config.type == 1 && conType ? '' : (config.content||'')) // 设置的内容添加进来
      + '</div>'
      + '<span class="layui-layer-setwin">'+ function(){
        // 设置顶部的最小化、最大化、关闭按钮，不应该适合 title 放在一个位置吗，为什么设置了内容后，才添加关闭的按钮呢
        var closebtn = ismax ? '<a class="layui-layer-min" href="javascript:;"><cite></cite></a><a class="layui-layer-ico layui-layer-max" href="javascript:;"></a>' : '';
        config.closeBtn && (closebtn += '<a class="layui-layer-ico '+ doms[7] +' '+ doms[7] + (config.title ? config.closeBtn : (config.type == 4 ? '1' : '2')) +'" href="javascript:;"></a>');
        return closebtn;
      }() + '</span>'
      + (config.btn ? function(){
        // 设置底部显式的按钮，有多个就使用循环显式多个按钮
        var button = '';
        typeof config.btn === 'string' && (config.btn = [config.btn]);
        for(var i = 0, len = config.btn.length; i < len; i++){
          button += '<a class="'+ doms[6] +''+ i +'">'+ config.btn[i] +'</a>'
        }
        // 如果有设置居中按钮，就居中
        return '<div class="'+ doms[6] + (config.btnAlign ? (' layui-layer-btn-' + config.btnAlign) : '') +'">'+ button +'</div>'
      }() : '') // 这个 resize 应该是右下角拉伸的按钮
      + (config.resize ? '<span class="layui-layer-resize"></span>' : '')
    + '</div>'
  ], titleHTML, $('<div class="layui-layer-move"></div>'));
  return that;
};

//创建骨架
Class.pt.creat = function(){
  var that = this
  ,config = that.config
  ,times = that.index, nodeIndex
  ,content = config.content
  ,conType = typeof content === 'object' // 非 alert/msg/tips/load 类型，是 prompt/open/弹出这种需要用户配置参数/方法的
  ,body = $('body');

  //  如果有 config.id 就不再执行下面的，可是下面的 config.type 还有 0(dialog)，2(iframe)，3(loading)，4(tips)
  // 也就是 这四种都没有 id ,可以打印出来嘛；config.type = 1 也没有config.id ，不管了，就当是兼容处理了
  if(config.id && $('#'+config.id)[0])  return; // 这个没看懂，先不管

    // 设置的area 是否是auto 或者是一个数值，如果是数值，就更改默认的area
    // 因为width 有默认设置，而 height 没有默认设置，所以可以只传入一个 height 参数
  if(typeof config.area === 'string'){
    config.area = config.area === 'auto' ? ['', ''] : [config.area, ''];
  }
  
  //anim兼容旧版shift
  if(config.shift){
    config.anim = config.shift;
  }
  
  if(layer.ie == 6){
    config.fixed = false;
  }
  
  switch(config.type){
    case 0: // dialog，配置参数里面是否有按钮，没有就使用默认的按钮
      config.btn = ('btn' in config) ? config.btn : ready.btn[0];
      layer.closeAll('dialog');// 把之前的弹出层都关闭掉
    break;
      case 2: // iframe
        // config.content[0] 这时候是个链接， conType是否是个对象，是个对象就说明配置的参数就很多，每没有就说明可能单纯是一个链接
        //
      var content = config.content = conType ? config.content : [config.content, 'auto'];
      // 设置 config.content 是一个 iframe ，这样就能在弹出层的中间显式这个 iframe 里面的内容了
      config.content = '<iframe scrolling="'+ (config.content[1]||'auto') +'" allowtransparency="true" id="'+ doms[4] +''+ times +'" name="'+ doms[4] +''+ times +'" onload="this.className=\'\';" class="layui-layer-load" frameborder="0" src="' + config.content[0] + '"></iframe>';
    break;
    case 3: // loading， 把不需要的标题和关闭按钮都删除掉
      delete config.title;
      delete config.closeBtn;
      // 配置加载时候的图标
      config.icon === -1 && (config.icon === 0);
      layer.closeAll('loading'); // 把其他的加在层都关闭掉
    break;
      case 4: // tips
        // 开始的config.content 只是内容，第二个参数如果没有参数，就默认在 body 里面
      conType || (config.content = [config.content, 'body']);
      config.follow = config.content[1];
      config.content = config.content[0] + '<i class="layui-layer-TipsG"></i>';
      delete config.title; // 提示不需要有顶部的标题
          // 为什么 config.tips 是个对象？
      config.tips = typeof config.tips === 'object' ? config.tips : [config.tips, true];
      // 是否多个提示可以并存，如果不可以并存，就关闭全部的提示
      config.tipsMore || layer.closeAll('tips');
    break;
  }
  
  //建立容器
  that.vessel(conType, function(html, titleHTML, moveElem){
    body.append(html[0]); // 往 body 里面增加遮罩层
      // content 是 object ，什么时候 content 是 object 呢，比如 content: $('#tong') ，这时候 $('#tong')加载到 content 中就会全部弹出来
      // content: '<div style="padding: 20px 80px;">内容</div>' 这时候也是个对象
      // iframe 的时候  content: ['test/guodu.html', 'no'], //iframe的url，no代表不显示滚动条 这时候 content 也是个对象
    conType ? function(){
      // type[2] => iframe, type[4] => tips
      (config.type == 2 || config.type == 4) ? function(){
        $('body').append(html[1]); // 往 body 里面增加弹出层的主体（题目，内容，按钮）
      }() : function(){
        // 如果内容的父元素里面没有 layui-layer
        if(!content.parents('.'+doms[0])[0]){
          // 为什么要存储 display
          content.data('display', content.css('display')).show().addClass('layui-layer-wrap').wrap(html[1]);
          // doms[0] => layui-layer, doms[5] => layui-layer-content , 加入 title
          $('#'+ doms[0] + times).find('.'+doms[5]).before(titleHTML);
        }
      }();
    // 如果 content 不是 object 的时候，就直接往 body 里面加入弹出层的主体
    // 单纯的 alert/msg，但是使用 iframe 的时候，content是个链接，这时候也不是对象啊，所以和上面判断是iframe后的处理是杨的
    }() : body.append(html[1]);
    // 可已拖动的元素如果没有，直接放到 body 中
    $('.layui-layer-move')[0] || body.append(ready.moveElem = moveElem);
    // 把 layui-layer 加上times 后就是当前特定的弹出层，不会引起冲突
    that.layero = $('#'+ doms[0] + times);
    // 如果有设置滚动条就显式，没有就把多余出来的隐藏掉
    config.scrollbar || doms.html.css('overflow', 'hidden').attr('layer-full', times);
    // auto 应该是设置当前的弹出层自动居中，times 用来只是特定的弹出层
  }).auto(times);

  // type[2] => iframe， 针对 ie6 做兼容
  config.type == 2 && layer.ie == 6 && that.layero.find('iframe').attr('src', content[0]);

  //坐标自适应浏览器窗口尺寸 type[4] => tips
  config.type == 4 ? that.tips() : that.offset();
  // 如果设置了弹出层是固定在页面上的
  if(config.fixed){
    win.on('resize', function(){
      that.offset();
      // 设置的大小，是否是百分数
      (/^\d+%$/.test(config.area[0]) || /^\d+%$/.test(config.area[1])) && that.auto(times);
      config.type == 4 && that.tips();
    });
  }

  // 自动关闭的时间
  config.time <= 0 || setTimeout(function(){
    layer.close(that.index)
  }, config.time);
  // 这个是什么意思
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

//自适应，index 是某个弹出层特定的标识，就是 times
Class.pt.auto = function(index){
  var that = this, config = that.config, layero = $('#'+ doms[0] + index);
  if(config.area[0] === '' && config.maxWidth > 0){
    //为了修复IE7下一个让人难以理解的bug
    if(layer.ie && layer.ie < 8 && config.btn){
      layero.width(layero.innerWidth());
    }
    // 设置当前弹出层的 width 是设置的 maxWidth
    layero.outerWidth() > config.maxWidth && layero.width(config.maxWidth);
  }
  // outerWidth 和 innerWidth 的区别就是有没有加上 border。都是有加上 padding 的，outerWidth参数里面没有加上true，就不用计算margin
  var area = [layero.innerWidth(), layero.innerHeight()];
  var titHeight = layero.find(doms[1]).outerHeight() || 0;
  var btnHeight = layero.find('.'+doms[6]).outerHeight() || 0;
  // 设置高度，默认是没有设置高度的
  function setHeight(elem){
    elem = layero.find(elem);
    elem.height(area[1] - titHeight - btnHeight - 2*(parseFloat(elem.css('padding-top'))|0));
  }
  switch(config.type){
    case 2: // type[2] => iframe
      // 不明白为什么 iframe 的高度就需要减去 title 和 btn 的高度，这两个元素也是弹出层里面的啊
      // 连 padding-top/padding-bottom 都减去了，等于就只剩下了中间的content的内容
      setHeight('iframe');
    break;
    default:
      // 分默认的设置里面有设置高度还是没有设置高度
      if(config.area[1] === ''){
        // 如果参数里设置高度大于 window 的高度，就让它等于 window 的高度
        if(config.fixed && area[1] >= win.height()){
          area[1] = win.height();
          // doms[5] => layui-layer-content
          // 这里也是只设置了 content 的高度，和 iframe 是一样的，是不是因为 btn/title 的高度都是固定了的
          // content 的内容是自适应的，所以才需要设定
          setHeight('.'+doms[5]);
        }
      } else {
        setHeight('.'+doms[5]);
      }
    break;
  }
  return that;
};

//计算坐标
Class.pt.offset = function(){
  var that = this, config = that.config, layero = that.layero;
  var area = [layero.outerWidth(), layero.outerHeight()];
  var type = typeof config.offset === 'object';
  // 设置弹出后，居中的offsetTop/offsetLeft
  // 大概是明白了为什么没有设置 title/btn 的高度了，因为 msg 是没有 title/btn 的
  that.offsetTop = (win.height() - area[1])/2;
  that.offsetLeft = (win.width() - area[0])/2;

  // 如果默认设置里面有设置宽度和高度，就按照设置里面的来
  if(type){
    that.offsetTop = config.offset[0];
    that.offsetLeft = config.offset[1]||that.offsetLeft;
  } else if(config.offset !== 'auto'){
    // 这里是让弹出层在页面里面哪里显示
    if(config.offset === 't'){ //上
      that.offsetTop = 0;
    } else if(config.offset === 'r'){ //右
      that.offsetLeft = win.width() - area[0];
    } else if(config.offset === 'b'){ //下
      that.offsetTop = win.height() - area[1];
    } else if(config.offset === 'l'){ //左
      that.offsetLeft = 0;
    } else if(config.offset === 'lt'){ //左上角
      that.offsetTop = 0;
      that.offsetLeft = 0;
    } else if(config.offset === 'lb'){ //左下角
      that.offsetTop = win.height() - area[1];
      that.offsetLeft = 0;
    } else if(config.offset === 'rt'){ //右上角
      that.offsetTop = 0;
      that.offsetLeft = win.width() - area[0];
    } else if(config.offset === 'rb'){ //右下角
      that.offsetTop = win.height() - area[1];
      that.offsetLeft = win.width() - area[0];
    } else {
      that.offsetTop = config.offset;
    }
    
  }

  // 默认是固定的，如果设置的不是固定的，就按设置的位置来
  if(!config.fixed){
    that.offsetTop = /%$/.test(that.offsetTop) ? 
      win.height()*parseFloat(that.offsetTop)/100
    : parseFloat(that.offsetTop);
    that.offsetLeft = /%$/.test(that.offsetLeft) ? 
      win.width()*parseFloat(that.offsetLeft)/100
    : parseFloat(that.offsetLeft);
    // 需要加上滚动条移动的距离
    that.offsetTop += win.scrollTop();
    that.offsetLeft += win.scrollLeft();
  }

  // doms[1] => .layui-layer-title
  // 如果有最小的 minLeft 这个是什么意思
  if(layero.attr('minLeft')){
    // 为什么要减去 title 的高度
    that.offsetTop = win.height() - (layero.find(doms[1]).outerHeight() || 0);
    that.offsetLeft = layero.css('left');
  }

  layero.css({top: that.offsetTop, left: that.offsetLeft});
};

//Tips
Class.pt.tips = function(){
  var that = this, config = that.config, layero = that.layero;
  // 设置 tips 的宽高，和在哪个元素上弹出提示
  var layArea = [layero.outerWidth(), layero.outerHeight()], follow = $(config.follow);
  // 没有设置在哪个元素上弹出，就默认在 body 中弹出
  if(!follow[0]) follow = $('body');
  // 设置目标元素的位置，默认是在页面的左上角
  var goal = {
    width: follow.outerWidth(),
    height: follow.outerHeight(),
    top: follow.offset().top,
    left: follow.offset().left
  }, tipsG = layero.find('.layui-layer-TipsG');

  // tips[0] 获得默认在哪个方位显式 上/下/左/右
  var guide = config.tips[0];
  // tips[1] 为目标元素 #id/.class  把所有的 tips 移除
  config.tips[1] || tipsG.remove();

  // goal 是follow 的位置，tips 不能脱离页面，所以设置在页面的位置，只有在 tips 位置在上/下的时候才有
  goal.autoLeft = function(){
    if(goal.left + layArea[0] - win.width() > 0){
      goal.tipLeft = goal.left + goal.width - layArea[0];
      // tipsG 是什么
      tipsG.css({right: 12, left: 'auto'});
    } else {
      goal.tipLeft = goal.left;
    };
  };
  
  //辨别tips的方位 layArea = [layero.outerWidth(), layero.outerHeight()]
  // 为什么只有在 上/下的时候才使用 autoLeft() ，按理说不是应该在左的时候才使用吗
  // 因为 tips 在上/下的时候，tips 和 follow 的位置是同一个的竖线位置的，所以 left 需要单独设置
  goal.where = [function(){ //上        
    goal.autoLeft();
    // tipTop 应该是 follow 的 top 减去 tips 的 高度，再减 10
    goal.tipTop = goal.top - layArea[1] - 10;
    tipsG.removeClass('layui-layer-TipsB').addClass('layui-layer-TipsT').css('border-right-color', config.tips[1]);
  }, function(){ //右
      // 这个好理解，follow的left+width就是在右边了，加上10 是隔开 三角形的距离，就是tips的content 的内容了
    goal.tipLeft = goal.left + goal.width + 10;
    // top 和 follow 的 top 式样的
    goal.tipTop = goal.top;
    tipsG.removeClass('layui-layer-TipsL').addClass('layui-layer-TipsR').css('border-bottom-color', config.tips[1]); 
  }, function(){ //下
    goal.autoLeft();
    // follow的 top + height + 10 就是在 follow 的下面位置了
    goal.tipTop = goal.top + goal.height + 10;
    tipsG.removeClass('layui-layer-TipsT').addClass('layui-layer-TipsB').css('border-right-color', config.tips[1]);
  }, function(){ //左
    // follow 的左边减去 tips 的 width 再减去 10 就是 左边了
    goal.tipLeft = goal.left - layArea[0] - 10;
    goal.tipTop = goal.top;
    tipsG.removeClass('layui-layer-TipsR').addClass('layui-layer-TipsL').css('border-bottom-color', config.tips[1]);
  }];
  //guide = config.tips[0];
  // 设置后 tips 的类型后，开始运行 where
  goal.where[guide-1]();
  
  /* 8*2为小三角形占据的空间 */
  if(guide === 1){ // 上，既然是上，为什么运行的是 goal.where[2]
    goal.top - (win.scrollTop() + layArea[1] + 8*2) < 0 && goal.where[2]();
  } else if(guide === 2){ // 右，默认就是右
    win.width() - (goal.left + goal.width + layArea[0] + 8*2) > 0 || goal.where[3]()
  } else if(guide === 3){ // 下
    (goal.top - win.scrollTop() + goal.height + layArea[1] + 8*2) - win.height() > 0 && goal.where[0]();
  } else if(guide === 4){ // 左
     layArea[0] + 8*2 - goal.left > 0 && goal.where[1]()
  }

  // doms[5] => tips
  layero.find('.'+doms[5]).css({
    'background-color': config.tips[1], 
    'padding-right': (config.closeBtn ? '30px' : '')
  });
  layero.css({
    // 为什么 fixed 就需要减去 scrollLeft，因为如果不是 fixed 就会直接显示在当前页面
    left: goal.tipLeft - (config.fixed ? win.scrollLeft() : 0), 
    top: goal.tipTop  - (config.fixed ? win.scrollTop() : 0)
  });
}

//拖拽层
Class.pt.move = function(){
  var that = this
  ,config = that.config
  ,_DOC = $(document)
  ,layero = that.layero
  ,moveElem = layero.find(config.move)
  ,resizeElem = layero.find('.layui-layer-resize')
  ,dict = {};

  // 如果有设置可以拖动，那么就设置鼠标的样式会可拖动的样式
  if(config.move){
    moveElem.css('cursor', 'move');
  }

  // 鼠标点击下去时候的事件触发
  moveElem.on('mousedown', function(e){
    e.preventDefault();
    if(config.move){
      dict.moveStart = true;
      // 设置坐标
      dict.offset = [
        e.clientX - parseFloat(layero.css('left'))
        ,e.clientY - parseFloat(layero.css('top'))
      ];
      ready.moveElem.css('cursor', 'move').show();
    }
  });

  // 右下角的拖动调整宽高的动作按下后
  resizeElem.on('mousedown', function(e){
    e.preventDefault();
    dict.resizeStart = true;
    // 这个又是什么意思 dict 是什么
    dict.offset = [e.clientX, e.clientY];
    dict.area = [
      layero.outerWidth()
      ,layero.outerHeight()
    ];
    ready.moveElem.css('cursor', 'se-resize').show();
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
    
    //Resize
    if(config.resize && dict.resizeStart){
      var X = e.clientX - dict.offset[0]
      ,Y = e.clientY - dict.offset[1];
      
      e.preventDefault();
      
      layer.style(that.index, {
        width: dict.area[0] + X
        ,height: dict.area[1] + Y
      })
      dict.isResize = true;
      config.resizing && config.resizing(layero);
    }
  }).on('mouseup', function(e){
    if(dict.moveStart){
      delete dict.moveStart;
      ready.moveElem.hide();
      config.moveEnd && config.moveEnd(layero);
    }
    if(dict.resizeStart){
      delete dict.resizeStart;
      ready.moveElem.hide();
    }
  });
  
  return that;
};

// 应该是回调函数
Class.pt.callback = function(){
  var that = this, layero = that.layero, config = that.config;
  that.openLayer();
  if(config.success){
    // type[2] => iframe
    if(config.type == 2){
      // 让 iframe 加载完再触发事件
      layero.find('iframe').on('load', function(){
        config.success(layero, that.index);
      });
    } else {
      // 不是 iframe 就直接触发事件
      config.success(layero, that.index);
    }
  }
  layer.ie == 6 && that.IE6(layero);
  
  //按钮 doms[6] => layui-layer-btn
  // 找到 弹出层底部的按钮，点击按钮时触发事件
  layero.find('.'+ doms[6]).children('a').on('click', function(){
    var index = $(this).index();
    // 这个是什么意思，index 是什么参数
    if(index === 0){
      if(config.yes){
        config.yes(that.index, layero)
      } else if(config['btn1']){
        config['btn1'](that.index, layero)
      } else {
        layer.close(that.index);
      }
    } else {
      // 这个又是什么，index 是个数字，config['btn'] 是个函数吗
      var close = config['btn'+(index+1)] && config['btn'+(index+1)](that.index, layero);
      close === false || layer.close(that.index);
    }
  });
  
  //取消
  function cancel(){
    var close = config.cancel && config.cancel(that.index, layero);
    close === false || layer.close(that.index);
  }
  
  //右上角关闭回调 doms[7] => layui-layer-close
  layero.find('.'+ doms[7]).on('click', cancel);
  
  //点遮罩关闭
  if(config.shadeClose){
    $('#layui-layer-shade'+ that.index).on('click', function(){
      layer.close(that.index);
    });
  } 
  
  //最小化
  layero.find('.layui-layer-min').on('click', function(){
    var min = config.min && config.min(layero);
    min === false || layer.min(that.index, config); 
  });
  
  //全屏/还原
  layero.find('.layui-layer-max').on('click', function(){
    if($(this).hasClass('layui-layer-maxmin')){
      // 获取当前弹出层存储的宽高信息
      layer.restore(that.index);
      config.restore && config.restore(layero);
    } else {
      // 全屏
      layer.full(that.index, config);
      // 为什么会有 layer.full 和 config.full 两个呢,， layer.full 是操作函数
      // config.full 是个参数，保存当前的 弹出层对象
      setTimeout(function(){
        config.full && config.full(layero);
      }, 100);
    }
  });

  // 1336行，可能是哪个函数
  config.end && (ready.end[that.index] = config.end);
};

//for ie6 恢复 select
ready.reselect = function(){
  $.each($('select'), function(index , value){
    var sthis = $(this);
    if(!sthis.parents('.'+doms[0])[0]){
      (sthis.attr('layer') == 1 && $('.'+doms[0]).length < 1) && sthis.removeAttr('layer').show(); 
    }
    sthis = null;
  });
}; 

Class.pt.IE6 = function(layero){
  //隐藏select
  $('select').each(function(index , value){
    var sthis = $(this);
    if(!sthis.parents('.'+doms[0])[0]){
      sthis.css('display') === 'none' || sthis.attr({'layer' : '1'}).hide();
    }
    sthis = null;
  });
};

//需依赖原型的对外方法
Class.pt.openLayer = function(){
  var that = this;
  
  // 设置当前弹出层的 zIndex
  layer.zIndex = that.config.zIndex;
  layer.setTop = function(layero){
    var setZindex = function(){
      // 每次弹出，都需要把 zIndex++ ，这样每个弹出层但是唯一的
      layer.zIndex++;
      layero.css('z-index', layer.zIndex + 1);
    };
    layer.zIndex = parseInt(layero[0].style.zIndex);
    layero.on('mousedown', setZindex);
    return layer.zIndex;
  };
};

// 保存 layer 的尺寸，每次点击最小化/最大化后，如果需要点击还原，就需要使用到存储的宽高和位置
ready.record = function(layero){
  var area = [
    layero.width(),
    layero.height(),
    layero.position().top, 
    layero.position().left + parseFloat(layero.css('margin-left'))
  ];
  layero.find('.layui-layer-max').addClass('layui-layer-maxmin');
  layero.attr({area: area});
};
// 是否显式滚动条，其实就是是否设置 overflow
ready.rescollbar = function(index){
  if(doms.html.attr('layer-full') == index){
    if(doms.html[0].style.removeProperty){
      doms.html[0].style.removeProperty('overflow');
    } else {
      doms.html[0].style.removeAttribute('overflow');
    }
    doms.html.removeAttr('layer-full');
  }
};

/** 内置成员 */
// 将 layer暴露给外部接口
window.layer = layer;

//获取子iframe的DOM doms[4] => layui-layer-iframe
layer.getChildFrame = function(selector, index){
  index = index || $('.'+doms[4]).attr('times');
  return $('#'+ doms[0] + index).find('iframe').contents().find(selector);  
};

//得到当前iframe层的索引，子iframe时使用, 应该是 iframe 之间通信的时候需要用到
layer.getFrameIndex = function(name){
  return $('#'+ name).parents('.'+doms[4]).attr('times');
};

//iframe层自适应宽高 doms[0] => layui-layer, doms[1] => .layui-layer-title, doms[2] => layui-layer-btn
layer.iframeAuto = function(index){
  if(!index) return;
  var heg = layer.getChildFrame('html', index).outerHeight();
  var layero = $('#'+ doms[0] + index);
  var titHeight = layero.find(doms[1]).outerHeight() || 0;
  var btnHeight = layero.find('.'+doms[6]).outerHeight() || 0;
  // 获得 iframe 的内容高度后，还需要加上 title 和 btn 的高度
  layero.css({height: heg + titHeight + btnHeight});
  layero.find('iframe').css({height: heg});
};

//设置iframe 的url，这样弹出iframe 的时候，就能够直接获取src里面的内容 doms[0] => layui-layer
layer.iframeSrc = function(index, url){
  $('#'+ doms[0] + index).find('iframe').attr('src', url);
};

//设定层的样式  doms[0] => layui-layer, doms[1] => .layui-layer-title, doms[6] => layui-layer-btn
layer.style = function(index, options, limit){
  var layero = $('#'+ doms[0] + index)
  ,contElem = layero.find('.layui-layer-content')
   // type 是什么？
  ,type = layero.attr('type')
  ,titHeight = layero.find(doms[1]).outerHeight() || 0
  ,btnHeight = layero.find('.'+doms[6]).outerHeight() || 0
  ,minLeft = layero.attr('minLeft');

  // type[3] => loading, type[4] => tips
  // 是因为 loading 和 tips 不需要设置样式吗
  if(type === ready.type[3] || type === ready.type[4]){
    return;
  }

  // 是否限定最低的宽高
  if(!limit){
    if(parseFloat(options.width) <= 260){
      options.width = 260;
    };
    
    if(parseFloat(options.height) - titHeight - btnHeight <= 64){
      options.height = 64 + titHeight + btnHeight;
    };
  }
  
  layero.css(options);
  btnHeight = layero.find('.'+doms[6]).outerHeight();
  // type[2] => iframe
  if(type === ready.type[2]){
    layero.find('iframe').css({
      height: parseFloat(options.height) - titHeight - btnHeight
    });
  } else {
    // 默认设置里面的宽高是包括 title 和 btn 的高度的，所以设置的时候，需要减去这些
    contElem.css({
      height: parseFloat(options.height) - titHeight - btnHeight
      - parseFloat(contElem.css('padding-top'))
      - parseFloat(contElem.css('padding-bottom'))
    })
  }
};

//最小化 doms[0] => layui-layer, doms[1] => .layui-layer-title
layer.min = function(index, options){
  var layero = $('#'+ doms[0] + index)
  ,titHeight = layero.find(doms[1]).outerHeight() || 0
  // 这里设置 left 的距离，如果左边已经有最小化的弹出层了，就往左再移动 181px
  ,left = layero.attr('minLeft') || (181*ready.minIndex)+'px'
  ,position = layero.css('position');
  // 先存储好 layer 的尺寸，点击恢复的时候需要用到
  ready.record(layero);
  // 设置弹出层的 left，为什么要删除 ready.minLeft[0]
  if(ready.minLeft[0]){
    left = ready.minLeft[0];
    ready.minLeft.shift();
  }

  // position 即使最小化也需要保持和原先的不一样
  layero.attr('position', position);
  
  layer.style(index, {
    width: 180
    ,height: titHeight
    ,left: left
    ,top: win.height() - titHeight
    ,position: 'fixed'
    ,overflow: 'hidden'
  }, true);

  // 最小化的按钮需要隐藏
  layero.find('.layui-layer-min').hide();
  // doms[4] => layui-layer-iframe
  layero.attr('type') === 'page' && layero.find(doms[4]).hide();
  // 滚动条也设置隐藏
  ready.rescollbar(index);
  
  if(!layero.attr('minLeft')){
    ready.minIndex++;
  }
  layero.attr('minLeft', left);
};

//还原 doms[0] => layui-layer
layer.restore = function(index){
  // 找到当前的弹出层，index 是特定的标识
  var layero = $('#'+ doms[0] + index), area = layero.attr('area').split(',');
  var type = layero.attr('type');
  layer.style(index, {
    width: parseFloat(area[0]), 
    height: parseFloat(area[1]), 
    top: parseFloat(area[2]), 
    left: parseFloat(area[3]),
    position: layero.attr('position'),
    overflow: 'visible'
  }, true);
  layero.find('.layui-layer-max').removeClass('layui-layer-maxmin');
  layero.find('.layui-layer-min').show();
  layero.attr('type') === 'page' && layero.find(doms[4]).show();
  ready.rescollbar(index);
};

//全屏
layer.full = function(index){
  var layero = $('#'+ doms[0] + index), timer;
  ready.record(layero);
  if(!doms.html.attr('layer-full')){
    doms.html.css('overflow','hidden').attr('layer-full', index);
  }
  // 不明白为什么要使用定时器
  clearTimeout(timer);
  timer = setTimeout(function(){
    var isfix = layero.css('position') === 'fixed';
    layer.style(index, {
      top: isfix ? 0 : win.scrollTop(),
      left: isfix ? 0 : win.scrollLeft(),
      width: win.width(),
      height: win.height()
    }, true);
    layero.find('.layui-layer-min').hide();
  }, 100);
};

//改变title
layer.title = function(name, index){
  var title = $('#'+ doms[0] + (index||layer.index)).find(doms[1]);
  title.html(name);
};

//关闭layer总方法 doms[0] => layui-layer, doms[4] => layui-layer-iframe ,doms[5] => layui-layer-content
// type[1] => page
layer.close = function(index){
  var layero = $('#'+ doms[0] + index), type = layero.attr('type'), closeAnim = 'layer-anim-close';
  if(!layero[0]) return;
  var WRAP = 'layui-layer-wrap', remove = function(){
    if(type === ready.type[1] && layero.attr('conType') === 'object'){
      // 这是什么意思
      layero.children(':not(.'+ doms[5] +')').remove();
      var wrap = layero.find('.'+WRAP);
      for(var i = 0; i < 2; i++){
        wrap.unwrap();
      }
      wrap.css('display', wrap.data('display')).removeClass(WRAP);
    } else {
      //低版本IE 回收 iframe
      if(type === ready.type[2]){
        try {
          var iframe = $('#'+doms[4]+index)[0];
          iframe.contentWindow.document.write('');
          iframe.contentWindow.close();
          layero.find('.'+doms[5])[0].removeChild(iframe);
        } catch(e){}
      }
      layero[0].innerHTML = '';
      layero.remove();
    }
    // 触发回调函数后，删除回调函数
    typeof ready.end[index] === 'function' && ready.end[index]();
    delete ready.end[index];
  };
  
  if(layero.data('isOutAnim')){
    layero.addClass(closeAnim);
  }
  
  $('#layui-layer-moves, #layui-layer-shade' + index).remove();
  layer.ie == 6 && ready.reselect();
  ready.rescollbar(index); 
  if(layero.attr('minLeft')){
    ready.minIndex--;
    ready.minLeft.push(layero.attr('minLeft'));
  }
  
  if((layer.ie && layer.ie < 10) || !layero.data('isOutAnim')){
    remove()
  } else {
    setTimeout(function(){
      remove();
    }, 200);
  }
};

//关闭所有层，使用 each 循环
layer.closeAll = function(type){
  $.each($('.'+doms[0]), function(){
    var othis = $(this);
    var is = type ? (othis.attr('type') === type) : 1;
    is && layer.close(othis.attr('times'));
    is = null;
  });
};

/** 

  拓展模块，layui开始合并在一起

 */

var cache = layer.cache||{}, skin = function(type){
  return (cache.skin ? (' ' + cache.skin + ' ' + cache.skin + '-'+type) : '');
}; 
 
//仿系统prompt
layer.prompt = function(options, yes){
  var style = '';
  options = options || {};
  
  if(typeof options === 'function') yes = options;
  
  if(options.area){
    var area = options.area;
    style = 'style="width: '+ area[0] +'; height: '+ area[1] + ';"';
    delete options.area;
  }
  // 增加输入框
  var prompt, content = options.formType == 2 ? '<textarea class="layui-layer-input"' + style +'>' + (options.value||'') +'</textarea>' : function(){
    return '<input type="'+ (options.formType == 1 ? 'password' : 'text') +'" class="layui-layer-input" value="'+ (options.value||'') +'">';
  }();
  
  var success = options.success;
  delete options.success;

  // 配置按钮和函数
  return layer.open($.extend({
    type: 1
    ,btn: ['&#x786E;&#x5B9A;','&#x53D6;&#x6D88;']
    ,content: content
    ,skin: 'layui-layer-prompt' + skin('prompt')
    ,maxWidth: win.width()
    ,success: function(layero){
      prompt = layero.find('.layui-layer-input');
      prompt.focus();
      typeof success === 'function' && success(layero);
    }
    ,resize: false
    ,yes: function(index){
      var value = prompt.val();
      if(value === ''){
        prompt.focus();
      } else if(value.length > (options.maxlength||500)) {
        layer.tips('&#x6700;&#x591A;&#x8F93;&#x5165;'+ (options.maxlength || 500) +'&#x4E2A;&#x5B57;&#x6570;', prompt, {tips: 1});
      } else {
        yes && yes(value, index, prompt);
      }
    }
  }, options));
};

//tab层
layer.tab = function(options){
  options = options || {};
  
  var tab = options.tab || {}
  ,success = options.success;
  
  delete options.success;
  
  return layer.open($.extend({
    type: 1,
    skin: 'layui-layer-tab' + skin('tab'),
    resize: false,
    title: function(){
      var len = tab.length, ii = 1, str = '';
      if(len > 0){
        str = '<span class="layui-layer-tabnow">'+ tab[0].title +'</span>';
        for(; ii < len; ii++){
          str += '<span>'+ tab[ii].title +'</span>';
        }
      }
      return str;
    }(),
    content: '<ul class="layui-layer-tabmain">'+ function(){
      var len = tab.length, ii = 1, str = '';
      if(len > 0){
        str = '<li class="layui-layer-tabli xubox_tab_layer">'+ (tab[0].content || 'no content') +'</li>';
        for(; ii < len; ii++){
          str += '<li class="layui-layer-tabli">'+ (tab[ii].content || 'no  content') +'</li>';
        }
      }
      return str;
    }() +'</ul>',
    success: function(layero){
      var btn = layero.find('.layui-layer-title').children();
      var main = layero.find('.layui-layer-tabmain').children();
      btn.on('mousedown', function(e){
        e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
        var othis = $(this), index = othis.index();
        othis.addClass('layui-layer-tabnow').siblings().removeClass('layui-layer-tabnow');
        main.eq(index).show().siblings().hide();
        typeof options.change === 'function' && options.change(index);
      });
      typeof success === 'function' && success(layero);
    }
  }, options));
};

//相册层
layer.photos = function(options, loop, key){
  var dict = {};
  options = options || {};
  if(!options.photos) return;
  var type = options.photos.constructor === Object;
  var photos = type ? options.photos : {}, data = photos.data || [];
  var start = photos.start || 0;
  dict.imgIndex = (start|0) + 1;
  
  options.img = options.img || 'img';
  
  var success = options.success;
  delete options.success;

  if(!type){ //页面直接获取
    var parent = $(options.photos), pushData = function(){
      data = [];
      parent.find(options.img).each(function(index){
        var othis = $(this);
        othis.attr('layer-index', index);
        data.push({
          alt: othis.attr('alt'),
          pid: othis.attr('layer-pid'),
          src: othis.attr('layer-src') || othis.attr('src'),
          thumb: othis.attr('src')
        });
      })
    };
    
    pushData();
    
    if (data.length === 0) return;
    
    loop || parent.on('click', options.img, function(){
      var othis = $(this), index = othis.attr('layer-index'); 
      layer.photos($.extend(options, {
        photos: {
          start: index,
          data: data,
          tab: options.tab
        },
        full: options.full
      }), true);
      pushData();
    })
    
    //不直接弹出
    if(!loop) return;
    
  } else if (data.length === 0){
    return layer.msg('&#x6CA1;&#x6709;&#x56FE;&#x7247;');
  }
  
  //上一张
  dict.imgprev = function(key){
    dict.imgIndex--;
    if(dict.imgIndex < 1){
      dict.imgIndex = data.length;
    }
    dict.tabimg(key);
  };
  
  //下一张
  dict.imgnext = function(key,errorMsg){
    dict.imgIndex++;
    if(dict.imgIndex > data.length){
      dict.imgIndex = 1;
      if (errorMsg) {return};
    }
    dict.tabimg(key)
  };
  
  //方向键
  dict.keyup = function(event){
    if(!dict.end){
      var code = event.keyCode;
      event.preventDefault();
      if(code === 37){
        dict.imgprev(true);
      } else if(code === 39) {
        dict.imgnext(true);
      } else if(code === 27) {
        layer.close(dict.index);
      }
    }
  }
  
  //切换
  dict.tabimg = function(key){
    if(data.length <= 1) return;
    photos.start = dict.imgIndex - 1;
    layer.close(dict.index);
    return layer.photos(options, true, key);
    setTimeout(function(){
      layer.photos(options, true, key);
    }, 200);
  }
  
  //一些动作
  dict.event = function(){
    dict.bigimg.hover(function(){
      dict.imgsee.show();
    }, function(){
      dict.imgsee.hide();
    });
    
    dict.bigimg.find('.layui-layer-imgprev').on('click', function(event){
      event.preventDefault();
      dict.imgprev();
    });  
    
    dict.bigimg.find('.layui-layer-imgnext').on('click', function(event){     
      event.preventDefault();
      dict.imgnext();
    });
    
    $(document).on('keyup', dict.keyup);
  };
  
  //图片预加载
  function loadImage(url, callback, error) {   
    var img = new Image();
    img.src = url; 
    if(img.complete){
      return callback(img);
    }
    img.onload = function(){
      img.onload = null;
      callback(img);
    };
    img.onerror = function(e){
      img.onerror = null;
      error(e);
    };  
  };
  
  dict.loadi = layer.load(1, {
    shade: 'shade' in options ? false : 0.9,
    scrollbar: false
  });

  loadImage(data[start].src, function(img){
    layer.close(dict.loadi);
    dict.index = layer.open($.extend({
      type: 1,
      id: 'layui-layer-photos',
      area: function(){
        var imgarea = [img.width, img.height];
        var winarea = [$(window).width() - 100, $(window).height() - 100];
        
        //如果 实际图片的宽或者高比 屏幕大（那么进行缩放）
        if(!options.full && (imgarea[0]>winarea[0]||imgarea[1]>winarea[1])){
          var wh = [imgarea[0]/winarea[0],imgarea[1]/winarea[1]];//取宽度缩放比例、高度缩放比例
          if(wh[0] > wh[1]){//取缩放比例最大的进行缩放
            imgarea[0] = imgarea[0]/wh[0];
            imgarea[1] = imgarea[1]/wh[0];
          } else if(wh[0] < wh[1]){
            imgarea[0] = imgarea[0]/wh[1];
            imgarea[1] = imgarea[1]/wh[1];
          }
        }
        
        return [imgarea[0]+'px', imgarea[1]+'px']; 
      }(),
      title: false,
      shade: 0.9,
      shadeClose: true,
      closeBtn: false,
      move: '.layui-layer-phimg img',
      moveType: 1,
      scrollbar: false,
      moveOut: true,
      //anim: Math.random()*5|0,
      isOutAnim: false,
      skin: 'layui-layer-photos' + skin('photos'),
      content: '<div class="layui-layer-phimg">'
        +'<img src="'+ data[start].src +'" alt="'+ (data[start].alt||'') +'" layer-pid="'+ data[start].pid +'">'
        +'<div class="layui-layer-imgsee">'
          +(data.length > 1 ? '<span class="layui-layer-imguide"><a href="javascript:;" class="layui-layer-iconext layui-layer-imgprev"></a><a href="javascript:;" class="layui-layer-iconext layui-layer-imgnext"></a></span>' : '')
          +'<div class="layui-layer-imgbar" style="display:'+ (key ? 'block' : '') +'"><span class="layui-layer-imgtit"><a href="javascript:;">'+ (data[start].alt||'') +'</a><em>'+ dict.imgIndex +'/'+ data.length +'</em></span></div>'
        +'</div>'
      +'</div>',
      success: function(layero, index){
        dict.bigimg = layero.find('.layui-layer-phimg');
        dict.imgsee = layero.find('.layui-layer-imguide,.layui-layer-imgbar');
        dict.event(layero);
        options.tab && options.tab(data[start], layero);
        typeof success === 'function' && success(layero);
      }, end: function(){
        dict.end = true;
        $(document).off('keyup', dict.keyup);
      }
    }, options));
  }, function(){
    layer.close(dict.loadi);
    layer.msg('&#x5F53;&#x524D;&#x56FE;&#x7247;&#x5730;&#x5740;&#x5F02;&#x5E38;<br>&#x662F;&#x5426;&#x7EE7;&#x7EED;&#x67E5;&#x770B;&#x4E0B;&#x4E00;&#x5F20;&#xFF1F;', {
      time: 30000, 
      btn: ['&#x4E0B;&#x4E00;&#x5F20;', '&#x4E0D;&#x770B;&#x4E86;'], 
      yes: function(){
        data.length > 1 && dict.imgnext(true,true);
      }
    });
  });
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

//加载方式
window.layui && layui.define ? (
  //#region
  layer.ready()
  ,layui.define('jquery', function(exports){ //layui加载
    layer.path = layui.cache.dir;
    ready.run(layui.jquery);

    //暴露模块
    window.layer = layer;
    exports('layer', layer);
  })
) : (
  (typeof define === 'function' && define.amd) ? define(['jquery'], function(){ //requirejs加载
    ready.run(window.jQuery);
    return layer;
  }) : function(){ //普通script标签加载
    ready.run(window.jQuery);
    layer.ready();
  }()
);
//#endregion
}(window);

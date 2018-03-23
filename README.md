# layer-analysis
[layer](https://github.com/sentsin/layer) 官方介绍为
> 丰富多样的Web弹出层组件，可轻松实现Alert/Confirm/Prompt/普通提示/页面区块/iframe/tips等等几乎所有的弹出交互。

对`layer`解构重写
- `skin`是`layer`的`icon`和`css`文件
- `alert`文件
    - `alert\layer.js`分离出最简化的`layer.alert()`函数
    - `alert\main.js`为自己对最简化的`layer.js`的部分重写
- `confirm`文件
    - `confirm\main.js`是在`alert\main.js`上增加函数，使得`main.js`能提供`layer.alert()`和`layer.confirm`函数
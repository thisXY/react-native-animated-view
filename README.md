# react-native-animated-view
[![Platform](https://img.shields.io/badge/platform-react--native-lightgrey.svg)](http://facebook.github.io/react-native/)
[![npm version](http://img.shields.io/npm/v/react-native-animated-view.svg)](https://www.npmjs.com/package/react-native-animated-view)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/thisXY/react-native-animated-view/master/LICENSE)

你可以像jQuery那样只给结果样式就能操作各种动画,你可以控制每一个样式的动画时间、动画函数甚至每一帧等。总之,你可以随意搭配轻松如意地操纵react-native动画。

### 安装

```bash
npm install react-native-animated-view --save
```

### 属性

| parameter                     | type                                       | required | description                                                                                                                                                                                                                                                                                                                         | default                  
| :---------------------------- | :----------------------------------------- | :------- | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| :------------------------
| children                      | node                                       | no       | 子组件                                                                                                                                                                                                                                                                                                                               | null                     
| animationElement              | func                                       | no       | 动画元素                                                                                                                                                                                                                                                                                                                             | Animated.View            
| style                         | oneOfType([number, object, array])         | no       | 样式                                                                                                                                                                                                                                                                                                                                 |                          
| isUseNativeDriver             | bool                                       | no       | 是否启用原生动画驱动 (启用原生动画驱动几乎不会有UI卡顿);<br>目前RN仅支持其中样式['transform', 'opacity', 'shadowOffset', 'shadowRadius', 'shadowOpacity', 'textShadowOffset', 'textShadowRadius'];<br>若尝试启动非支持样式的原生动画驱动, start()将返回false示意无法启动;<br>由于RN机制该设置一旦设定将不可切换 (你可以创建一个新的AnimatedView切换该设置) | false                    
| defaultAnimationType          | oneOf(['sequence', 'parallel', 'stagger']) | no       | 动画类型 <br>sequence: 顺序执行<br>parallel: 同时执行<br>stagger: 间隔延时时间执行顺序并行                                                                                                                                                                                                                                                 | parallel                 
| defaultParallelIsStopTogether | bool                                       | no       | 默认动画类型parallel是否联动(如果联动,任何一个动画被停止或中断，组内所有其它的动画也会被停止)                                                                                                                                                                                                                                                  | false
| defaultStaggerDelayTime       | number                                     | no       | 默认动画类型stagger延迟时间                                                                                                                                                                                                                                                                                                             | 0
| defaultEasing                 | func                                       | no       | 默认动画函数                                                                                                                                                                                                                                                                                                                          | Easing.inOut(Easing.ease)
| defaultDuration               | number                                     | no       | 默认动画时间 (ms)                                                                                                                                                                                                                                                                                                                     | 500                      
| defaultCallback               | func                                       | no       | 默认结束回调 (<br>isFinish: 动画是否完成<br>)                                                                                                                                                                                                                                                                                          |                          
| defaultFrameCallback          | func                                       | no       | 默认动画帧回调 (<br>info: 当前帧信息{<br>name: 样式名, <br>value: 当前样式值, <br>num: 当前动画值, <br>inputRange: 动画值区间, <br>outputRange: 样式值区间, <br>isFinish: 是否结束<br>})                                                                                                                                                      |                          

### 方法
启动动画:
```js
  /**
   * @param configs 动画配置 (数组 || 对象)
   *
   * 数组: [{
   *   // 样式名
   *   name,
   *   // 样式值
   *   value,
   *   // 初始样式值 (缺省使用当前样式值)
   *   initValue,
   *   // 动画函数 (缺省使用动画参数配置或默认)
   *   easing,
   *   // 动画时间 (缺省使用动画参数配置或默认)
   *   duration,
   *   // 动画帧回调
   *     (@param info 当前动画帧信息:
   *     {
   *       value: 当前样式值,
   *       num: 当前动画值,
   *       inputRange: 动画值区间,
   *       outputRange: 样式值区间,
   *       isFinish: 是否结束
   *     })
   *   frameCallback,
   * }]
   *
   * 对象: { 样式名: 样式值 || [初始样式值, 样式值] }
   *
   * -----------------------------------------------------
   *
   * @param 动画参数配置(configs配置将覆盖此配置 缺省使用默认):
   * {
   *   duration: 动画时间,
   *   easing: 动画函数,
   *   frameCallback: 动画帧回调,
   *   callback: 结束回调,
   *   animationType: 动画类型,
   *   parallelIsStopTogether: 动画类型parallel是否联动,
   *   staggerDelayTime: 动画类型stagger延迟时间
   * }
   *
   * @return Promise (@param isFinish 动画是否完成)
   */
  start = async (
    configs, 
    { 
      duration = this.props.defaultDuration, 
      easing = this.props.defaultEasing, 
      frameCallback = this.props.defaultFrameCallback, 
      callback = this.props.defaultCallback, 
      animationType = this.props.defaultAnimationType 
    } = {}) => {}
```

停止动画:
```js
  /**
   * @return result 动画结果信息(false: 无动画):
   * {
   *   name: 样式名,
   *   value: 当前样式值,
   *   num: 当前动画值,
   *   inputRange: 动画值区间,
   *   outputRange: 样式值区间,
   *   isFinish: 是否结束
   * }
   */
  stop = () => {}
```
### 示例
![screenshot](https://raw.github.com/thisXY/react-native-animated-view/master/example/demo.gif)
```js
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Easing, StyleSheet } from 'react-native';
import AnimatedView from 'react-native-animated-view';

class Example extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.animatedViewRef = null;
  }

  /**
   * 启动1
   */
  start1 = () => {
    this.animatedViewRef.start({
      backgroundColor: '#999',
      // 10作为初始值将覆盖当前样式值(如最初始的30),所以每次启动start1可能都会抖动一下
      marginTop: [10, 60],
      paddingVertical: 50,
      height: 200,
      transform: [{ rotate: '50deg' }],
    },{
      // 将覆盖默认动画时间1000
      duration: 3000,
      // 将覆盖默认结束回调
      callback: isFinish => {
        console.log('isFinish_1:', isFinish);
      }
    });
  }

  /**
   * 启动2
   */
  start2 = async () => {
    const isFinish = await this.animatedViewRef.start([
      {
        name: 'paddingVertical',
        value: 0,
      },
      {
        name: 'backgroundColor',
        initValue: '#666',
        value: '#FFF',
        duration: 2000,
        easing: Easing.linear,
      },
      {
        name: 'transform',
        value: [{ rotate: '-30deg', scale: 0.6 }],
        duration: 3000,
        frameCallback: info => {
          console.log('transform_frameCallback:', info);
        },
      },
      {
        name: 'height',
        value: 500,
        easing: Easing.bezier(0.76, 0.00, 0.24, 1.00),
      },
    ], {
      frameCallback: info => {
        console.log('setting_frameCallback:', info);
      },
    });
    console.log('isFinish_2:', isFinish);
  }

  /**
   * 停止
   */
  stop = () => {
    const result = this.animatedViewRef.stop();
    console.log('stop result:', result);
  }

  render() {
    return (
      <View style={styles.container}>
        <AnimatedView
          style={styles.animatedView}
          ref={ref => this.animatedViewRef = ref}
          defaultDuration={1000}
          defaultCallback={isFinish => {
            console.log('isFinish_default:', isFinish);
          }}
        >
          <Text style={styles.children}>AnimatedView</Text>
        </AnimatedView>
        <View style={styles.buttonBorder}>
          <TouchableOpacity
            style={styles.button}
            onPress={this.start1}
          >
            <Text>Start1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={this.start2}
          >
            <Text>Start2</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonStop]}
            onPress={this.stop}
          >
            <Text>Stop</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  animatedView: {
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  children: {
    marginVertical: 20,
  },
  buttonBorder: {
    flexDirection: 'row',
    marginTop: 30,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    marginRight: 30,
    backgroundColor: '#FFF',
  },
  buttonStop: {
    marginRight: 0,
  },
});

export default Example;

```
### 源码
```
https://github.com/thisXY/react-native-animated-view
```
### react native动画组件推荐
```
https://github.com/thisXY/react-native-easing 

react native easing的一些别名封装和自定义封装,让你可以更好地使用easing
```
```
https://github.com/thisXY/react-native-touchable-view 

你可以依赖这个TouchableView的长按,滑动,X轴滑动,Y轴滑动,长按后滑动等手势响应得到回调和一系列参数(如相对父组件x、y坐标,相对页面x、y坐标,x轴位移、y轴位移)处理你的业务(如手势动画)
```

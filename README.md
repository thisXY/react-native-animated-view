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

| parameter              | type                                          | required | default                  | description                                                                                                                                                                                                                        
| :--------------------- | :-------------------------------------------- | :------- | :------------------------| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| children               | oneOfType([element, array(arrayOf(element))]) | no       | null                     | 子组件                                                                                                                                                                                                                     
| animationElement       | func                                          | no       | Animated.View            | 动画元素
| style                  | oneOfType([number, object, array])            | no       |                          | 样式    
| defaultAnimationType   | oneOf(['sequence', 'parallel'])               | no       | parallel                 | 动画类型 <br><br>sequence: 顺序执行<br><br>parallel: 同时执行
| defaultEasing          | func                                          | no       | Easing.inOut(Easing.ease)| 默认动画函数
| defaultDuration        | number                                        | no       | 500                      | 默认动画时间 (ms)
| defaultCallback        | func                                          | no       |                          | 默认结束回调 (<br><br>isFinish: 动画是否完成<br><br>)
| defaultFrameCallback   | func                                          | no       |                          | 默认动画帧回调 (<br><br>info: 当前帧信息{<br><br>name: 样式名, <br><br>value: 当前样式值, <br><br>num: 当前动画值, <br><br>inputRange: 动画值区间, <br><br>outputRange: 样式值区间, <br><br>isFinish: 是否结束<br><br>})

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
   *   // 动画帧回调 (@param info 当前动画帧信息 {value: 当前样式值, num: 当前动画值, inputRange: 动画值区间, outputRange: 样式值区间, isFinish: 是否结束})
   *   frameCallback,
   * }]
   *
   * 对象: { 样式名: 样式值 || [初始样式值, 样式值] }
   *
   *
   * @param 动画参数配置(configs配置将覆盖此配置 缺省使用默认) {duration: 动画时间, easing: 动画函数, frameCallback: 动画帧回调, callback: 结束回调, animationType: 动画类型}
   *
   * @return Promise (@param isFinish 动画是否完成)
   */
  start = async (configs, { duration = this.props.defaultDuration, easing = this.props.defaultEasing, frameCallback = this.props.defaultFrameCallback, callback = this.props.defaultCallback, animationType = this.props.defaultAnimationType } = {}) => {}
```

停止动画:
```js
  /**
   * @return result 动画结果信息(false: 无动画): {name: 样式名, value: 当前样式值, num: 当前动画值, inputRange: 动画值区间, outputRange: 样式值区间, isFinish: 是否结束}
   */
  stop = () => {}
```
### 示例
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

https://github.com/thisXY/react-native-animated-view

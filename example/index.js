import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Easing, StyleSheet } from 'react-native';
import AnimatedView from '../src';

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
        value: [{ rotate: '-30deg' }, { scale: 1 }],
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

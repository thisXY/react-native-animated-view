import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, Easing, StyleSheet, UIManager, findNodeHandle } from 'react-native';
import { gradualChange, radToDeg } from './utils';

/**
 * 动画View
 */
class AnimatedView extends Component {
  static propTypes = {
    children: PropTypes.node,
    // 动画元素
    animationElement: PropTypes.func,
    // 样式
    style: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
    /**
     * 是否启用原生动画驱动 (启用原生动画驱动几乎不会有UI卡顿)
     * 目前RN仅支持其中样式['transform', 'opacity', 'shadowOffset', 'shadowRadius', 'shadowOpacity', 'textShadowOffset', 'textShadowRadius']
     * 若尝试启动非支持样式的原生动画驱动, start()将返回false示意无法启动
     * 由于RN机制该设置一旦设定将不可切换 (你可以创建一个新的AnimatedView切换该设置)
     */
    isUseNativeDriver: PropTypes.bool,
    // 默认动画类型 (sequence: 顺序执行, parallel: 同时执行)
    defaultAnimationType: PropTypes.oneOf(['sequence', 'parallel']),
    // 默认动画函数
    defaultEasing: PropTypes.func,
    // 默认动画时间 (ms)
    defaultDuration: PropTypes.number,
    /**
     * 默认动画帧回调
     * @param info 当前动画帧信息 {name: 样式名, value: 当前样式值, num: 当前动画值, inputRange: 动画值区间, outputRange: 样式值区间, isFinish: 是否结束}
     */
    defaultFrameCallback: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
    /**
     * 默认结束回调
     * @param isFinish 动画是否完成
     */
    defaultCallback: PropTypes.func,
  };

  static defaultProps = {
    children: null,
    animationElement: Animated.View,
    style: null,
    isUseNativeDriver: false,
    defaultAnimationType: 'parallel',
    defaultEasing: Easing.inOut(Easing.ease),
    defaultDuration: 500,
    defaultFrameCallback: null,
    defaultCallback: isFinish => isFinish,
  }

  constructor(props) {
    super(props);

    this.state = {
      // 动画样式
      animationStyle: {},
    };
    this.animationRef = null;
    // 当前动画配置
    this.animationConfigs = [];
    // 历史动画
    this.animations = {};
    // 是否启用原生动画驱动
    this.isUseNativeDriver = props.isUseNativeDriver;
  }

  componentWillUnmount() {
    // 清除所有动画监听
    Object.keys(this.animations).forEach(configName => {
      this.animations[configName].animation.removeAllListeners();
    });
  }

  /**
   * 启动动画
   *
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
  start = async (
    configs,
    {
      duration = this.props.defaultDuration,
      easing = this.props.defaultEasing,
      frameCallback = this.props.defaultFrameCallback,
      callback = this.props.defaultCallback,
      animationType = this.props.defaultAnimationType,
    } = {}) => {
    const animations = [];
    const animationStyle = { ...this.state.animationStyle };
    const configList = [];

    // 初始化动画设置
    if (Array.isArray(configs)) {
      for (const config of configs) {
        configList.push({ duration, easing, frameCallback, configName: config.name, ...config });
      }
    }
    else if (typeof configs === 'object') {
      for (const name of Object.keys(configs)) {
        const config = {
          name,
          configName: name,
          duration,
          easing,
          frameCallback,
        };
        if (Array.isArray(configs[name]) && (Object.prototype.toString.call(configs[name][0]) !== '[object Object]' || name !== 'transform')) {
          if (configs[name].length === 2) {
            config.initValue = configs[name][0];
            config.value = configs[name][1];
          }
          else {
            config.value = configs[name][0];
          }
        }
        else {
          config.value = configs[name];
        }
        configList.push(config);
      }
    }

    // 原生动画驱动
    if (this.isUseNativeDriver && configList.filter(config => ['transform', 'opacity', 'shadowOffset', 'shadowRadius', 'shadowOpacity', 'textShadowOffset', 'textShadowRadius'].includes(config.name)).length !== configList.length) {
      // 无法启动
      return false;
    }

    // 停止动画
    this.stop();

    // 设置动画
    this.animationConfigs = [];
    for (const config of configList) {
      if (Array.isArray(config.value)) {
        animationStyle[config.name] = animationStyle[config.name] ? [...animationStyle[config.name]] : [];
        for (const value of config.value) {
          const valueKeys = Object.keys(value);
          const valueConfig = {
            ...config,
            name: valueKeys[0],
            configName: `${config.name}_${valueKeys[0]}`,
            value: value[valueKeys[0]],
            initValue: Array.isArray(config.initValue) && (config.initValue.find(initValue => Object.keys(initValue)[0] === valueKeys[0]) || {})[valueKeys[0]] || undefined,
          };
          valueConfig.value = radToDeg(valueConfig.value);
          valueConfig.initValue = radToDeg(valueConfig.initValue);
          const animation = await this._getAnimation(valueConfig);
          this.animationConfigs.push(valueConfig);
          animationStyle[config.name] = animationStyle[config.name].filter(style => Object.keys(style)[0] !== valueKeys[0]);
          animationStyle[config.name].push({
            [valueKeys[0]]: animation.animation.interpolate({
              inputRange: animation.inputRange,
              outputRange: animation.outputRange,
            }),
          });
          animations.push(Animated.timing(animation.animation, {
            toValue: animation.inputRange[animation.inputRange.length - 1],
            duration: valueConfig.duration,
            easing: valueConfig.easing,
            useNativeDriver: this.isUseNativeDriver,
          }));
        }
      }
      else if (Object.prototype.toString.call(config.value) === '[object Object]') {
        animationStyle[config.name] = animationStyle[config.name] ? { ...animationStyle[config.name] } : {};
        for (const valueKey of Object.keys(config.value)) {
          const valueConfig = {
            ...config,
            name: valueKey,
            configName: `${config.name}_${valueKey}`,
            value: config.value[valueKey],
            initValue: config.initValue && config.initValue[valueKey],
          };
          const animation = await this._getAnimation(valueConfig);
          this.animationConfigs.push(valueConfig);
          animationStyle[config.name][valueKey] = animation.animation.interpolate({
            inputRange: animation.inputRange,
            outputRange: animation.outputRange,
          });
          animations.push(Animated.timing(animation.animation, {
            toValue: animation.inputRange[animation.inputRange.length - 1],
            duration: valueConfig.duration,
            easing: valueConfig.easing,
            useNativeDriver: this.isUseNativeDriver,
          }));
        }
      }
      else {
        const animation = await this._getAnimation(config);
        this.animationConfigs.push(config);
        animationStyle[config.name] = animation.animation.interpolate({
          inputRange: animation.inputRange,
          outputRange: animation.outputRange,
        });
        animations.push(Animated.timing(animation.animation, {
          toValue: animation.inputRange[animation.inputRange.length - 1],
          duration: config.duration,
          easing: config.easing,
          useNativeDriver: this.isUseNativeDriver,
        }));
      }
    }

    return new Promise(resolve => {
      // 更新动画样式
      this.setState({ animationStyle }, () => {
        // 启动动画
        switch (animationType) {
          // 顺序执行
          case 'sequence':
            Animated.sequence(animations).start(result => {
              callback(result.finished);
              resolve(result.finished);
            });
            break;
          // 同时执行
          case 'parallel':
            Animated.parallel(animations).start(result => {
              callback(result.finished);
              resolve(result.finished);
            });
            break;
        }
      });
    });
  }

  /**
   * 停止动画
   * @return result 动画结果信息(false: 无动画): {name: 样式名, value: 当前样式值, num: 当前动画值, inputRange: 动画值区间, outputRange: 样式值区间, isFinish: 是否结束}
   */
  stop = () => {
    if (this.animationConfigs.length > 0) {
      const result = [];
      this.animationConfigs.forEach(animationConfig => {
        this.animations[animationConfig.configName].animation.stopAnimation(num => {
          const inputRange = [...this.animations[animationConfig.configName].inputRange];
          const outputRange = [...this.animations[animationConfig.configName].outputRange];
          const value = this._getValue(outputRange[0], outputRange[1], num);
          // 更新历史动画
          this._updateAnimation(animationConfig.configName, this.animations[animationConfig.configName].style, value);

          result.push({
            name: animationConfig.configName,
            value,
            num,
            inputRange,
            outputRange,
            isFinish: num === inputRange[inputRange.length - 1],
          });
        });
      });
      return result;
    }
    return false;
  }

  /**
   * 获取动画
   * @param config 动画配置
   * @private
   */
  _getAnimation = async config => {
    let animation = this.animations[config.configName];
    // 新动画
    if (!animation) {
      // 创建动画
      animation = await this._createAnimation(config);
    }
    // 历史动画
    else {
      // 更新历史动画
      animation = this._updateAnimation(config.configName, animation.style, config.initValue || animation.outputRange[1], config.value);
    }
    // 动画帧监听
    animation.animation.removeAllListeners();
    // 有帧回调 || 启动原生动画驱动
    if (config.frameCallback || this.isUseNativeDriver) {
      animation.animation.addListener(num => {
        config.frameCallback && config.frameCallback({
          name: config.configName,
          value: this._getValue(animation.outputRange[0], animation.outputRange[1], num.value),
          num: num.value,
          inputRange: animation.inputRange,
          outputRange: animation.outputRange,
          isFinish: num.value === animation.inputRange[animation.inputRange.length - 1],
        });
      });
    }
    return animation;
  }

  /**
   * 创建动画
   * @param config 动画配置
   * @private
   */
  _createAnimation = async config => {
    const style = StyleSheet.flatten(this.props.style) || {};
    const animation = {
      animation: new Animated.Value(0),
      inputRange: [0, 1],
    };

    // 属性样式值
    const configNames = config.configName.split('_');
    if (configNames.length > 1 && style[configNames[0]]) {
      if (Array.isArray(style[configNames[0]])) {
        animation.style = (style[configNames[0]].find(item => Object.keys(item)[0] === configNames[1]) || {})[configNames[1]];
      }
      else {
        animation.style = style[configNames[0]][configNames[1]];
      }
    }
    else {
      animation.style = style[config.configName];
    }

    // 初始值
    let initValue = config.initValue;
    if (initValue === undefined && animation.style !== undefined) {
      initValue = animation.style;
    }
    if (initValue === undefined) {
      // 颜色
      if (config.name === 'color' || config.name.indexOf('Color') !== -1) {
        initValue = 'transparent';
      }
      // transform
      else if (['rotate', 'rotateX', 'rotateY', 'rotateZ', 'skewX', 'skewY'].includes(config.name)) {
        initValue = '0deg';
      }
      else if (['scale', 'scaleX', 'scaleY', 'opacity'].includes(config.name)) {
        initValue = 1;
      }
      else {
        // 测量
        const measure = name => {
          if (this.animationRef) {
            return new Promise(resolve => {
              UIManager.measure(findNodeHandle(this.animationRef), (x, y, width, height) => {
                resolve(name === 'width' ? width : height);
              });
            });
          }
          return 0;
        };

        switch (config.configName) {
          case 'width':
          case 'height':
            initValue = await measure(config.configName);
            break;
          // 替值样式处理
          case 'paddingTop':
          case 'paddingBottom':
            initValue = style.paddingVertical || style.padding || 0;
            break;
          case 'paddingRight':
          case 'paddingLeft':
            initValue = style.paddingHorizontal || style.padding || 0;
            break;
          case 'paddingVertical':
          case 'paddingHorizontal':
            initValue = style.padding || 0;
            break;
          case 'marginTop':
          case 'marginBottom':
            initValue = style.marginVertical || style.margin || 0;
            break;
          case 'marginRight':
          case 'marginLeft':
            initValue = style.marginHorizontal || style.margin || 0;
            break;
          case 'marginVertical':
          case 'marginHorizontal':
            initValue = style.margin || 0;
            break;
          default:
            initValue = 0;
            break;
        }
      }
    }

    animation.outputRange = [initValue, config.value];

    // 更新历史动画
    this.animations[config.configName] = animation;
    return animation;
  }

  /**
   * 更新动画
   * @param configName 配置样式名
   * @param style 属性样式值
   * @param initValue 初始样式值
   * @param value 结果样式值
   * @private
   */
  _updateAnimation = (configName, style, initValue, value = initValue) => {
    const animation = {
      animation: new Animated.Value(0),
      style,
      inputRange: [0, 1],
      outputRange: [initValue, value],
    };

    // 清除监听
    this.animations[configName].animation.removeAllListeners();
    // 更新历史动画
    this.animations[configName] = animation;
    return animation;
  }

  /**
   * 删除动画
   * @param configName 配置样式名
   * @private
   */
  _deleteAnimation = configName => {
    this.animationConfigs = this.animationConfigs.filter(animationConfig => animationConfig.configName !== configName);
    delete this.animations[configName];
  }

  /**
   * 获取样式值
   * @param startValue 启动样式值
   * @param finishValue 完成样式值
   * @param num 动画值参数
   * @return 样式值
   * @private
   */
  _getValue = (startValue, finishValue, num) => {
    // 数值
    if (typeof startValue === 'number') {
      return startValue + (finishValue - startValue) * num;
    }

    const value = startValue.split('deg');
    // transform
    if (value.length === 2) {
      return `${parseFloat(startValue) + (parseFloat(finishValue) - parseFloat(startValue)) * num}deg`;
    }

    // 色值
    return gradualChange(startValue, finishValue, num);
  }

  render() {
    const AnimationElement = this.props.animationElement;
    const style = StyleSheet.flatten(this.props.style) || {};
    const animationStyle = {};
    Object.keys(this.state.animationStyle).forEach(key1 => {
      switch (Object.prototype.toString.call(this.state.animationStyle[key1])) {
        case '[object Object]':
          if (this.state.animationStyle[key1]._interpolation) {
            let isSetStyle = true;
            if (this.animations[key1]) {
              const newStyle = style[key1];
              const oldStyle = this.animations[key1].style;
              if (oldStyle !== newStyle) {
                isSetStyle = false;
              }
            }
            else {
              isSetStyle = false;
            }

            if (isSetStyle) {
              animationStyle[key1] = this.state.animationStyle[key1];
            }
            else {
              this._deleteAnimation(key1);
            }
          }
          else {
            Object.keys(this.state.animationStyle[key1]).forEach(key2 => {
              let isSetStyle = true;
              if (this.animations[`${key1}_${key2}`]) {
                const newStyle = style[key1] && style[key1][key2];
                const oldStyle = this.animations[`${key1}_${key2}`].style;
                if (oldStyle !== newStyle) {
                  isSetStyle = false;
                }
              }
              else {
                isSetStyle = false;
              }

              if (isSetStyle) {
                if (!animationStyle[key1]) animationStyle[key1] = {};
                animationStyle[key1][key2] = this.state.animationStyle[key1][key2];
              }
              else {
                this._deleteAnimation(`${key1}_${key2}`);
              }
            });
          }
          break;
        case '[object Array]':
          this.state.animationStyle[key1].forEach((val, key) => {
            const key2 = Object.keys(val)[0];
            let isSetStyle = true;

            if (this.animations[`${key1}_${key2}`]) {
              const newStyle = style[key1] && (style[key1].find(value => Object.keys(value)[0] === key2) || {})[key2];
              const oldStyle = this.animations[`${key1}_${key2}`].style;
              if (oldStyle !== newStyle) {
                isSetStyle = false;
              }
            }
            else {
              isSetStyle = false;
            }

            if (isSetStyle) {
              if (!animationStyle[key1]) animationStyle[key1] = [];
              animationStyle[key1].push({ [key2]: this.state.animationStyle[key1][key][key2] });
            }
            else {
              this._deleteAnimation(`${key1}_${key2}`);
            }
          });
          break;
      }
    });

    return (
      <AnimationElement
        style={[
          this.props.style,
          animationStyle,
        ]}
        ref={ref => this.animationRef = ref}
      >
        {this.props.children}
      </AnimationElement>
    );
  }
}

export default AnimatedView;

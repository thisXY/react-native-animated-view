import { StyleSheet } from 'react-native';
import Color from './Easycolor';

/**
 * 合并
 * @param styles 原样式: (多重)数组样式对象、 动画插值样式
 * @param isDepth 是否深度合并
 */
const merge = (styles, isDepth = true) => {
  if (isDepth && Array.isArray(styles)) {
    let result = {};
    const objectStyle = {};
    const merge = styles => {
      styles.forEach(style => {
        if (typeof style === 'number') {
          style = StyleSheet.flatten(style);
        }
        if (!style) {
          return;
        }
        if (Array.isArray(style)) {
          merge(style);
        }
        else {
          Object.keys(style).forEach(key => {
            if (Array.isArray(style[key])) {
              if (!objectStyle[key]) {
                objectStyle[key] = [];
              }
              const keys = style[key].map(style => Object.keys(style)[0]);
              objectStyle[key] = objectStyle[key].filter(style => !keys.includes(Object.keys(style)[0]));
              objectStyle[key] = [...objectStyle[key], ...style[key]];
            }
            else if (typeof (style[key]) === 'object' && !style[key]._interpolation) {
              if (!objectStyle[key]) {
                objectStyle[key] = {};
              }
              objectStyle[key] = { ...objectStyle[key], ...style[key] };
            }
          });
          result = { ...result, ...style };
        }
      });
    };
    merge(styles);
    return { ...result, ...objectStyle };
  }
  return StyleSheet.flatten(styles) || {};
};

/**
 * 颜色渐变
 * @param startColor 开始颜色
 * @param endColor 结束颜色
 * @param scale 变化程度比 (0 - 1)
 * @return 结果颜色 (rgba)
 */
const gradualChange = (startColor, endColor, scale = 1) => {
  let newColor = 'rgba(';
  const getColor = color => {
    color = Color(color).toRgbString();
    color = color.substring(color.split(',').length + 1, color.length - 1).split(',');
    if (color.length === 3) {
      color.push(1);
    }
    return color;
  };
  startColor = getColor(startColor);
  endColor = getColor(endColor);
  startColor.forEach((v, k) => {
    const v1 = parseFloat(v);
    const v2 = parseFloat(endColor[k]);
    const v3 = (v1 + (v2 - v1) * scale).toFixed(k === 3 ? 2 : 0);
    newColor += `${v3}${k === 3 ? ')' : ','}`;
  });

  return newColor;
};

/**
 * 弧度rad -> 角度deg
 * @param rad 弧度rad
 * @return 角度deg
 */
const radToDeg = rad => {
  const num = typeof rad === 'string' && rad.split('rad');
  if (num && num.length === 2 && num[1] === '') {
    return `${parseFloat(num[0]) * (180 / Math.PI)}deg`;
  }
  return rad;
};

export {
  merge,
  gradualChange,
  radToDeg,
};

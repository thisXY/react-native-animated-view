import Color from './Easycolor';

/**
 * 颜色渐变
 * @param color1 开始颜色
 * @param color2 结束颜色
 * @param scale 变化程度比 (0 - 1)
 * @return 结果颜色 (rgba)
 */
const gradualChange = (color1, color2, scale = 1) => {
  let newColor = 'rgba(';
  const getColor = color => {
    color = Color(color).toRgbString();
    color = color.substring(color.split(',').length + 1, color.length - 1).split(',');
    if (color.length === 3) {
      color.push(1);
    }
    return color;
  };
  color1 = getColor(color1);
  color2 = getColor(color2);
  color1.forEach((v, k) => {
    const v1 = parseFloat(v);
    const v2 = parseFloat(color2[k]);
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
  gradualChange,
  radToDeg,
};

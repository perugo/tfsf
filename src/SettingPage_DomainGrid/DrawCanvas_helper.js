import { useState, useEffect } from 'react';

const settingFields = ['fieldX', 'fieldY', 'totalPointsX', 'totalPointsY',
  'scatteredPointsX', 'freq', 'theta'];
const mediumFields = ['DielectricConstant', 'DielectricLoss', 'MagneticConstant', 'MagneticLoss'];


export function checker_DRAWDATA(obj1) {
  if (!obj1) return false;

  const requiredFields = {
    setting: (data) => {
      if (!data) return false;
      return settingFields.every(field => typeof data[field] === 'number');
    },
    medium: (data) => data && Array.isArray(data) && data.length >= 1 && data.every(mediumItem => {
      return mediumFields.every(field => typeof mediumItem[field] === 'number');
    }),
    bitmap: (data) => data && Array.isArray(data),
    clearBitmap: (data) => typeof data === 'boolean',
  }
  return Object.keys(requiredFields).every(key =>
    requiredFields[key](obj1[key])
  );
}
export function checker_NOCHANGE(obj1, obj2) {
  if (!obj1 || !obj2) return false;
  if (!check_SETTING_NOCHANGE(obj1.setting, obj2.setting)) return false;
  if (!check_MEDIUM_NOCHANGE(obj1.medium, obj2.medium)) return false;
  if (obj1.clearBitmap !== obj2.clearBitmap) return false;
  return true;
}

export function compare_ONLYFREQCHANGE(obj1, obj2) {
  if (!obj1 || !obj2) return false;
  const { medium: medium1, setting: setting1 } = obj1;
  const { medium: medium2, setting: setting2 } = obj2;

  if (!check_MEDIUM_NOCHANGE(medium1, medium2)) return false;
  const samesettingFields = ['fieldX', 'fieldY', 'totalPointsX', 'totalPointsY',
    'scatteredPointsX', 'theta'];
  if (!fieldsMatch(setting1, setting2, samesettingFields)) return false;
  return setting1.freq !== setting2.freq;
}

export function compare_ONLYMEDIUMCHANGE(obj1, obj2) {
  if (!obj1 || !obj2) return false;
  const { medium: medium1, setting: setting1 } = obj1;
  const { medium: medium2, setting: setting2 } = obj2;

  if (!check_SETTING_NOCHANGE(setting1, setting2)) return false;
  if (check_MEDIUM_NOCHANGE(medium1, medium2)) return true;

  return false;
}
export function compare_ONLYDOMAINGRIDCHANGE(obj1, obj2) {
  if (!obj1 || !obj2) return false;
  if (!check_MEDIUM_NOCHANGE(obj1.medium, obj2.medium)) return false;

  return check_DOMAINGRID_NOCHANGE(obj1.setting, obj2.setting);
}

export function check_SETTING_NOCHANGE(obj1, obj2) {
  if (!obj1 || !obj2) return false;
  if (fieldsMatch(obj1, obj2, settingFields)) return true;
  return false;
}

export function check_MEDIUM_NOCHANGE(obj1, obj2) {
  if (!obj1 || !obj2) return false;
  if (obj1.length !== obj2.length) return false;
  for (let i = 0; i < obj1.length; i++) {
    if (!fieldsMatch(obj1[i], obj2[i], mediumFields)) return false;
  }
  return true;
}

export function checker_CLEARBITMAP(obj, obj2) {
  if (!obj || !obj2) return false;
  return obj.clearBitmap;
}

export function maker_BITMAP(obj, totalPointsX, totalPointsY) {
  if (obj.length === 0) {
    const bitmap = Array.from({ length: totalPointsX }).map(() => Array.from({ length: totalPointsY }).fill(0));
    return bitmap;
  }
  let checker = true;

  if (obj.length !== totalPointsX) checker = false;
  if (!obj.every(subArray => Array.isArray(subArray) && subArray.length === totalPointsY)) checker = false;
  if (!checker) {
    const bitmap = Array.from({ length: totalPointsX }).map(() => Array.from({ length: totalPointsY }).fill(0));
    return bitmap;
  }

  return obj;
}

export function maker_clearBitmap(setBitmap, xnum, ynum) {
  const bitmap = Array.from({ length: xnum }).map(() => Array.from({ length: ynum }).fill(0));
  setBitmap(bitmap);
  return bitmap;
}
export function fieldsMatch(obj1, obj2, fields) {
  return fields.every(field => obj1[field] === obj2[field]);
}

export const useCanvasAndWidthHeight = (layoutWrapperRef, canvasRefs, ctxRefs, setWidth, setHeight, updateCounter) => {
  const [RECT, setRECT] = useState({ width: -1, height: -1 });
  useEffect(() => {
    if (!layoutWrapperRef.current) return;
    const { canvas1Ref, canvas2Ref, canvas3Ref, canvas4Ref } = canvasRefs;
    const { ctx1Ref, ctx2Ref, ctx3Ref, ctx4Ref } = ctxRefs;
    ctx1Ref.current = canvas1Ref.current.getContext('2d');
    ctx2Ref.current = canvas2Ref.current.getContext('2d');
    ctx3Ref.current = canvas3Ref.current.getContext('2d');
    ctx4Ref.current = canvas4Ref.current.getContext('2d');

    const Rect = layoutWrapperRef.current.getBoundingClientRect();
    if (Rect.width === RECT.width && Rect.height === RECT.height) return;
    setRECT(Rect);
    setWidth(Rect.width);
    setHeight(Rect.height);
    [canvas1Ref, canvas2Ref, canvas3Ref, canvas4Ref].forEach(canvasRef => {
      canvasRef.current.width = Rect.width;
      canvasRef.current.height = Rect.height;
    });

  }, [layoutWrapperRef, canvasRefs, ctxRefs, setWidth, setHeight, updateCounter]);
};

export const compare_RectNOCHANGE = (prevRect, width, height) => {
  return (prevRect.current.width === width && prevRect.current.height === height);
}

export function line_triangle(x1, y1, x2, y2, s, ctx1, sentence) {
  const space = 20;
  const tip_space = 3;

  const isVertical = (x1 === x2);

  if (isVertical) {
    x1 += space;
    x2 += space;
    y1 += tip_space;
    y2 -= tip_space;
  } else {
    x1 += tip_space;
    x2 -= tip_space;
    y1 -= space;
    y2 -= space;
  }
  ctx1.strokeStyle = "rgba(0,0,0,0.7)";
  ctx1.lineWidth = 1;
  ctx1.beginPath();
  ctx1.moveTo(x1, y1);
  ctx1.lineTo(x2, y2);
  ctx1.stroke();

  if (sentence != "") {
    drawSentence(x1, y1, x2, y2, sentence, ctx1);
  }

  drawTriangle(x1, y1, s, isVertical ? 0.5 : 0, ctx1);
  drawTriangle(x2, y2, s, isVertical ? 1.5 : 1, ctx1);
}
function drawTriangle(x, y, s, rot, ctx) {
  const vector = 1 / 8;
  ctx.beginPath();
  ctx.moveTo(x, y);
  var cos_x = Math.cos(rot * Math.PI + Math.PI * vector);
  var sin_y = Math.sin(rot * Math.PI + Math.PI * vector);
  ctx.lineTo(x + s * cos_x, y + s * sin_y);
  cos_x = Math.cos(rot * Math.PI - Math.PI * vector);
  sin_y = Math.sin(rot * Math.PI - Math.PI * vector);
  ctx.lineTo(x + s * cos_x, y + s * sin_y);
  ctx.closePath();
  ctx.strokeStyle = "rgba(0,0,0,0.7)"; //枠線の色
  ctx.stroke();
  ctx.fillStyle = "rgba(0,0,0,0.7)";//塗りつぶしの色
  ctx.fill();
}
function drawSentence(x1, y1, x2, y2, sentence, ctx) {
  const isVertical = (x1 === x2);
  const textmargin = 3;

  if (isVertical) {
    ctx.textBaseline = 'left';
    ctx.textAlign = 'left';
    ctx.font = '500 20px "Times New Roman", serif';
    ctx.fillStyle = "rgba(0,0,0,1.0)";
    ctx.fillText(sentence, x1 + textmargin, (y2 - y1) * 0.53);
  } else {
    ctx.textBaseline = 'center';
    ctx.textAlign = 'center';
    ctx.font = '500 20px "Times New Roman", serif';
    ctx.fillStyle = "rgba(0,0,0,1.0)";
    ctx.fillText(sentence, (x2 - x1) / 2, y1 - textmargin);
  }
}

export function sentence(x1, x2, y1, ctx1, str_sentence) {
  ctx1.font = '500 18px times new roman,serif';
  ctx1.fillStyle = "rgba(0,0,0,1.0)";
  ctx1.textBaseline = 'center';
  ctx1.textAlign = 'center';
  ctx1.fillText(str_sentence, (x2 - x1) / 2, y1 + 10);
}

export const getStrLambda = (lambdaValue) => {
  let value; let unit;
  if (lambdaValue > 1) {
    value = lambdaValue;
    unit = 'm';
  } else if (lambdaValue > 0.001) {
    value = lambdaValue * 1e3;
    unit = 'mm';
  } else if (lambdaValue > 1e-6) {
    value = lambdaValue * 1e6;
    unit = 'µm';
  } else {
    value = lambdaValue * 1e-9;
    unit = 'nm';
  }
  value = roundToFourSignificantFigures(value);
  return `${value} ${unit}`;
};
function roundToFourSignificantFigures(num) {
  if (num === 0) {
    return 0; // 0は特別に扱う
  }
  let d = Math.ceil(Math.log10(num < 0 ? -num : num)); // 数の大きさの桁数を求める
  let power = 4 - d; // 4桁の有効数字になるように桁を調整
  let magnitude = Math.pow(10, power);
  let shifted = Math.round(num * magnitude);
  return shifted / magnitude;
}

export function draw_canvas_background(ctx, canvasDx, xnum, ynum, scatteredPointsX, scatteredPointsY, totalPointsX, totalPointsY) {
  const WIDTH = canvasDx * xnum; const HEIGHT = canvasDx * ynum;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  line(0, 1, WIDTH, 1, 2, "black");
  line(1, 0, 1, HEIGHT, 2, "black");
  line(0, HEIGHT - 1, WIDTH, HEIGHT - 1, 2, "black");
  line(WIDTH - 1, 0, WIDTH - 1, HEIGHT, 2, "black");
  for (var i = scatteredPointsX; i < scatteredPointsX + totalPointsX; i++) {
    line(canvasDx * i, scatteredPointsY * canvasDx, canvasDx * i, canvasDx * (scatteredPointsY + totalPointsY), 1, "rgba(0,0,0,0.1)");
  }
  for (let n = scatteredPointsY; n < scatteredPointsY + totalPointsY; n++) {
    line(scatteredPointsX * canvasDx, n * canvasDx, canvasDx * (scatteredPointsX + totalPointsX), canvasDx * n, 1, "rgba(0,0,0,0.1)");
  }

  function line(x1, y1, x2, y2, w, col) {
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}


export function everyBitmapDraw(ctx, medium, width, canvasDx, scatteredPointsX, scatteredPointsY, totalPointsX, totalPointsY, bitmap, MEDIUM_COLOR) {
  if (medium.length <= 1 || width === 0) return;
  const sXm = scatteredPointsX * canvasDx;
  const sYm = scatteredPointsY * canvasDx;
  for (var i = 0; i < totalPointsX; i++) {
    for (var n = 0; n < totalPointsY; n++) {
      var c = bitmap[i][n];
      if (c === 0 || c >= medium.length) {
        ctx.clearRect(i * canvasDx + sXm, n * canvasDx + sYm, canvasDx + 1, canvasDx + 1)
        bitmap[i][n] = 0;
      } else {
        ctx.fillStyle = MEDIUM_COLOR[c];
        ctx.fillRect(i * canvasDx + sXm, n * canvasDx + sYm, canvasDx + 1, canvasDx + 1);
      }
    }
  }
}

export function draw_canvas(ctx, ctx1, fieldX, width, height, freq, totalPointsX, totalPointsY, scatteredPointsX, scatteredPointsY, canvasDx, theta, bitmap) {
  const lambdainCanvas = width / (fieldX / (3e8 / freq));
  const interval = lambdainCanvas; // 垂直な線の間隔
  const intervalNum = parseInt(fieldX / (3e8 / freq));

  let clipPoint = clipPointTheta(totalPointsX, totalPointsY, theta, bitmap);
  ctx.clearRect(0, 0, width, height);
  ctx1.clearRect(0, 0, width, height);
  ctx.save();

  ctx.beginPath();
  ctx.moveTo(clipPoint[0][0] * canvasDx + (scatteredPointsX * canvasDx), clipPoint[0][1] * canvasDx + scatteredPointsY * canvasDx);
  for (var i = 1; i < clipPoint.length; i++) {
    ctx.lineTo(clipPoint[i][0] * canvasDx + (scatteredPointsX * canvasDx), clipPoint[i][1] * canvasDx + (scatteredPointsY * canvasDx));
    //circle(clipPoint[i][0] * canvasDx + (scatteredPointsX * canvasDx), clipPoint[i][1] * canvasDx + scatteredPointsY * canvasDx, 3);
  }
  ctx.closePath();
  ctx.clip();

  const x_interval = interval * Math.cos((theta) * Math.PI / 180); // x軸方向の間隔
  const y_interval = +interval * Math.cos((theta - 90) * Math.PI / 180); // y軸方向の間隔
  const length = width * 2;
  const waveAngle = theta + 90;
  let centerX, centerY;
  if (theta < 90) {
    centerX = scatteredPointsX * canvasDx - 1;
    centerY = scatteredPointsY * canvasDx - 1;
  } else if (theta < 180) {
    centerX = (scatteredPointsX + totalPointsX) * canvasDx + 1;
    centerY = scatteredPointsY * canvasDx - 1;
  } else if (theta < 270) {
    centerX = (scatteredPointsX + totalPointsX) * canvasDx + 1;
    centerY = (scatteredPointsY + totalPointsY) * canvasDx + 1;
  } else {
    centerX = (scatteredPointsX) * canvasDx - 1;
    centerY = (scatteredPointsY + totalPointsY) * canvasDx + 1;
  }
  let x = centerX; let y = centerY;

  for (let i = 0; i < intervalNum * 2; i++) {
    drawFromCenter(x, y, waveAngle, length);
    x += x_interval;
    y += y_interval;
  }
  ctx.restore();

  
  for (let i = 0; i < totalPointsX; i++) {
    for (let n = 0; n < totalPointsY; n++) {
      if (bitmap[i][n] !== 0) {
        ctx.clearRect(scatteredPointsX * canvasDx + i * canvasDx, scatteredPointsY * canvasDx + n * canvasDx, canvasDx, canvasDx);
      }
    }
  }
  
  function drawFromCenter(X, Y, Ang, Len) {
    // 角度をラジアンに変換
    const radians = Ang * Math.PI / 180;

    // 線の両端の座標を計算
    const endX1 = X + Len / 2 * Math.cos(radians);
    const endY1 = Y + Len / 2 * Math.sin(radians);
    const endX2 = X - Len / 2 * Math.cos(radians);
    const endY2 = Y - Len / 2 * Math.sin(radians);

    line(endX1, endY1, endX2, endY2, 2, "rgba(0,0,255,0.5)");

    function line(x1, y1, x2, y2, w, col) {
      ctx.strokeStyle = col;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
  function circle(ix, iy, ir) {
    const x = parseInt(ix);
    const y = parseInt(iy);
    const r = parseInt(ir);
    ctx1.beginPath();
    ctx1.arc(x, y, r, 0, Math.PI * 2, true);
    ctx1.fillStyle = "rgb(0,250,0)";
    ctx1.fill();
    ctx1.strokeStyle = 'black';
    ctx1.lineWidth = 1;
    ctx1.stroke();
  }
}
function clipPointTheta(totalPointsX, totalPointsY, theta, bitmap) {
  let clipPoint;
  if (theta < 90) {
    clipPoint = clipPointTheta0_89(totalPointsX, totalPointsY, theta, bitmap);
  } else if (theta < 180) {
    clipPoint = clipPointTheta90_179(totalPointsX, totalPointsY, theta, bitmap);
  } else if (theta < 270) {
    clipPoint = clipPointTheta180_269(totalPointsX, totalPointsY, theta, bitmap);
  } else {
    clipPoint = clipPointTheta270_359(totalPointsX, totalPointsY, theta, bitmap);
  }
  return clipPoint;
}

function clipPointTheta0_89(totalPointsX, totalPointsY, theta, bitmap) {
  var clippoint = [];
  let i, n;
  const stepSize = 0.5;
  clippoint.push([Math.round(0), Math.round(totalPointsY)]);
  //clippoint.push([Math.round(totalPointsX), Math.round(totalPointsY)]);


  for (i = 0, n = totalPointsY - 1; n >= 0; n--) {
    let x = i;
    let y = n;
    let v = 0;
    while (v === 0 && (x >= 0 && x < totalPointsX - 1) && (y >= 0 && y < totalPointsY)) {
      x += stepSize * (Math.cos(theta * Math.PI / 180));
      y += stepSize * (Math.sin(theta * Math.PI / 180));
      v = bitmap[Math.round(x)][Math.round(y)];
    }
    //if (v === 0) { x += 1; }
    clippoint.push([Math.round(x), Math.round(y)]);
  }
  //clippoint[clippoint.length - 1][1] += 1;
  clippoint.push([Math.round(0), Math.round(0)]);


  for (i = 0, n = 0; i <= totalPointsX - 1; i++) {
    let x = i;
    let y = n;
    let v = 0;
    while (v === 0 && (x >= 0 && x < totalPointsX - 1) && (y >= 0 && y < totalPointsY)) {
      x += stepSize * (Math.cos(theta * Math.PI / 180));
      y += stepSize * (Math.sin(theta * Math.PI / 180));
      v = bitmap[Math.round(x)][Math.round(y)];
    }
    //if (v === 0) { x += 1; }
    clippoint.push([Math.round(x), Math.round(y)]);
  }
  clippoint.push([Math.round(0), Math.round(0)]);
  return clippoint;
}
function clipPointTheta90_179(totalPointsX, totalPointsY, theta, bitmap) {
  var clippoint = [];
  let i, n;

  const stepSize = 0.5;

  clippoint.push([Math.round(0), Math.round(0)]);

  for (i = 0, n = 0; i <= totalPointsX - 1; i++) {
    let x = i;
    let y = n;
    let v = 0;
    while (v === 0 && (x >= 0 && x <= totalPointsX - 1) && (y >= 0 && y < totalPointsY - 1)) {
      x += stepSize * (Math.cos(theta * Math.PI / 180));
      y += stepSize * (Math.sin(theta * Math.PI / 180));
      v = bitmap[Math.round(x)][Math.round(y)];
    }
   // if (y >= totalPointsY - 1) { y += 1; }

    clippoint.push([Math.round(x), Math.round(y)]);
  }

  clippoint.push([Math.round(totalPointsX), Math.round(0)]);

  for (i = totalPointsX - 1, n = 0; n <= totalPointsY - 1; n++) {
    let x = i;
    let y = n;
    let v = 0;
    while (v === 0 && (x >= 0 && x <= totalPointsX - 1) && (y >= 0 && y <= totalPointsY - 1)) {
      x += stepSize * (Math.cos(theta * Math.PI / 180));
      y += stepSize * (Math.sin(theta * Math.PI / 180));
      v = bitmap[Math.round(x)][Math.round(y)];
    }
    //if (y >= totalPointsY - 1) { y += 1; }
    clippoint.push([Math.round(x), Math.round(y)]);

  }
  clippoint.push([Math.round(totalPointsX), Math.round(0)]);

  return clippoint;
}
function clipPointTheta180_269(totalPointsX, totalPointsY, theta, bitmap) {
  var clippoint = [];
  let i, n;

  const stepSize = 0.5;

  clippoint.push([Math.round(totalPointsX), Math.round(0)]);

  for (i = totalPointsX - 1, n = 0; n <= totalPointsY - 1; n++) {
    let x = i;
    let y = n;
    let v = 0;
    while (v === 0 && (x >= 0 && x < totalPointsX) && (y >= 0 && y < totalPointsY)) {
      x += stepSize * (Math.cos(theta * Math.PI / 180));
      y += stepSize * (Math.sin(theta * Math.PI / 180));
      v = bitmap[Math.round(x)][Math.round(y)];
    }
    clippoint.push([Math.round(x), Math.round(y)]);

  }

  clippoint.push([Math.round(totalPointsX), Math.round(totalPointsY)]);

  for (i = totalPointsX, n = totalPointsY - 1; i >= 0; i--) {
    let x = i;
    let y = n;
    let v = 0;
    while (v === 0 && (x >= 0 && x < totalPointsX) && (y >= 0 && y <= totalPointsY)) {
      x += stepSize * (Math.cos(theta * Math.PI / 180));
      y += stepSize * (Math.sin(theta * Math.PI / 180));
      v = bitmap[Math.round(x)][Math.round(y)];
    }
    clippoint.push([Math.round(x), Math.round(y)]);
  }
  clippoint.push([0, Math.round(totalPointsY)]);

  clippoint.push([Math.round(totalPointsX) - 1, Math.round(totalPointsY)]);

  return clippoint;
}
function clipPointTheta270_359(totalPointsX, totalPointsY, theta, bitmap) {
  var clippoint = [];
  let i, n;

  const stepSize = 0.45;
  clippoint.push([Math.round(totalPointsX), Math.round(totalPointsY)]);

  for (i = totalPointsX - 1, n = totalPointsY - 2; i >= 0; i--) {
    let x = i;
    let y = n;
    let v = 0;
    while (v === 0 && (x >= 0 && x < totalPointsX - 1) && (y >= 0 && y < totalPointsY - 1)) {
      x += stepSize * (Math.cos(theta * Math.PI / 180));
      y += stepSize * (Math.sin(theta * Math.PI / 180));
      v = bitmap[Math.round(x)][Math.round(y)];
    }
    //if (x >= totalPointsX - 2) { x += 1; }

    clippoint.push([Math.round(x), Math.round(y)]);

  }

  clippoint.push([Math.round(0), Math.round(totalPointsY)]);

  for (i = 0, n = totalPointsY - 2; n >= 0; n--) {
    let x = i;
    let y = n;
    let v = 0;
    while (v === 0 && (x >= 0 && x < totalPointsX - 1) && (y >= 0 && y < totalPointsY - 1)) {
      x += stepSize * (Math.cos(theta * Math.PI / 180));
      y += stepSize * (Math.sin(theta * Math.PI / 180));
      v = bitmap[Math.round(x)][Math.round(y)];
    }
    //if (x >= totalPointsX - 2) { x += 1; }

    clippoint.push([Math.round(x), Math.round(y)]);
  }

  clippoint.push([Math.round(0), Math.round(totalPointsY)]);

  return clippoint;
}
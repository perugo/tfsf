import styled from "styled-components";
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { React } from 'react';

import {
  checker_DRAWDATA,
  checker_NOCHANGE,
  compare_ONLYFREQCHANGE,
  compare_RectNOCHANGE,
  check_DOMAINGRID_NOCHANGE,
  maker_BITMAP,
  useCanvasAndWidthHeight,
  line_triangle,
  sentence,
  getStrLambda
} from './DrawCanvas_helper';

const Canvas = styled.canvas`
  position:absolute;
  top:0;
  left:0;
  opacity:1.0;
`
const Container = styled.div`
  position:relative;
  width:100%;
  height:100%;
`
const Layout_Wrapper = styled.div`
  position:relative;
  width:100%;
  height:100%;
`
var canvasDx;
var feedPoint; //an Array of feedPoints
var bitmap;
var xnum;
var ynum;
var theta;
var totalPointsX;
var totalPointsY;
var scatteredPointsX;
var scatteredPointsY;
var fieldX;
var fieldY;
var freq;
let medium;
const MEDIUM_COLOR = ['rgb(255,255,255)', 'rgb(0,255,0)', 'rgb(255,0,0)', 'rgb(0,0,0)', 'rgb(255,225,0)'];

export const DrawCanvas = ({ drawData,originalDrawData }) => {
  const layoutWrapperRef = useRef(null); //canvasの親<div>Ref
  const prevDrawDataRef = useRef(null); //一つ前のdrawData
  const originalDrawDataRef=useRef(null);
  const prevRect = useRef(null);
  const ctx1Ref = useRef(null); const canvas1Ref = useRef(null);
  const ctx2Ref = useRef(null); const canvas2Ref = useRef(null);
  const ctx3Ref = useRef(null); const canvas3Ref = useRef(null);
  const ctx4Ref = useRef(null); const canvas4Ref = useRef(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [updateCounter, setUpdateCounter] = useState(0);

  const canvasRefs = useMemo(() => ({
    canvas1Ref, canvas2Ref, canvas3Ref, canvas4Ref
  }), [canvas1Ref, canvas2Ref, canvas3Ref, canvas4Ref]);
  const ctxRefs = useMemo(() => ({
    ctx1Ref, ctx2Ref, ctx3Ref, ctx4Ref
  }), [ctx1Ref, ctx2Ref, ctx3Ref, ctx4Ref]);

  useCanvasAndWidthHeight(layoutWrapperRef, canvasRefs, ctxRefs, setWidth, setHeight, updateCounter);
  useEffect(()=>{
    if (!checker_DRAWDATA(originalDrawData)) return;
    originalDrawDataRef.current=originalDrawData;
  },[originalDrawData])

  useEffect(() => {
    if (!checker_DRAWDATA(drawData) || width === 0 || originalDrawDataRef.current===null)return;
    if (checker_NOCHANGE(drawData, prevDrawDataRef.current) && compare_RectNOCHANGE(prevRect, width, height)) {
      console.log("DOMAIN : no change");
      return;
    } else if (compare_ONLYFREQCHANGE(prevDrawDataRef.current, drawData) && compare_RectNOCHANGE(prevRect, width, height)) {
      console.log("DOMAIN : only freq");
      freq = drawData.setting.freq;
      draw_canvas();
    }
    else {
      console.log("DOMAIN : everythin else");
      setUpdateCounter(c => c + 1);
      ctx1Ref.current = canvas1Ref.current.getContext('2d');
      ctx2Ref.current = canvas2Ref.current.getContext('2d');
      ctx3Ref.current = canvas3Ref.current.getContext('2d');
      ctx4Ref.current = canvas4Ref.current.getContext('2d');
      const { setting, bitmap: inputBitmap, medium: inputMedium } = drawData;
      const { fieldX: inputFieldX, fieldY: inputFieldY,
        totalPointsX: inputTotalPointsX, totalPointsY: inputTotalPointsY, scatteredPointsX: inputScatteredPointsX,
        freq: inputFreq, theta: inputTheta } = setting;

      freq = inputFreq;
      theta = inputTheta;
      totalPointsX = inputTotalPointsX;
      totalPointsY = inputTotalPointsY;
      scatteredPointsX = inputScatteredPointsX;
      fieldX = inputFieldX;
      xnum = inputTotalPointsX + inputScatteredPointsX * 2;
      let dx = fieldX / xnum;
      ynum = Math.ceil(inputFieldY / dx);
      fieldY = ynum * dx;
      canvasDx = width / xnum;
      medium = inputMedium;

      bitmap = maker_BITMAP(inputBitmap, totalPointsX, totalPointsY,originalDrawDataRef.current.setting,setting);
      draw_canvas_background(ctx4Ref.current, canvasDx, xnum, ynum, scatteredPointsX, scatteredPointsY, totalPointsX, totalPointsY);
      //draw_canvas();
      everyBitmapDraw(ctx2Ref.current, medium, width, canvasDx, scatteredPointsX, scatteredPointsY, totalPointsX, totalPointsY, bitmap, MEDIUM_COLOR);
      line_triangle(0, 0, 0, height, 10,ctx1Ref.current,getStrLambda(fieldY));
      line_triangle(0, height, width, height, 12,ctx1Ref.current, getStrLambda(fieldX));
      sentence(20, width, height - 20 * 3,ctx1Ref.current, `x軸の分解精度 ${xnum}`);
    }
    prevDrawDataRef.current = drawData;
    prevRect.current = { width: width, height: height };

  }, [drawData, width,originalDrawDataRef]);


  function everyBitmapDraw() {
    if (medium.length <= 1 || width === 0) return;
    for (var i = 0; i < totalPointsX; i++) {
      for (var n = 0; n < totalPointsY; n++) {
        var c = bitmap[i][n];
        if (c === 0 || c >= medium.length) {
          ctx2Ref.current.clearRect(i * canvasDx, n * canvasDx, canvasDx + 1, canvasDx + 1)
          bitmap[i][n] = 0;
        } else {
          ctx2Ref.current.fillStyle = MEDIUM_COLOR[c];
          ctx2Ref.current.fillRect(i * canvasDx, n * canvasDx, canvasDx + 1, canvasDx + 1);
        }

      }
    }
    draw_canvas();
  }

  function draw_canvas_background() {
    ctx4Ref.current.clearRect(0, 0, width, height);
    line(0, 1, width, 1, 2, "black");
    line(1, 0, 1, height, 2, "black");
    line(0, height - 1, width, height - 1, 2, "black");
    line(width - 1, 0, width - 1, height, 2, "black");
    for (var i = 0; i < xnum; i++) {
      line(canvasDx * i, 0, canvasDx * i, height, 1, "rgba(0,0,0,0.2)");
    }
    for (var i = 0; i < ynum; i++) {
      line(0, canvasDx * i, width, canvasDx * i, 1, "rgba(0,0,0,0.2)");
    }
    function line(x1, y1, x2, y2, w, col) {
      ctx4Ref.current.strokeStyle = col;
      ctx4Ref.current.lineWidth = w;
      ctx4Ref.current.beginPath();
      ctx4Ref.current.moveTo(x1, y1);
      ctx4Ref.current.lineTo(x2, y2);
      ctx4Ref.current.stroke();
    }
  }

  function draw_feedPoint() {
    ctx1Ref.current.clearRect(0, 0, width, height);
    feedPoint.forEach((fPoint, i) => {
      ctx1Ref.current.fillStyle = fPoint.color;
      ctx1Ref.current.fillRect(fPoint.x * canvasDx - 4, fPoint.y * canvasDx - 4, canvasDx + 8, canvasDx + 8);
    });
  }

  function draw_canvas() {
    ctx3Ref.current.clearRect(0, 0, width, height);

    feedPoint.forEach((fPoint, index) => {
      const scaleFactor = width / xnum;
      const mediumIndex = bitmap[fPoint.x][fPoint.y];
      const m = medium[mediumIndex];

      if (m.DielectricLoss !== 0 || m.MagneticLoss !== 0) return;

      let realRadius = 3e8/freq * width / fieldX;
      realRadius = realRadius / Math.sqrt(m.DielectricConstant * m.MagneticConstant);
      const numm = (height / realRadius) > (width / realRadius) ? height / realRadius : width / realRadius;
      let numCircles = (numm > 40) ? 40 : numm;
      ctx3Ref.current.save();

      let numbers = new Set();
      const mediumFields = ['DielectricConstant', 'DielectricLoss', 'MagneticConstant', 'MagneticLoss'];
      medium.forEach((mediumitem, index) => {
        const mediumMatch = mediumFields.every(field => m[field] === mediumitem[field]);
        if (mediumMatch) numbers.add(index)
      });

      var clippoint = [];
      var stepSize = 0.5;
      for (var deg = 0; deg < 2 * Math.PI; deg += 2 * Math.PI / 100) {
        var x = fPoint.x;
        var y = fPoint.y;
        var v = mediumIndex;
        while (numbers.has(v) && (x > 0 && x < xnum - 1) && (y > 0 && y < ynum - 1)) {
          x += stepSize * (Math.cos(deg));
          y += stepSize * (Math.sin(deg));
          v = bitmap[Math.round(x)][Math.round(y)];
        }
        clippoint.push([Math.round(x), Math.round(y)]);
      }
      ctx3Ref.current.beginPath();
      ctx3Ref.current.moveTo(clippoint[0][0] * scaleFactor, clippoint[0][1] * scaleFactor);
      for (var i = 1; i < clippoint.length; i++) {
        ctx3Ref.current.lineTo(clippoint[i][0] * scaleFactor, clippoint[i][1] * scaleFactor);
      }
      ctx3Ref.current.closePath();
      ctx3Ref.current.clip();

      const circleStrokeOpacity = feedPoint.length > 2 ? 0.2 : 0.4;

      const phasediff = (1 - fPoint.phase / 360);
      for (let i = 0; i < numCircles; i++) {
        ctx3Ref.current.beginPath();
        ctx3Ref.current.arc((fPoint.x + 0.5) * scaleFactor, (fPoint.y + 0.5) * scaleFactor, realRadius * phasediff + i * (realRadius), 0, 2 * Math.PI);
        ctx3Ref.current.strokeStyle = `rgba(0,0,255,${circleStrokeOpacity})`;
        ctx3Ref.current.lineWidth = 1;
        ctx3Ref.current.stroke();
      }
      ctx3Ref.current.restore();
    });
  }

  //格子線
  //青い円
  //障害物
  //赤い点
  return (
    <Container>
      <Layout_Wrapper ref={layoutWrapperRef}>
        <Canvas ref={canvas4Ref} />
        <Canvas ref={canvas3Ref} />
        <Canvas ref={canvas2Ref} style={{ opacity: 0.6 }} />
        <Canvas ref={canvas1Ref} />
      </Layout_Wrapper>
    </Container>
  )
};

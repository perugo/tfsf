import styled from "styled-components";
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { React } from 'react';

import {
  checker_DRAWDATA,
  checker_NOCHANGE,
  compare_ONLYFREQTHETACHANGE,
  compare_ONLYMEDIUMCHANGE,
  compare_RectNOCHANGE,
  maker_BITMAP,
  useCanvasAndWidthHeight,
  checker_CLEARBITMAP,
  maker_clearBitmap,
  check_BITMAPCHANGEOBJECTVALID,
  draw_canvas,
  draw_canvas_background,
  everyBitmapDraw
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
var drag; //ユーザーがマウスを押している状態かを取得する
var dragPoint;
var drag_source_index = -1;

var start_x; //ユーザーがマウスを押し始めたx座標
var start_y; //ユーザーがマウスを押し始めたy座標
var end_x; //ユーザーが現在マウスを押しているx座標
var end_y; //ユーザーが現在マウスを押しているy座標

var canvasDx;
var bitmap;
var fieldX;
var xnum;
var ynum;
var theta;
var totalPointsX;
var totalPointsY;
var scatteredPointsX;
var scatteredPointsY;
var freq;
var medium;
var objectIndex;

var TMPscatteredPointsX;
var TMPscatteredPointsY;
var TMPtotalPointsX;
var TMPtotalPointsY;

const MEDIUM_COLOR = ['rgb(255,255,255)', 'rgb(0,255,0)', 'rgb(255,0,0)', 'rgb(0,0,0)', 'rgb(255,225,0)'];
export const DrawCanvas = ({ drawData, setBitmap, selectedIndex, rect, setSetting }) => {
  const timeoutIdRef = useRef(); //draw_canvasを0.3秒経ってから実行する遅延用
  const layoutWrapperRef = useRef(null); //canvasの親<div>Ref
  const prevDrawDataRef = useRef(null); //一つ前のdrawData
  const prevRect = useRef(null);
  const ctx1Ref = useRef(null); const canvas1Ref = useRef(null);
  const ctx2Ref = useRef(null); const canvas2Ref = useRef(null);
  const ctx3Ref = useRef(null); const canvas3Ref = useRef(null);
  const ctx4Ref = useRef(null); const canvas4Ref = useRef(null);
  const timerbitmapRef = useRef(); //set_bitmapはbitmapを変えてから、0.5秒後に実行する遅延用
  const timeronMousemoveRef = useRef(null); //onMousemoveを0.1秒ごとに実行する遅延用
  const timerFieldRef = useRef(); //scatteredField totalFieldを変えてから、0.6秒後に実行する遅延用
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const canvasRefs = useMemo(() => ({
    canvas1Ref, canvas2Ref, canvas3Ref, canvas4Ref
  }), [canvas1Ref, canvas2Ref, canvas3Ref, canvas4Ref]);
  const ctxRefs = useMemo(() => ({
    ctx1Ref, ctx2Ref, ctx3Ref, ctx4Ref
  }), [ctx1Ref, ctx2Ref, ctx3Ref, ctx4Ref]);
  useCanvasAndWidthHeight(layoutWrapperRef, setWidth, setHeight, rect);

  useEffect(() => {
    if (!checker_DRAWDATA(drawData) || width === 0) return;
    if (checker_CLEARBITMAP(drawData, prevDrawDataRef.current) && compare_RectNOCHANGE(prevRect, width, height)) {
      console.log("clear bitmap");
      bitmap = maker_BITMAP([], setBitmap, totalPointsX, totalPointsY);
      draw_canvas(ctx3Ref.current, ctx1Ref.current, fieldX, width, height, freq, totalPointsX, totalPointsY, scatteredPointsX, scatteredPointsY, canvasDx, theta, bitmap);
      everyBitmapDraw(ctx2Ref.current, medium, width, canvasDx, scatteredPointsX, scatteredPointsY, totalPointsX, totalPointsY, bitmap, MEDIUM_COLOR);
      draw_canvas(ctx3Ref.current, ctx1Ref.current, fieldX, width, height, freq, totalPointsX, totalPointsY, scatteredPointsX, scatteredPointsY, canvasDx, theta, bitmap);
      everyBitmapDraw(ctx2Ref.current, medium, width, canvasDx, scatteredPointsX, scatteredPointsY, totalPointsX, totalPointsY, bitmap, MEDIUM_COLOR);

    } else if (checker_NOCHANGE(drawData, prevDrawDataRef.current) && compare_RectNOCHANGE(prevRect, width, height)) {
      console.log("no change");
      return;
    } else if (check_BITMAPCHANGEOBJECTVALID(prevDrawDataRef.current,drawData) && compare_RectNOCHANGE(prevRect, width, height)) {
      console.error("only bitmapChangeObject");
      bitmap = drawData.bitmapChangeObject;
      draw_canvas(ctx3Ref.current, ctx1Ref.current, fieldX, width, height, freq, totalPointsX, totalPointsY, scatteredPointsX, scatteredPointsY, canvasDx, theta, bitmap);
      everyBitmapDraw(ctx2Ref.current, medium, width, canvasDx, scatteredPointsX, scatteredPointsY, totalPointsX, totalPointsY, bitmap, MEDIUM_COLOR);
      startBitmapTimer();
    } else if (compare_ONLYFREQTHETACHANGE(prevDrawDataRef.current, drawData) && compare_RectNOCHANGE(prevRect, width, height)) {
      console.log("only freqTheta");
      freq = drawData.setting.freq;
      theta = drawData.setting.theta;
      draw_canvas(ctx3Ref.current, ctx1Ref.current, fieldX, width, height, freq, totalPointsX, totalPointsY, scatteredPointsX, scatteredPointsY, canvasDx, theta, bitmap);
    } else if (compare_ONLYMEDIUMCHANGE(prevDrawDataRef.current, drawData) && compare_RectNOCHANGE(prevRect, width, height)) {
      console.log("only medium");
      medium = drawData.medium;
      everyBitmapDraw(ctx2Ref.current, medium, width, canvasDx, scatteredPointsX, scatteredPointsY, totalPointsX, totalPointsY, bitmap, MEDIUM_COLOR);
      startBitmapTimer();
      //else if(compare_ONLYSCATTEREDFIELDCHANGE(prevDrawDataRef.current,drawData) && compare_RectNOCHANGE(prevRect,width,height)){}
    } else {
      console.log("change Everything");
      const { canvas1Ref, canvas2Ref, canvas3Ref, canvas4Ref } = canvasRefs;
      const { ctx1Ref, ctx2Ref, ctx3Ref, ctx4Ref } = ctxRefs;
      ctx1Ref.current = canvas1Ref.current.getContext('2d');
      ctx2Ref.current = canvas2Ref.current.getContext('2d');
      ctx3Ref.current = canvas3Ref.current.getContext('2d');
      ctx4Ref.current = canvas4Ref.current.getContext('2d');
      const Rect = layoutWrapperRef.current.getBoundingClientRect();
      [canvas1Ref, canvas2Ref, canvas3Ref, canvas4Ref].forEach(canvasRef => {
        canvasRef.current.width = Rect.width;
        canvasRef.current.height = Rect.height;
      });
      setWidth(Rect.width); setHeight(Rect.height);

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
      scatteredPointsY = parseInt((ynum - totalPointsY) / 2);
      ynum = totalPointsY + scatteredPointsY * 2;
      canvasDx = width / xnum;
      bitmap = maker_BITMAP(inputBitmap, setBitmap, totalPointsX, totalPointsY);
      medium = inputMedium;
      draw_canvas_background(ctx4Ref.current, canvasDx, xnum, ynum, scatteredPointsX, scatteredPointsY, totalPointsX, totalPointsY);
      //startTimer();
      draw_canvas(ctx3Ref.current, ctx1Ref.current, fieldX, width, height, freq, totalPointsX, totalPointsY, scatteredPointsX, scatteredPointsY, canvasDx, theta, bitmap);
      everyBitmapDraw(ctx2Ref.current, medium, width, canvasDx, scatteredPointsX, scatteredPointsY, totalPointsX, totalPointsY, bitmap, MEDIUM_COLOR);
      startBitmapTimer();

      TMPscatteredPointsX = scatteredPointsX;
      TMPscatteredPointsY = scatteredPointsY;
    }
    prevDrawDataRef.current = drawData;
    prevRect.current = { width: width, height: height };
    drag = false;
    dragPoint = false;
  }, [drawData, width, height]);
  useEffect(() => {
    const { canvas1Ref } = canvasRefs;
    canvas1Ref.current.addEventListener('mousedown', onMousedown, false); //canvas内でマウスを押した際、on_mousedown()メソッドを実行するアクションリスナーを作る
    canvas1Ref.current.addEventListener('mousemove', onMousemove, false); //canvas内でマウスを動かした際、on_mousemove()メソッドを実行するアクションリスナーを作る
    canvas1Ref.current.addEventListener('mouseup', onMouseup, false); //canvas内でマウスを離した際、on_mouseup()メソッドを実行するアクションリスナーを作る

    canvas1Ref.current.addEventListener('mouseenter', onMouseEnter, false);
    canvas1Ref.current.addEventListener('mouseleave', onMouseLeave, false);

    return () => {
      if (canvas1Ref.current) {
        canvas1Ref.current.removeEventListener('mousedown', onMousedown);
        canvas1Ref.current.removeEventListener('mousemove', onMousemove);
        canvas1Ref.current.removeEventListener('mouseup', onMouseup);
        canvas1Ref.current.removeEventListener('mouseenter', onMouseEnter);
        canvas1Ref.current.removeEventListener('mouseleave', onMouseLeave);
      }
    };
  }, [canvasRefs, width, height]);

  useEffect(() => {
    objectIndex = selectedIndex;
  }, [selectedIndex])

  const startTimer = () => {
    timeoutIdRef.current = setTimeout(handleTimeout, 300);
  };
  const handleTimeout = () => {
    draw_canvas(ctx3Ref.current, ctx1Ref.current, fieldX, width, height, freq, totalPointsX, totalPointsY, scatteredPointsX, scatteredPointsY, canvasDx, theta, bitmap);
  };
  const startBitmapTimer = () => {
    timerbitmapRef.current = setTimeout(handleBitmapTimeout, 500);
  }
  const handleBitmapTimeout = () => {
    const obj = bitmap;
    setBitmap(obj);
  };
  const handleUpdateField = (xCIE, yCIE, TPX, TPY) => {
    clearTimeout(timerFieldRef.current);
    if (TPX < 30 || TPY < 30) {
      return;
    }
    if(TPX>1.7*TPY || TPY>1.7*TPX){
      return;
    }
    timerFieldRef.current = setTimeout(handleFieldTimeout, 200);
    TMPscatteredPointsX = xCIE;
    TMPscatteredPointsY = yCIE;
    TMPtotalPointsX = TPX;
    TMPtotalPointsY = TPY;

    RecCirclePoint(ctx1Ref.current, TMPscatteredPointsX * canvasDx, TMPscatteredPointsY * canvasDx);
    //draw_canvas_background(ctx4Ref.current, canvasDx, xnum, ynum, xCIE, yCIE, TPX, TPY);

  }
  const handleFieldTimeout = () => {
    const obj = { ...drawData.setting,theta:theta, scatteredPointsX: TMPscatteredPointsX, totalPointsY: TMPtotalPointsY, totalPointsX: TMPtotalPointsX };
    console.log(drawData.setting);
    setSetting(obj);
    console.log(obj);
  }
  function onMousedown(e) {

    if (!drag && !dragPoint) {
      var rect = e.target.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var xCIE = Math.floor(x / canvasDx);
      var yCIE = Math.floor(y / canvasDx);
      if (scatteredPointsX - 4 < xCIE && scatteredPointsX + 4 > xCIE && scatteredPointsY - 4 < yCIE && scatteredPointsY + 4 > yCIE) {
        dragPoint = true;
        ctx3Ref.current.clearRect(0, 0, width, height);
        return;
      }
      xCIE -= scatteredPointsX;
      yCIE -= scatteredPointsY;
      if (0 < xCIE && totalPointsX < xCIE && 0 < yCIE && totalPointsY < yCIE) {
        drag = false;
        drag_source_index = -1;
        return;
      }
      drag_source_index = objectIndex;
      start_x = x; start_y = y;
      end_x = start_x; end_y = start_y;
      bitmap_set(xCIE, yCIE, objectIndex);
      startTimer();
      drag = true;
    }

  }

  function onMousemove(e) {
    if (!timeronMousemoveRef.current) {
      if (drag) {
        var rect = e.target.getBoundingClientRect();
        end_x = e.clientX - rect.left;
        end_y = e.clientY - rect.top;
        draw();
      } else if (dragPoint) {
        var rect = e.target.getBoundingClientRect();
        var x = (e.clientX - rect.left);
        var y = (e.clientY - rect.top);
        var xCIE = Math.floor(x / canvasDx);
        var yCIE = Math.floor(y / canvasDx);
        const tmpTPX = parseInt((xnum - xCIE * 2));
        const tmpTPY = parseInt((ynum - yCIE * 2));
        handleUpdateField(xCIE, yCIE, tmpTPX, tmpTPY);
      }
    }
    timeronMousemoveRef.current = setTimeout(() => {
      timeronMousemoveRef.current = null;
    }, 100);
  }

  function onMouseup(e) {
    drag = false;
    drag_source_index = -1;
    dragPoint = false;
    //draw();
  }

  function onMouseEnter(e) {
    if (ctx1Ref.current) {
      RecCirclePoint(ctx1Ref.current, scatteredPointsX * canvasDx, scatteredPointsY * canvasDx);
    }
  }

  function onMouseLeave(e) {
    if (ctx1Ref.current) {
      ctx1Ref.current.clearRect(0, 0, width, height);
    }
  }
  function bitmap_set(xCIE, yCIE, i) {
    clearTimeout(timerbitmapRef.current);
    if (xCIE >= 0 && xCIE < totalPointsX && yCIE >= 0 && yCIE < totalPointsY) {
      bitmap[xCIE][yCIE] = objectIndex;
    } else {
      return;
    }
    startBitmapTimer();
    if (i === 0) {
      ctx2Ref.current.clearRect((xCIE + scatteredPointsX) * canvasDx, (yCIE + scatteredPointsY) * canvasDx, canvasDx + 1, canvasDx + 1);
    } else {
      ctx2Ref.current.fillStyle = MEDIUM_COLOR[i];
      ctx2Ref.current.fillRect((xCIE + scatteredPointsX) * canvasDx, (yCIE + scatteredPointsY) * canvasDx, canvasDx + 1, canvasDx + 1);
    }
  }

  function RecCirclePoint(ctx, ix, iy) {
    ctx.clearRect(0, 0, width, height);
    ctx.save();    // save this default state for future use


    ctx.beginPath();
    ctx.arc(ix, iy, 10, 0, Math.PI * 2, true); // Outer circle
    ctx.fillStyle = 'red';
    ctx.fill();

    // Create a clipping path for the inner transparent circle
    ctx.beginPath();
    ctx.arc(ix, iy, 7, 0, Math.PI * 2, true); // Inner circle
    ctx.clip();

    ctx.clearRect(0, 0, width, height);

    ctx.restore(); // restore to the default state

    // Clear the inner circle area to make it transparent
    //ctx.clearRect(ix-7, iy-7, 14, 14);

  }
  function circle(ctx, ix, iy, ir) {
    const x = parseInt(ix);
    const y = parseInt(iy);
    const r = parseInt(ir);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fillStyle = "rgb(0,250,0)";
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  function draw() {
    clearTimeout(timeoutIdRef.current);
    startTimer();
    if (drag) {
      var disp_x;
      var disp_y;
      var w;
      var h;
      if (start_x < end_x) {
        disp_x = start_x;
        w = end_x - start_x;
      } else {
        disp_x = end_x;
        w = start_x - end_x;
      }
      if (start_y < end_y) {
        disp_y = start_y;
        h = end_y - start_y;
      } else {
        disp_y = end_y;
        h = start_y - end_y;
      }

      let startX = Math.floor(disp_x / canvasDx - scatteredPointsX);
      let startY = Math.floor(disp_y / canvasDx - scatteredPointsY);
      let endX = Math.floor((disp_x + w) / canvasDx - scatteredPointsX);
      let endY = Math.floor((disp_y + h) / canvasDx - scatteredPointsY);

      for (let i = startX; i <= endX; i++) {
        for (let n = startY; n <= endY; n++) {
          bitmap_set(i, n, objectIndex);
        }
      }
    }

  }

  //格子線
  //平面波
  //媒質
  //totalFieldの横幅・縦幅を調整できるtotalFieldの左上にある赤い点
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

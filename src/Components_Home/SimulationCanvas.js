import styled from "styled-components";
import { useRef, useState, useEffect, useLayoutEffect } from 'react';

import {
  useFDTDInput,
  checker_FDTDINPUT,
  ColorCode,
  FDTD2D_PML
} from './SimulationCanvas_helper';
const Canvas = styled.canvas`
    position: absolute;
    top: 0;
    left: 0;
    opacity: 1.0;
    
`;
const Container = styled.div`
    position: relative;
    width:100%;
    height:100%;
    margin:0px 10px 0px 0px;
`;
const Layout_Wrapper = styled.div`
  border: 1px solid rgb(180, 180, 180); // Border line
  box-shadow: 2px 2px 2px rgb(100, 100, 100); // Shadow effect
  position:relative;
  width:100%;
  height:100%;
`;
let lastTimestamp = 0;

var nx;
var ny;
var pmlL;
var dx;
const interval =90;
const drawcanvasrate = 4;
var filmnum = 100;
var filmcounter = 0;
const MEDIUM_COLOR = ['rgb(255,255,255)', 'rgb(0,255,0)', 'rgb(255,0,0)', 'rgb(0,0,0)', 'rgb(255,225,0)'];

export const SimulationCanvas = ({ simulationData, showSimulation, setShowSimulation, moveVideo, setMoveVideo, rect }) => {
  const canvas1Ref = useRef(null);
  const ctxRef = useRef(null);
  const canvasbackgroundRef = useRef(null);
  const ctxbackgroundRef = useRef(null);
  const FDTD_Input = useFDTDInput(simulationData);
  const colorCodeRef = useRef(null);
  const FDTD2D_PMLRef = useRef(null);
  const layoutWrapperRef = useRef(null);
  const [RECT, setRECT] = useState({ width: 0, height: 0 });
  const movevideoRef = useRef(true);
  const showSimulationRef = useRef(false);

  useEffect(() => {
    movevideoRef.current = true;
    if (ctxRef.current) {
      ctxRef.current.clearRect(0, 0, RECT.width, RECT.height);
      ctxbackgroundRef.current.clearRect(0,0,RECT.width,RECT.height);
    }

    if (!checker_FDTDINPUT(FDTD_Input) || RECT.width === 0) return;
    console.log("FDTD_INPUT useEffect");
    FDTD2D_PMLRef.current = new FDTD2D_PML(FDTD_Input);
    showSimulationRef.current = true;
    const { nx: inputNx, ny: inputNy, pmlL: inputPmlL, color, amplitudeScaler, bitmap,
      scatteredPointsX, scatteredPointsY, totalPointsX, totalPointsY } = FDTD_Input;
    const { simulationNum } = amplitudeScaler;
    const { colorThreshold, colorTransitionIndex } = color;
    filmcounter = 0;
    colorCodeRef.current = new ColorCode(colorThreshold, colorTransitionIndex);
    nx = inputNx;
    ny = inputNy;
    pmlL = inputPmlL;
    dx = RECT.width / (nx - pmlL * 2);
    filmnum = simulationNum / drawcanvasrate;
    requestAnimationFrame(Program);
    drawBackGround(ctxbackgroundRef.current, bitmap, totalPointsX, totalPointsY, scatteredPointsX, scatteredPointsY);
  }, [FDTD_Input]);

  useEffect(() => {
    const delay = 300; // set the delay time as needed
    if (layoutWrapperRef.current) {
      const timer = setTimeout(() => {
        const Rect = layoutWrapperRef.current.getBoundingClientRect();
        setRECT(Rect);
        ctxRef.current = canvas1Ref.current.getContext('2d');
        ctxbackgroundRef.current = canvasbackgroundRef.current.getContext('2d');
        canvas1Ref.current.width = Rect.width; canvas1Ref.current.height = Rect.height;
        canvasbackgroundRef.current.width = Rect.width; canvasbackgroundRef.current.height = Rect.height;
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [layoutWrapperRef, rect])

  useEffect(() => {
    setMoveVideo(true);
    if (!showSimulation) {
      FDTD2D_PMLRef.current = null;
      if (ctxRef.current) {
        ctxRef.current.clearRect(0, 0, RECT.width, RECT.height);
        ctxbackgroundRef.current.clearRect(0,0,RECT.width,RECT.height);
      }
    }
    showSimulationRef.current = showSimulation;
  }, [showSimulation]);
  useEffect(() => {
    movevideoRef.current = moveVideo;
    requestAnimationFrame(Program);
  }, [moveVideo])

  const Program = (timestamp) => {
    if (timestamp - lastTimestamp >= interval && filmcounter < filmnum && showSimulationRef.current && movevideoRef.current) {
      for (let i = 0; i < drawcanvasrate; i++) {
        FDTD2D_PMLRef.current.cal();
      }
      canvas(ctxRef.current);
      requestAnimationFrame(Program);
      lastTimestamp = timestamp;
      filmcounter += 1;
    }
    if (filmcounter >= filmnum) setShowSimulation(false);
    if (showSimulationRef.current && movevideoRef.current) {
      requestAnimationFrame(Program);
    }
  };


  const stopvideo = () => {
    setMoveVideo(!moveVideo);
  }
  const canvas = (ctx) => {
    var Ez = FDTD2D_PMLRef.current.get_Ez();
    for (var i = pmlL; i < nx - pmlL; i++) {
      for (var n = pmlL; n < ny - pmlL; n++) {
        ctx.fillStyle = colorCodeRef.current.give(Ez[i][n]);
        ctx.fillRect((i - pmlL) * dx, (n - pmlL) * dx, dx + 1, dx + 1);
      }
    }
  }
  function drawBackGround(ctx, bitmap, totalPointsX, totalPointsY, scatteredPointsX, scatteredPointsY) {
    //line(scatteredPointsX * dx, scatteredPointsY * dx, (scatteredPointsX+totalPointsX)*dx, scatteredPointsY*dx, 2, "rgba(30,30,30,1)");
    //line((scatteredPointsX+totalPointsX)* dx,scatteredPointsY * dx, (scatteredPointsX+totalPointsX)*dx, (scatteredPointsY+totalPointsY)*dx,2, "rgba(30,30,30,1)");
    //line((scatteredPointsX+totalPointsX)*dx, (scatteredPointsY+totalPointsY)*dx, scatteredPointsX*dx, (scatteredPointsY+totalPointsY)*dx, 2, "rgba(30,30,30,1)");
    //line(scatteredPointsX * dx, (scatteredPointsX+totalPointsX)*dx, scatteredPointsX*dx, scatteredPointsY*dx, 2, "rgba(30,30,30,1)");
    ctx.clearRect(0,0,nx*dx,ny*dx);
    function line(x1, y1, x2, y2, w, col) {
      ctx.strokeStyle = col;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(0,0,255,0.3)";

    for (var i = 0; i < totalPointsX; i++) {
      for (var n = 0; n < totalPointsY; n++) {
        ctx.fillStyle = MEDIUM_COLOR[bitmap[i][n]];
        ctx.fillRect((i + scatteredPointsX) * dx, (n + scatteredPointsY) * dx, dx + 1, dx + 1);
      }
    }


    const pad=1;
    const canvasDx=dx;
    lineTF(scatteredPointsX*canvasDx-pad,scatteredPointsY*canvasDx-pad,(scatteredPointsX+totalPointsX)*canvasDx+pad,scatteredPointsY*canvasDx-pad);
    lineTF((scatteredPointsX+totalPointsX)*canvasDx+pad,scatteredPointsY*canvasDx-pad,(scatteredPointsX+totalPointsX)*canvasDx+pad,(scatteredPointsY+totalPointsY)*canvasDx+pad);
    lineTF((scatteredPointsX+totalPointsX)*canvasDx+pad,(scatteredPointsY+totalPointsY)*canvasDx+pad,scatteredPointsX*canvasDx-pad,(scatteredPointsY+totalPointsY)*canvasDx+pad);
    lineTF(scatteredPointsX*canvasDx-pad,(scatteredPointsY+totalPointsY)*canvasDx+pad,scatteredPointsX*canvasDx-pad,scatteredPointsY*canvasDx-pad);
  
    function lineTF(x1,y1,x2,y2) {
      var dashPattern = [9, 6];
      // 点線のスタイルを設定
      ctx.setLineDash(dashPattern);
      // 線の色を設定
      ctx.strokeStyle = 'rgb(50,50,50)';
      // 線の太さを設定
      ctx.lineWidth = 2;
      // 線を描画
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
  
    }
  };
  return (
    <Container>
      <Layout_Wrapper onClick={stopvideo} ref={layoutWrapperRef}>
        <Canvas ref={canvas1Ref} />
        <Canvas ref={canvasbackgroundRef} style={{ opacity: "0.1" }} />
      </Layout_Wrapper>
    </Container>
  )
};
import styled from "styled-components";
import { useState, useEffect, useRef } from 'react';

import { DrawCanvas } from './Components_Home/DrawCanvas';
import { SimulationCanvas } from './Components_Home/SimulationCanvas';
import { Link } from './Link';
import { RightBar } from './Components_Home/RightBar';
import { DEFAULT, BREAD } from './constants';
import { maker_RECT, updateLinkBread } from './helpers';
import { Home as SettingInputWave } from './SettingPage_InputWave/Home';
import { Home as SettingMedium } from './SettingPage_Medium/Home';

const Container = styled.div`
  margin-left:10px;
  position:relative;
  display:flex;
  flex-direction:column;
`
const Body = styled.div`
  position:relative;
`
const ContainerHome = styled.div`
  position:relative;
  display: inline-block;
  display:flex;
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  opacity: ${props => props.$show ? 1 : 0};
  flex-direction:row;
  @media screen and (max-width: 900px) {
    flex-direction: column;
  }
`
const Wrapper = styled.div`
  position: absolute;
  width:100%; height:100%;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  opacity: ${props => props.$show ? 1 : 0};
`;
const LeftBar = styled.div`
  position:relative;
`
export const Home = () => {
  const { SETTING, MEDIUM, BITMAP, AMPLITUDESCALER, COLOR } = DEFAULT;
  const [setting, setSetting] = useState(SETTING);
  const [medium, setMedium] = useState(MEDIUM);
  const [bitmap, setBitmap] = useState(BITMAP);
  const [bitmapChangeObject, setBitmapChangeObject] = useState([]);
  const [amplitudeScaler, setAmplitudeScaler] = useState(AMPLITUDESCALER);
  const [color, setColor] = useState(COLOR);

  const [drawData, setDrawData] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSimulation, setShowSimulation] = useState(false);
  const [moveVideo, setMoveVideo] = useState(false);

  const [rectDrawData, setRectDrawData] = useState({ width: 0, height: 0 });
  const [LinkBread, setLinkBread] = useState([]);

  const [simulationData, setSimulationData] = useState({});
  const [showWindow, setShowWindow] = useState("home");

  useEffect(() => {
    setDrawData({ bitmap: bitmap, setting: setting, medium: medium, clearBitmap: false });
    setShowSimulation(false);
  }, [setting, medium])
  useEffect(() => {
    setDrawData({ bitmap: bitmap, setting: setting, medium: medium, clearBitmap: false, bitmapChangeObject: bitmapChangeObject });
    setShowSimulation(false);
  }, [bitmapChangeObject])
  useEffect(() => {
    setRectDrawData(maker_RECT(SETTING));
  }, [])
  useEffect(() => {
    updateLinkBread(showWindow, BREAD, setLinkBread);
  }, [showWindow]);
  useEffect(() => {
    setRectDrawData(maker_RECT(SETTING));
  }, [])
  useEffect(() => {
    setShowSimulation(false);
  }, [selectedIndex, color, amplitudeScaler])
  const push = () => {
    const obj = {
      setting: setting,
      bitmap: bitmap,
      medium: medium,
      color: color,
      amplitudeScaler: amplitudeScaler
    }
    setShowSimulation(true);

    setSimulationData(obj);
  }
  const reset = () => {
    setRectDrawData(maker_RECT(SETTING));
    setSetting(SETTING);
    setBitmap(BITMAP);
    setAmplitudeScaler(AMPLITUDESCALER);
    setColor(COLOR);
    setMedium(MEDIUM);
    setSelectedIndex(0);
    setDrawData({ ...drawData, clearBitmap: true });
  }
  const clearBitmap = () => {
    setDrawData({ bitmap: [], setting: setting, medium: medium, clearBitmap: true });
    setShowSimulation(false);
  }
  const drawCanvasProps = {
    drawData,
    setBitmap,
    setSetting,
    selectedIndex,
    rect: rectDrawData
  }
  // simulationData, showSimulation, setShowSimulation, moveVideo, setMoveVideo, rect
  const simulationCanvasProps = {
    simulationData,
    showSimulation, setShowSimulation,
    moveVideo, setMoveVideo,
    rect: rectDrawData
  };
  const rightBarProps = {
    setting, setSetting,
    medium,
    amplitudeScaler, setAmplitudeScaler,
    selectedIndex, setSelectedIndex,
    setBitmapChangeObject,
    setShowWindow,
    showSimulation, setShowSimulation,
    moveVideo, setMoveVideo,
    color,setColor

  };
  const settingInputWaveProps = {
    setting, setSetting,
    amplitudeScaler, setAmplitudeScaler,
    defaultSetting: SETTING,
    defaultAmplitudeScaler: AMPLITUDESCALER,
    setShowWindow
  }
  const settingMediumProps = {
    medium, setMedium,
    setShowWindow
  }

  const componentMap = {
    settingInputWave: <SettingInputWave {...settingInputWaveProps} />,
    settingMedium: <SettingMedium {...settingMediumProps} />,
  };
  /*
      settingDomainGrid: <SettingDomainGrid {...settingDomainGridProps} />,
  */
  return (
    <Container>

      <Link setShowWindow={setShowWindow} linkobject={LinkBread} />
      <Body>
        <ContainerHome $show={showWindow === "home"}>
          <LeftBar style={{ width: rectDrawData.width + "px", height: rectDrawData.height + "px" }}>
            <Wrapper $show={!showSimulation}>
              <DrawCanvas {...drawCanvasProps} />
            </Wrapper>
            <Wrapper $show={showSimulation}>
              <SimulationCanvas {...simulationCanvasProps} />
            </Wrapper>
          </LeftBar>

          <RightBar {...rightBarProps} push={push} reset={reset} clearBitmap={clearBitmap} />
        </ContainerHome>
        <Wrapper $show={showWindow !== "home"}>
          {componentMap[showWindow]}
        </Wrapper>
      </Body>
    </Container>
  )
};
/*

*/
import styled from "styled-components";
import React, { useState, useEffect, useRef } from 'react';
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';
import './../../Components/SliderOverride.css';
import {
  Box, FrontHeader, FrontHeaderInner, TitleWrapper, CustomH3, FrontBody,
  ColumnLayout, GridColumn, FrontHeaderLeft, SVGInner, StyledImg, RadioButton, RadioButtonInput
} from './StyledBoxComponents';


const SliderWrapper = styled.div`
padding:0px;
padding-bottom:2px;
line-height:20px;
cursor:grab;
`
const TextRow = styled.div`
display:flex;
flex-direction:row;
`
const Text = styled.div`
font-size:19px;
margin:0;
paddingTop:-3px;
line-height:1.1;
`
export const BoxTheta = ({ setting, setSetting }) => {
  const [dispTheta, setDispTheta] = useState(setting.theta);//rc-sliderが少数点の値を扱えないため、colorThreshold*100したもの
  const timeoutIdRef = useRef();
  const reserveIdRef = useRef(null);

  const [marks, setMarks] = useState({});

  useEffect(() => {
    if (setting.theta === undefined) return;
    const obj = setInitialMarks();
    setMarks(obj);
  }, [])

  useEffect(() => {
    if (reserveIdRef.current) {
      clearTimeout(reserveIdRef.current);
    }
    reserveIdRef.current = setTimeout(() => {
      setSetting({ ...setting, theta: dispTheta });
      reserveIdRef.current = null;
    }, 600);

    if (timeoutIdRef.current) return;
    setSetting({ ...setting, theta:dispTheta });
    timeoutIdRef.current = setTimeout(() => {
      timeoutIdRef.current = null;
    }, 200);

    return () => {
      if (reserveIdRef.current) {
        clearTimeout(reserveIdRef.current)
      }
    };
  }, [dispTheta]);

  const handleTimeout = () => {
    setSetting({ ...setting, theta: dispTheta });
  };
  const handleThetaSliderChanged = (newValue) => {
    var boolean = false;
    var marks = Object.keys(customMarks);
    for (var i = 0; i < marks.length; i++) {
      var markValue = parseInt(marks[i]);
      if (markValue - 2 <= newValue && newValue <= markValue + 2) {
        setDispTheta(markValue)
        boolean = true;
      }
    }
    if (boolean === false) {
      setDispTheta(newValue)
    }
  }
  const startTimer = () => {
    timeoutIdRef.current = setTimeout(handleTimeout, 200);
  };
  return (
    <Box>
      <FrontHeader>
        <FrontHeaderInner>
          <FrontHeaderLeft>
            <TitleWrapper>
              <CustomH3>入射角度</CustomH3>
            </TitleWrapper>
          </FrontHeaderLeft>
        </FrontHeaderInner>
      </FrontHeader>

      <FrontBody>
        <ColumnLayout>
          <GridColumn>
            <TextRow>
              <Text style={{ fontSize: "14px", padding: "2px 7px 0px 0px" }}>入射角度: </Text>
              <Text style={{margin: "-1px 0px 0px 0px" }}>{dispTheta}</Text>
            </TextRow>
            <SliderWrapper>
              <Slider
                value={dispTheta}
                min={0}
                max={359}
                marks={customMarks}
                onChange={handleThetaSliderChanged}
                railStyle={{ backgroundColor: '#ddd', borderRadius: "5px", height: "8px" }}
                trackStyle={{ backgroundColor: 'rgb(60,60,235)', borderRadius: "5px", height: "8px" }}
                handleStyle={{ fontSize: '18px' }}
              />
            </SliderWrapper>
          </GridColumn>
        </ColumnLayout>
      </FrontBody>
    </Box>
  )
};
const customMarks = {
  0: '0°',
  45: '45°',
  90: '90°',
  180: '180°',
  270: '270°',
  359: '359°',
};
const setInitialMarks = () => {
  const initialMarks = {};
  let i = 0;
  initialMarks[i] = '';

  for (i = 0; i <= 359; i += 1) {
    if (i % 90 === 0) {
      initialMarks[i] = i.toString();
    } else {
      initialMarks[i] = ' ';
    }
  }
  return initialMarks;
}
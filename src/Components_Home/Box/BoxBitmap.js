import styled from "styled-components";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';
import './../../Components/SliderOverride.css';
import {
  Box, FrontHeader, FrontHeaderInner, TitleWrapper, CustomH3, FrontBody,
  ColumnLayout, GridColumn, FrontHeaderLeft, SVGInner, StyledImg,
  RadioButton, RadioButtonInput
} from './StyledBoxComponents';
import Select from 'react-select'
import './../../Components/reactSelect.css';

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
const WaveFormList = styled.div`
  margin-left:-7px;
  margin-top:3px;
`
const Label = styled.div`
  margin-left:10px;
  text-align:left;
  font-size:14px;
  margin-top:-2px;
  font-weight: 500;
`
const ContentBodyRow = styled.div`
  margin-bottom:2px;
  position:relative;
  display:flex;
  cursor:pointer;
  line-height:20px;
  align-items:center;
`
const JustFlexRow = styled.div`
display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 2px;
`
const InputItemGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2px;
`
const customStyles = {
  control: (provided) => ({
    ...provided,
    height: '25px',
    minHeight: '25px',
    fontSize: '15px',
  }),
  menu: (provided) => ({
    ...provided,
  }),
  // オプション（選択肢）のスタイル
  option: (provided) => ({
    ...provided,
    fontSize: '15px',
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: '25px',
    padding: '0 6px',
    fontSize: '15px'
  }),
  input: (provided) => ({
    ...provided,
    margin: '0px',
    fontSize: '15px'
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: '15px',  // フォントサイズを設定
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: '25px',
    fontSize: '15px'
  }),
};

const options = [
  { value: 0, label: 'green' },
  { value: 1, label: 'red' },
  { value: 2, label: 'black' },
  { value: 3, label: 'yellow' },
];

const Icon = [
  { colorRGB: "rgb(0,255,0)", alt: "green" },
  { colorRGB: "rgb(255,0,0)", alt: "red" },
  { colorRGB: "rgb(0,0,0)", alt: "black" },
  { colorRGB: "rgb(255,225,0)", alt: "yellow" }
];

const FormatOptionLabel = ({ option }) => {
  const matchedIcon = Icon.find(icon => icon.alt === option.label); // Assuming the value matches the alt
  const color = matchedIcon.colorRGB;
  return (
    <div>
      {matchedIcon && (
        <div
          style={{ border: "1px solid black", backgroundColor: `${color}`, marginBottom: "2px", width: "20px", height: "18px" }}
        />
      )}
    </div>
  );
};

const MediumObjectSelection = [
  { name: "正方形" },
  { name: "円形" },
  { name: "開放空洞" }
];
export const BoxBitmap = ({ setting, setBitmapChangeObject, medium }) => {
  const [dispRadius, setDispRadius] = useState(0);//rc-sliderが少数点の値を扱えないため、colorThreshold*100したもの
  const timeoutIdRef = useRef();
  const reserveIdRef = useRef(null);
  const [radiusMin, setRadiusMin] = useState(0);
  const [radiusMax, setRadiusMax] = useState(0);
  const [labelName, setLabelName] = useState("");
  const [marks, setMarks] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [optionList, setOptionList] = useState([]);

  useEffect(() => {
    if (setting.totalPointsX === undefined || setting.totalPointsY === undefined) return;
    const obj = setInitialMarks(setRadiusMin, setRadiusMax, setting.totalPointsX, setting.totalPointsY);
    setMarks(obj);
  }, [setting])

  useEffect(() => {
    if (reserveIdRef.current) {
      clearTimeout(reserveIdRef.current);
    }
    reserveIdRef.current = setTimeout(() => {
      calc();
      reserveIdRef.current = null;
    }, 600);

    if (timeoutIdRef.current) return;
    calc();
    timeoutIdRef.current = setTimeout(() => {
      timeoutIdRef.current = null;
    }, 200);

    return () => {
      if (reserveIdRef.current) {
        clearTimeout(reserveIdRef.current)
      }
    };
  }, [dispRadius]);

  useEffect(() => {
    if (!medium) return;
    setSelectedOption(options[0]);
    setSelectedOptionIndex(0);
    let len = medium.length - 1;
    let optionlist = [];
    for (let i = 0; i < len; i++) {
      optionlist.push(options[i]);
    }
    setOptionList(optionlist);
  }, [medium])

  useEffect(() => {
    if (selectedIndex === 0) setLabelName("一辺の格子幅");
    if (selectedIndex === 1) setLabelName("直径の格子幅");
    if (selectedIndex === 2) setLabelName("y軸の格子幅");
    calc();
  }, [selectedIndex])

  const handleRadiusSliderChanged = (newValue) => {
    setDispRadius(newValue);
  }
  const changeObjectIndex = (index) => {
    setSelectedIndex(index);
  }

  const handleOnChange = (option) => {
    setSelectedOption(option);
    setSelectedOptionIndex(option.value);

    if (selectedIndex === 0) setRectangle(dispRadius, setting, option.value + 1, setBitmapChangeObject);
    if (selectedIndex === 1) setCircle(dispRadius, setting, option.value + 1, setBitmapChangeObject);
    if (selectedIndex === 2) setOpenCavity(dispRadius, setting, option.value + 1, setBitmapChangeObject);


  };
  const calc = () => {
    if (selectedIndex === 0) setRectangle(dispRadius, setting, selectedOptionIndex + 1, setBitmapChangeObject);
    if (selectedIndex === 1) setCircle(dispRadius, setting, selectedOptionIndex + 1, setBitmapChangeObject);
    if (selectedIndex === 2) {
      if (options.length >= 2) {
        setSelectedOption(options[2]);
        setSelectedOptionIndex(options[2].value);
        setOpenCavity(dispRadius, setting, 3, setBitmapChangeObject);
      } else {
        setOpenCavity(dispRadius, setting, selectedOptionIndex + 1, setBitmapChangeObject);
      }
    }
  }
  return (
    <Box style={{ overflow: "visible" }}>
      <FrontHeader>
        <FrontHeaderInner>
          <FrontHeaderLeft>
            <TitleWrapper>
              <CustomH3>例</CustomH3>
            </TitleWrapper>
          </FrontHeaderLeft>
        </FrontHeaderInner>
      </FrontHeader>

      <FrontBody>
        <ColumnLayout>
          <GridColumn>
            <InputItemGrid>
              <JustFlexRow>
                <Label style={{ marginLeft: "-3px", marginRight: "10px" }}>媒質の選択: </Label>
                <Select
                  options={optionList}
                  styles={customStyles}
                  value={selectedOption}
                  isSearchable={false}
                  onChange={handleOnChange}
                  components={{
                    IndicatorSeparator: () => null,
                  }}
                  formatOptionLabel={(option) => <FormatOptionLabel option={option} />} // Pass option to FormatOptionLabel
                />
              </JustFlexRow>
              <WaveFormList>

                {MediumObjectSelection.map((mediumObject, index) => (
                  <ContentBodyRow key={index} onClick={() => changeObjectIndex(index)}>
                    <RadioButton>
                      <RadioButtonInput
                        type="radio"
                        checked={selectedIndex === index}
                        readOnly
                      />
                    </RadioButton>
                    <Label>{mediumObject.name}</Label>
                  </ContentBodyRow>
                ))}

              </WaveFormList>
              <TextRow>
                <Text style={{ fontSize: "14px", padding: "2px 7px 0px 0px" }}>{labelName}: </Text>
                <Text style={{ margin: "-1px 0px 0px 0px" }}>{dispRadius * 2}</Text>
              </TextRow>
              <SliderWrapper>
                <Slider
                  value={dispRadius}
                  min={radiusMin}
                  max={radiusMax}
                  marks={marks}
                  onChange={handleRadiusSliderChanged}
                  railStyle={{ backgroundColor: '#ddd', borderRadius: "5px", height: "8px" }}
                  trackStyle={{ backgroundColor: 'rgb(60,60,235)', borderRadius: "5px", height: "8px" }}
                  handleStyle={{ fontSize: '18px' }}
                />
              </SliderWrapper>
            </InputItemGrid>

          </GridColumn>
        </ColumnLayout>
      </FrontBody>
    </Box>
  )
};

/*
            
*/
const setInitialMarks = (setRadiusMin, setRadiusMax, totalPointsX, totalPointsY) => {
  let max;
  max = totalPointsX < totalPointsY ? totalPointsX : totalPointsY;
  max = max / 2 - 2;
  const initialMarks = {};
  let i = 0;
  initialMarks[i] = '';
  setRadiusMin(i);

  for (i = 0; i <= max; i += 1) {
    //initialMarks[i] = ' ';
    if (i % 5 === 0) {
      initialMarks[i] = (i * 2).toString();
    }
  }
  initialMarks[i - 1] = (i * 2 - 2).toString();
  setRadiusMax(i - 1);
  return initialMarks;
}

const setRectangle = (dispRadius, setting, mediumIndex, setBitmapChangeObject) => {
  let length = dispRadius;
  //if (length === 0) length = -1;
  length = 2 * length;
  const totalPointsX = setting.totalPointsX;
  const totalPointsY = setting.totalPointsY;
  const centerX = totalPointsX / 2;
  const centerY = totalPointsY / 2;
  let inputbitmap = Array.from({ length: totalPointsX }).map(() => Array.from({ length: totalPointsY }).fill(0));
  for (let i = parseInt(centerX - length / 2); i < parseInt(centerX + length / 2); i++) {
    for (let n = parseInt(centerY - length / 2); n < parseInt(centerY + length / 2); n++) {
      inputbitmap[i][n] = mediumIndex;
    }
  }
  setBitmapChangeObject(inputbitmap);
}
const setCircle = (dispRadius, setting, mediumIndex, setBitmapChangeObject) => {
  let radius = dispRadius;
  if (radius === 0) radius = -1;
  const totalPointsX = setting.totalPointsX;
  const totalPointsY = setting.totalPointsY;
  let inputbitmap = Array.from({ length: totalPointsX }).map(() => Array.from({ length: totalPointsY }).fill(0));
  const centerX=Math.ceil(totalPointsX/2);
  const centerY=Math.ceil(totalPointsY/2);
  for (let i = 0; i < totalPointsX; i++) {
    for (let j = 0; j < totalPointsY; j++) {
      let distanceFromCenter = Math.sqrt(Math.pow(centerX - i, 2) + Math.pow(centerY - j, 2));
      if (distanceFromCenter<= radius) {
        inputbitmap[i][j] = mediumIndex;
      }
    }
  }
  setBitmapChangeObject(inputbitmap);
}

const setOpenCavity = (dispRadius, setting, mediumIndex, setBitmapChangeObject) => {
  let radius = dispRadius * 2;
  const totalPointsX = setting.totalPointsX;
  const totalPointsY = setting.totalPointsY;
  let inputbitmap = Array.from({ length: totalPointsX }).map(() => Array.from({ length: totalPointsY }).fill(0));
  if (radius <= 10) {
    console.log("radius :::" + radius);
    setBitmapChangeObject(inputbitmap);
    return;
  }
  const xLen = Math.ceil(radius * 0.8);
  const yLen = Math.ceil(radius);
  const xHalfLen = Math.ceil(xLen / 2);
  const yHalfLen = Math.ceil(yLen / 2);
  const bold = 3;
  const cavityCover = Math.ceil((yLen - 2 * bold) * 0.26);

  const centerX = Math.ceil(totalPointsX / 2);
  const centerY = Math.ceil(totalPointsY / 2);


  for (let i = centerX - xHalfLen; i < centerX + xHalfLen; i++) {
    for (let n = centerY - yHalfLen; n < centerY - yHalfLen + bold; n++) {
      inputbitmap[i][n] = mediumIndex;
    }
  }
  for (let i = centerX - xHalfLen; i < centerX + xHalfLen; i++) {
    for (let n = centerY + yHalfLen - bold; n < centerY + yHalfLen; n++) {
      inputbitmap[i][n] = mediumIndex;
    }
  }
  for (let i = centerX + xHalfLen - bold; i < centerX + xHalfLen; i++) {
    for (let n = centerY - yHalfLen; n < centerY + yHalfLen; n++) {
      inputbitmap[i][n] = mediumIndex;
    }
  }
  for (let i = centerX - xHalfLen; i < centerX - xHalfLen + bold; i++) {
    for (let n = centerY - yHalfLen + bold; n < centerY - yHalfLen + bold + cavityCover; n++) {
      inputbitmap[i][n] = mediumIndex;
    }
  }
  for (let i = centerX - xHalfLen; i < centerX - xHalfLen + bold; i++) {
    for (let n = centerY + yHalfLen - bold - cavityCover; n < centerY + yHalfLen - bold; n++) {
      inputbitmap[i][n] = mediumIndex;
    }
  }
  setBitmapChangeObject(inputbitmap);


}
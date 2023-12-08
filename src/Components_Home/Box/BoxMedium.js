import styled from "styled-components";
import React, { useState, useEffect, useRef } from 'react';

import {
  Box, FrontHeader, FrontBody, FrontHeaderLeft,
  RadioButton, FrontHeaderInner, TitleWrapper, CustomH3,
  ColumnLayout, GridColumn, OutlinedButtonContainer,OutlinedButtonText,
  ButtonOrangeContainer, ButtonOrange, SVGInner, StyledImg,RadioButtonInput
} from './StyledBoxComponents';



const MediumSettingWrapper = styled.div`
  position:relative;
  display:flex;
  flex-direction:column;
  width:100%;
  width:100%;
  height:fit-content;
`
const ContentBodyRow = styled.div`
  margin-bottom:3px;
  position:relative;
  display:flex;
  cursor:pointer;

`

const MediumColorIcon = styled.div`
  width:25px;
  height:20px;
  margin:2px 3px 1px 3px;
  border:1px solid black;
  background-color: ${({ color }) => color};
`
const SectionColumn = styled.div`
  flex: 1;              // This ensures all children take equal width
  display:flex;
  flex-direction:column;
  height: 100%;
  align-items: center;
`

const Label = styled.div`
  width:100%;
  text-align:right;
  font-size:13px;
`
const SVGWrapper = styled.div`
  padding-left:30px;
  height: 17px;
  width: 26px;
  margin-top: 2px;
  margin-bottom: 2px;
  display: flex;
`;


const LabelCell = styled.div`
  flex: 1;              // This ensures all children take equal width
  height: 100%;
  position:relative;
  -webkit-box-align: center;
  margin-right:0px;
  align-items: center; /* This is for vertical centering when the parent is a flex container */
`
const LabelRow = styled.div`
  display:flex;
  flex-direction:row;
  width:100%;
`
const Mantissa = styled.span`
  font-size: 16px;
`
const MantissaWrapper = styled.div`
  display:flex;
  flex-direction:column-reverse;
`
const Exponent = styled.sup`
  font-size: 12px;
  vertical-align: super;
  margin-top:2px;
`;
const Exponential = styled.div`
  display:flex;
  flex-direction:row;
  justify-content:flex-end;
  vertical-align:bottom;
  height:100%;
  width:100%;
`


const MEDIUM_COLOR = ['rgb(255,255,255)', 'rgb(0,255,0)', 'rgb(255,0,0)', 'rgb(0,0,0)', 'rgb(255,225,0)'];
export const BoxMedium = ({ medium, selectedIndex, setSelectedIndex, setShowWindow, clearBitmap }) => {
  const [dispmedium, setDispMedium] = useState([]);

  useEffect(() => {
    if (!checker_MEDIUMARRAY) return;
    const stringMediumArray = medium.map(item => ({
      DielectricConstant: convertToExponential(item.DielectricConstant),
      DielectricLoss: convertToExponential(item.DielectricLoss),
      MagneticConstant: convertToExponential(item.MagneticConstant),
      MagneticLoss: convertToExponential(item.MagneticLoss)
    }));
    setDispMedium(stringMediumArray);
  }, [medium]);

  function changeObjectIndex(index) {
    setSelectedIndex(index);
  }
  const SECTIONS = [
    { label: 'Dielectric Constant', imgSrc: '/epsilondash.svg', altText: 'Epsilon Dash Icon', },
    { label: 'Dielectric Loss', imgSrc: '/epsilondash2.svg', altText: 'Epsilon Dash 2 Icon', },
    { label: 'Magnetic Constant', imgSrc: '/mudash.svg', altText: 'Mu Dash Icon', },
    { label: 'Magnetic Loss', imgSrc: '/mudash2.svg', altText: 'Mu Dash 2 Icon', },
  ];
  const ExponentialCell = ({ mantissa, exponent }) => (
    <LabelCell>
      <Exponential>
        <MantissaWrapper>
          <Mantissa>{mantissa}</Mantissa>
        </MantissaWrapper>
        <Exponent>{exponent}</Exponent>
      </Exponential>
    </LabelCell>
  );

  return (
    <Box>
      <FrontHeader>
        <FrontHeaderInner style={{ padding: "3px 20px 0px 20px" }}>
          <FrontHeaderLeft>
            <TitleWrapper>
              <CustomH3>媒質</CustomH3>
            </TitleWrapper>
          </FrontHeaderLeft>
          <OutlinedButtonContainer style={{ marginLeft: "30px" }}>
            <OutlinedButtonText onClick={() => setShowWindow("settingMedium")}>追加</OutlinedButtonText>
          </OutlinedButtonContainer>
          <ButtonOrangeContainer >
            <ButtonOrange onClick={() => clearBitmap()}>クリア</ButtonOrange>
          </ButtonOrangeContainer>

        </FrontHeaderInner>
      </FrontHeader>

      <FrontBody>
        <ColumnLayout style={{ margin: "-10px -10px -25px -10px" }}>
          <GridColumn style={{ padding: "7px 0px 2px 0px" }}>
            <MediumSettingWrapper>
              <ContentBodyRow>
                <RadioButton>
                  <RadioButtonInput type="radio" style={{ visibility: "hidden" }} readOnly />
                </RadioButton>
                <MediumColorIcon color={'white'} style={{ border: '0px solid white' }}></MediumColorIcon>
                <LabelRow>
                  {SECTIONS.map((section, index) => (
                    <SectionColumn key={index}>
                      <Label>{section.label}</Label>
                      <SVGWrapper>
                        <SVGInner>
                          <StyledImg
                            src={`${process.env.PUBLIC_URL}${section.imgSrc}`}
                            alt={section.altText}
                          />
                        </SVGInner>
                      </SVGWrapper>
                    </SectionColumn>
                  ))}
                </LabelRow>
              </ContentBodyRow>
              {Array.isArray(dispmedium) && (dispmedium.map((column, index) => (
                <ContentBodyRow key={index} onClick={() => changeObjectIndex(index)}>
                  <RadioButton>
                    <RadioButtonInput
                      type="radio"
                      checked={selectedIndex === index}
                      readOnly
                    />
                  </RadioButton>
                  <MediumColorIcon color={MEDIUM_COLOR[index]}></MediumColorIcon>
                  <LabelRow>
                    <ExponentialCell {...column.DielectricConstant} />
                    <ExponentialCell {...column.DielectricLoss} />
                    <ExponentialCell {...column.MagneticConstant} />
                    <ExponentialCell {...column.MagneticLoss} />
                  </LabelRow>
                </ContentBodyRow>
              )))}
            </MediumSettingWrapper>
          </GridColumn>
        </ColumnLayout>
      </FrontBody>
    </Box>
  )
};
const convertToExponential = (num) => {
  if (Number.isInteger(num) && num >= 0 && num <= 100) {
    return {
      mantissa: num.toString(),
      exponent: "",
    };
  }
  const absoluteNumber = Math.abs(num);
  // 指数を計算
  const exponent = Math.floor(Math.log10(absoluteNumber));
  // 仮数を計算
  let mantissa = absoluteNumber / Math.pow(10, exponent);
  // 有効数字を取得（最大5桁）
  const yukosuji = get_yukosuji(mantissa, 4);
  mantissa = formatMantissa(mantissa, yukosuji);
  var str_mantissa = mantissa;
  var str_exponent = exponent.toString();
  if (exponent !== 0) { str_mantissa = mantissa + " ×10"; }
  if (exponent === 0) str_exponent = "";
  return {
    mantissa: str_mantissa,
    exponent: str_exponent
  };
};
function get_yukosuji(number, limit) {
  let strNum = number.toString();
  // 左端から連続する"0"と"."を取り除く
  strNum = strNum.replace(/^0+\.?/, '');
  // 右端から連続する"0"を取り除く（ただし整数部分の0は取り除かない）
  if (strNum.includes('.')) {
    strNum = strNum.replace(/0+$/, '');
  }
  // '.' を除外する
  strNum = strNum.replace('.', '');
  return Math.min(strNum.length, limit);
}

const formatMantissa = (mantissa, yukosuji) => {
  const parts = mantissa.toString().split(".");
  let result = parts[0];

  if (parts.length > 1) {
    const neededLength = yukosuji - parts[0].length;
    result += "." + parts[1].slice(0, neededLength);
  }

  return result;
};
function checker_MEDIUMARRAY(obj1) {
  if (!obj1) return false;
  const fields = ['DielectricConstant', 'DielectricLoss', 'MagneticConstant', 'MagneticLoss'];
  if (fields.every(field => obj1[0].hasOwnProperty(field))) {
    return true;
  } else {
    return false;
  }
}
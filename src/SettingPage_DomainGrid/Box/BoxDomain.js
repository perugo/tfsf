import styled from "styled-components";
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  validateInput,
  checker_amplitudeScaler,
  handleKeyDown,
  setToDefault,
  updateStringStates,
  isStateComplete,
  isValidNumber
} from './BoxDomain_helper';
const BoxWrapper = styled.div`
flex-direction:column;
display:flex;
`
const Front = styled.div`
  border-radius: 5px;
  overflow: hidden;
  box-sizing:border-box;
  background-color: rgb(255,255,255);
  border-spacing:0;
  cursor:auto;
  direction 1tr;
  empty-cells:show;
  hyphens:none;
  tab-size:8;
  text-align:left;
  text-indent:0;
  text-transform:none;
  widows:2;
  word-spacing:normal;
  font-weight:400;
  -webkit-font-smoothing:auto;
  word-break:bread-word;
  display:block;
  position:relative;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
  &::before{
    content:"";
    position:absolute;
    left:0px;
    width:100%;
    height:100%;
    pointer-events:none;
    box-sizing:border-box;
    border-top: 1px solid #eaeded;
    z-index:1;
  }
  &::after{
    content:"";
    position:absolute;
    left:0px;
    top:0px;
    width:100%;
    height:100%;
    pointer-events:none;
    box-sizing:border-box;
    box-shadow:0 1px 1px 0 rgba(0,28,36,0,3) 1px 1px 1px 1px 0 rgba(0,28,36,0.15), -1px 1px 1px 0 rgba(0,28,36,0.15);
    mix-blend-mode:multiply;
  }
`

const FrontHeader = styled.div`
  border-bottom:1px solid #eaeded;
`
const FrontHeaderInner = styled.div`
 width:100%;
 background-color: rgb(246,246,246);
 display:flex;
 padding:1px 20px 0px 20px;
 box-sizing:border-box;
 border:none;
 line-height 22px;
 tex-align:left;
 justify-content:space-between;
`
const TitleWrapper = styled.div`
flex-wrap:wrap;
justify-content:space-between;
display:flex;
align-content:center;
font-size:18px;
min-width:0;
color:#16191f;
margin-right:15px;
`
const CustomH3 = styled.span`
 font-size:18px;
 font-weight:500;
 font-family:Arial,sans-serif, Helvetica,Circular;
 -webkit-font-smoothing:auto;
 display:inline;
 margin-right:8px;
 margin:0px;
 color:rgb(40,40,40);
`
const FrontBody = styled.div`
position:relative;
padding:10px 20px 12px 20px;
`
const FrontBodyInner = styled.div`
position:relative;
  cursor:pointer;
  display:flex;
  padding: 12px 20px 12px 20px;
  border:none;
  line-height:22px;
  text-align:left;
  background-color:#ddd;
`

const ColumnLayout = styled.div`
  margin:-10px;
  display:flex;
  flex-wrap:wrap;
  color::#16191f;
  box-sizing:border-box;
  border-collapse:separete;
  direction:1tr;
  flex-direction:column;


  cursor:auto;
  direction:1tr;
  text-align:left;
  font-size:18px;
  line-height:20px;
  color:#16191f;
  font-weight:500;
  font-family:times new roman,serif;
`
const GridColumn = styled.div`
  padding:10px 8px 5px 8px;
  box-sizing:border-box;
  display:flex;
  position:relative;
  flex-direction:column;
`
const ColumnTitle = styled.div`
  font-size:16px;
  font-weight:500;
  line-height:1.2;
  color:rgb(100,100,100);
  margin-bottom:2px;
  font-family:times new roman,serif;
  font-family:"times new roman", serif;
`
//,"Helvetica Neue",Roboto,Arial,sans-serif
const SpanText = styled.span`
font-size:15px;
font-weight:500;
line-height:22px;
color:rgb(40,40,40);
margin-bottom:2px;
`
const ButtonWrapperRight = styled.div`
display: flex;
`
const Button = styled.button`
background-color:rgb(255,255,255);
border-color:rgb(0,0,0);
border-style:solid;
border-width:1px;
border-radius:3px;
padding:0px 15px;
line-height:1.5;
display:flex;
justify-content:center;
&:hover {
  border-color:rgb(100,100,100);
  background-color:rgb(240,240,240);
}
&:active{
  background-color:rgb(225,225,225);
}
cursor:pointer;
`
const ContentBodyColumn = styled.div`
  margin-bottom:7px;
  position:relative;
  display: inline-block;
  display:flex;
  flex-direction:column;
`
const FrontHeaderLeft = styled.div`
line-height:none;
display:flex;
flex-direction:row;
`
const ButtonSmallWrapper = styled.div`
  text-align: center;
  display: flex;
  align-items: center;
`
const ButtonSmall = styled.div`
  backface-visibility: hidden;
  background-color:rgb(255,153,0);
  border: 0;
  box-sizing: border-box;
  color:rgb(0,0,0);
  cursor: pointer;
  display: inline-block;
  font-family:sans-serif,Arial, Helvetica,Circular,Helvetica,sans-serif;
  font-weight: 500;
  font-size:16px;
  line-height:1.5;
  position: relative;
  text-align: left;
  text-decoration: none;
  letter-spacing:.25px;
  border-radius:4px;
  padding: 0px 17px;
  transition: transform .2s;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;

  &:hover{
    background-color:rgb(236,114,17);
  }
  &:active{
    background-color:#EB5F07;
}
`
const ButtonReturnWrapper = styled.div`
  text-align: center;
  display: flex;
  padding-top:14px;
  align-items: center;
  margin:auto;
`
const ButtonReturn = styled.div`
  backface-visibility: hidden;
  background-color:rgb(255,153,0);
  border: 0;
  box-sizing: border-box;
  color:rgb(0,0,0);
  cursor: pointer;
  display: inline-block;
  font-family:sans-serif,Arial, Helvetica,Circular,Helvetica,sans-serif;
  font-weight: 500;
  font-size:18px;
  line-height:1.9;
  position: relative;
  text-align: left;
  text-decoration: none;
  letter-spacing:.25px;
  border-radius:4px;
  padding: 0px 22px;
  transition: transform .2s;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;

  &:hover{
    background-color:rgb(236,114,17);
  }
  &:active{
    background-color:#EB5F07;
}
`
const InputText = styled.input`
width:140px;
  text-align: right;
  box-sizing: border-box;
  font-size: 15px;
  padding: 4px;
  border: 1px solid #ccc;
`
const InputItemGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
`
const JustFlexRow = styled.div`
display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 2px;
`
const SmallLabel = styled.div`
  width:100px;
  font-size:14px;
  text-align:left;
`;
const SectionContainer = styled.div`
  background-color: #f9f9f9; // A subtle background color to differentiate the section
  padding: 3px 5px 8px 3px;
  border-radius: 5px;
  margin-bottom: 7px; // Space between sections
`;
export const BoxDomain = ({
  draftDrawData, setDraftDrawData,
  drawData
}) => {
  const [strField, setStrField] = useState({});
  const timeoutIdRef = useRef();

  useEffect(() => {
    if (!isStateComplete(drawData, draftDrawData)) return;
    updateStringStates(draftDrawData, setStrField);
  }, [drawData, draftDrawData])

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;

    if (!validateInput(value)) return;
    clearTimeout(timeoutIdRef.current);
    setStrField((prevState) => ({
      ...prevState,
      [field]: value
    }));
    startSetInputTimer();
  };
  const onClick_setToDefault = () => {
    setDraftDrawData(drawData);
  }

  const startSetInputTimer = () => {
    timeoutIdRef.current = setTimeout(handleSetInputTimeout, 1600);
  };
  const handleSetInputTimeout = () => {
    setStrField((current) => {
      let updated = {
        fieldX: isValidNumber(current.fieldX) ? roundToFourSignificantFigures(current.fieldX) : draftDrawData.setting.fieldX,
        fieldY: isValidNumber(current.fieldY) ? roundToFourSignificantFigures(current.fieldY) : draftDrawData.setting.fieldY
      }
      setDraftDrawData(prevData => ({
        ...prevData,
        setting: {
          ...prevData.setting,
          ...updated // Spread the contents of 'updated' here, not the object itself
        }
      }));
    })
  };

  const inputFields = [
    { name: "x軸の幅 [ m ] : ", field: 'fieldX' },
    { name: "y軸の幅 [ m ] : ", field: 'fieldY' }
  ];
  return (
    <BoxWrapper>
      <Front>
        <FrontHeader>
          <FrontHeaderInner>
            <FrontHeaderLeft>
              <TitleWrapper>
                <CustomH3>x軸・y軸の幅</CustomH3>
              </TitleWrapper>
            </FrontHeaderLeft>
          </FrontHeaderInner>
        </FrontHeader>

        <FrontBody>
          <ColumnLayout>
            <GridColumn>
              {strField !== undefined && strField.fieldX !== undefined && (
                <InputItemGrid>
                  {inputFields.map(({ name, field }, index) => {

                    const value = strField[field];
                    return (
                      <JustFlexRow key={field}>
                        <SmallLabel>{name}</SmallLabel>
                        <InputText
                          key={field}
                          maxLength="12"
                          type="text"
                          value={value}
                          onChange={handleInputChange(field)}
                          onKeyDown={handleKeyDown()}
                        />
                      </JustFlexRow>
                    );

                  })}
                </InputItemGrid>
              )}

            </GridColumn>
          </ColumnLayout>
        </FrontBody>
      </Front>
    </BoxWrapper>
  )
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

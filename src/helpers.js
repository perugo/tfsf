export function maker_RECT(set) {
  const { totalPointsX,totalPointsY,scatteredPointsX,scatteredPointsY, fieldY, fieldX } = set;
  const xnum=totalPointsX+scatteredPointsX*2;
  const ynum = Math.ceil(fieldY / (fieldX / xnum));

  const availableHeight = window.innerHeight - 53;
  const availableWidth = window.innerWidth - 500;

  // Calculate the maximum canvasDx that satisfies both conditions
  const maxCanvasDxHeight = availableHeight / ynum;
  const maxCanvasDxWidth = availableWidth / xnum;
  const canvasDx = Math.min(maxCanvasDxHeight, maxCanvasDxWidth);

  const RECT = {
    width: canvasDx * xnum,
    height: canvasDx * ynum,
  };

  return RECT;
}
export function updateLinkBread(showWindow,BREAD,setLinkBread){
  const mappings = {
    home: BREAD.HOME,
    settingMedium: BREAD.SETTING.MEDIUM,
    settingDomainGrid: BREAD.SETTING.DOMAINGRID,
    settingInputWave: BREAD.SETTING.INPUTWAVE,
  };
  setLinkBread(mappings[showWindow]);
};
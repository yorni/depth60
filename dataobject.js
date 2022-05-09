let dataObject = {
  time: 0,
  o: 0,
  c: 0,
  h: 0,
  l: 0,
  sellVol: 0,
  buyVol: 0,
  totalVol: 0,
  dealsQuantityBuy: 0,
  dealsQuantitySell: 0,
  vol01Bids: 0,
  vol01Asks: 0,
  vol02Bids: 0,
  vol02Asks: 0,
  vol1Bids: 0,
  vol1Asks: 0,
};

function logDataObject(statOb, param) {
  // console.log(
  //   statOb.eventTime,
  //   statOb.buyClosestPrice,
  //   statOb.sellClosestPrice,
  //   param.lastSellerMakerPrice,
  //   param.lastBuyerMakerPrice,
  //   param.dataByPeriods[1].time,
  //   param.dataByPeriods[1].o,
  //   param.dataByPeriods[1].h,
  //   param.dataByPeriods[1].l,
  //   param.dataByPeriods[1].c,
  //   param.dataByPeriods[1].totalVol,
  //   "----",
  //   param.dataByPeriods[1].sellVol,
  //   param.dataByPeriods[1].buyVol,
  //   param.dataByPeriods[1].dealsQuantityBuy,
  //   param.dataByPeriods[1].dealsQuantitySell
  // );

  if (param.dataByPeriods[1].o == 0) {
    return;
  }
  console.log(
    "['" + param.dataByPeriods[1].time + "00',",

    param.dataByPeriods[1].o,
    ",",
    param.dataByPeriods[1].h,
    ",",
    param.dataByPeriods[1].l,
    ",",
    param.dataByPeriods[1].c,
    ",",
    param.dataByPeriods[1].totalVol,

    ",",
    param.dataByPeriods[1].sellVol,

    ",",
    param.dataByPeriods[1].buyVol,
    ",",
    param.dataByPeriods[1].dealsQuantityBuy +
      param.dataByPeriods[1].dealsQuantitySell,
    ",",
    param.dataByPeriods[1].dealsQuantityBuy,
    ",",
    param.dataByPeriods[1].dealsQuantitySell,
    ",",
    param.dataByPeriods[1].vol01Bids,
    ",",
    param.dataByPeriods[1].vol01Asks,
    ",",
    param.dataByPeriods[1].vol02Bids,
    ",",
    param.dataByPeriods[1].vol02Asks,
    ",",
    param.dataByPeriods[1].vol1Bids,
    ",",
    param.dataByPeriods[1].vol1Asks,
    "],"
  );
}
module.exports.dataObject = dataObject;
module.exports.logDataObject = logDataObject;

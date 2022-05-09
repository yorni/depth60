function getAvgVolume(numElements, avgElement, dataBySeconds) {
  let vol = 0;
  for (let index = 1; index <= numElements; index++) {
    vol = vol + dataBySeconds[index][avgElement];
  }
  return vol / numElements;
}

function getTimeForTradeVolume(
  openPrice,
  percent,
  deals,
  volPerSecond,
  fullDepth
) {
  if (volPerSecond == 0) {
    return 1000000;
  }
  let targetPrice = 0;
  if (deals == "asks") {
    targetPrice = openPrice + (openPrice * percent) / 100;
  } else {
    targetPrice = openPrice - (openPrice * percent) / 100;
  }

  let totalVol = 0;
  for (const prop in fullDepth[deals]) {
    if (fullDepth[deals][prop] != 0) {
      if (
        (+prop > targetPrice && deals == "asks") ||
        (+prop < targetPrice && deals == "bids")
      ) {
        return Math.round(totalVol / volPerSecond);
      }
      totalVol = totalVol + fullDepth[deals][prop];
    }
  }
  return 1000000;
}

function getDepthVolumeToPrice(openPrice, percentChange, deals, fullDepth) {
  if (openPrice == 0) {
    return 0;
  }
  let targetPrice = 0;

  if (deals == "asks") {
    targetPrice = +openPrice + (openPrice * percentChange) / 100;
  } else {
    targetPrice = +openPrice - (openPrice * percentChange) / 100;
  }

  let totalVol = 0;
  for (const prop in fullDepth[deals]) {
    if (fullDepth[deals][prop] != 0) {
      if (
        (+prop > targetPrice && deals == "asks") ||
        (+prop < targetPrice && deals == "bids")
      ) {
        return totalVol;
      }
      totalVol = totalVol + fullDepth[deals][prop];
    }
  }
  return totalVol;
}

function getClosestPrice(deals, fullDepth) {
  for (const prop in fullDepth[deals]) {
    if (fullDepth[deals][prop] != 0) {
      return +prop;
    }
  }
}

function getPriceDepth(vol, deals, fullDepth) {
  let pr = 0;
  let lastVol = vol;
  for (const prop in fullDepth[deals]) {
    if (fullDepth[deals][prop] != 0) {
      lastVol = lastVol - fullDepth[deals][prop];

      if (lastVol <= 0) {
        return {
          price: +prop,
          vol: fullDepth[deals][prop],
        };
      }
    }
    pr = +prop;
  }
  return {
    price: pr,
    vol: -1,
  };
}

module.exports.getAvgVolume = getAvgVolume;
module.exports.getTimeForTradeVolume = getTimeForTradeVolume;
module.exports.getDepthVolumeToPrice = getDepthVolumeToPrice;
module.exports.getClosestPrice = getClosestPrice;
module.exports.getPriceDepth = getPriceDepth;

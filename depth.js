let {
  getAvgVolume,
  getTimeForTradeVolume,
  getClosestPrice,
  getPriceDepth,
} = require("./calcFunc");

let { logDataObject } = require("./dataobject");
let { statOb } = require("./statOb");

function logDepthData(param) {
  let statOb = require("./statOb");
  statOb.eventTime = param.fullDepth.eventTime;
  statOb.buyClosestPrice = getClosestPrice("bids", param.fullDepth);
  statOb.sellClosestPrice = getClosestPrice("asks", param.fullDepth);

  futuresSubscriptions = param.binance.futuresSubscriptions();

  for (let endpointId in futuresSubscriptions) {
    const ws = futuresSubscriptions[endpointId];
    ws.ping(noop);
    ws.pong(noop);
  }
  if (param.logData) {
    logDataObject(statOb, param);
  }
}
const noop = () => {};

function appyUpdate(updateDepthL, depthToUpdate) {
  param.fullDepth = undefined;
  param.fullDepth = {
    symbol: updateDepthL.s,
    eventTime: updateDepthL.E,
    firstId: updateDepthL.U,
    finalId: updateDepthL.u,

    bids: {},
    asks: {},
  };

  let bids = depthToUpdate.bids;
  let asks = depthToUpdate.asks;

  for (let prop in bids) {
    let levelfinded = false;
    updateDepthL.b.forEach((elupd) => {
      if (prop == elupd[0] && elupd[1] != 0) {
        param.fullDepth.bids[prop] = Number(elupd[1]);
        levelfinded = true;
      } else if (prop == elupd[0]) {
        levelfinded = true;
      }
    });
    if (!levelfinded && bids[prop] != 0) {
      param.fullDepth.bids[prop] = bids[prop];
    }
  }
  updateDepthL.b.forEach((el) => {
    let levelfinded = false;
    for (let prop in bids) {
      if (el[0] == prop && el[1] != 0) {
        levelfinded = true;
      }
    }
    if (!levelfinded) {
      param.fullDepth.bids[String(el[0])] = Number(el[1]);
    }
  });

  for (let prop in asks) {
    let levelfinded = false;
    updateDepthL.a.forEach((elupd) => {
      if (prop == elupd[0] && elupd[1] != 0) {
        param.fullDepth.asks[prop] = Number(elupd[1]);
        levelfinded = true;
      } else if (prop == elupd[0]) {
        levelfinded = true;
      }
    });
    if (!levelfinded && asks[prop] != 0) {
      param.fullDepth.asks[prop] = asks[prop];
    }
  }
  updateDepthL.a.forEach((el) => {
    let levelfinded = false;
    for (let prop in asks) {
      if (el[0] == prop && el[1] != 0) {
        levelfinded = true;
      }
    }
    if (!levelfinded) {
      param.fullDepth.asks[String(el[0])] = Number(el[1]);
    }
  });

  param.fullDepth.asks = Object.keys(param.fullDepth.asks)
    .sort(function (a, b) {
      if (+a <= +b) {
        return -1;
      } else {
        return 1;
      }
    })
    .reduce((obj, key) => {
      obj[key] = param.fullDepth.asks[key];
      return obj;
    }, {});
  param.fullDepth.bids = Object.keys(param.fullDepth.bids)
    .sort(function (a, b) {
      if (+a <= +b) {
        return 1;
      } else {
        return -1;
      }
    })
    .reduce((obj, key) => {
      obj[key] = param.fullDepth.bids[key];
      return obj;
    }, {});
}

async function updateDepthData(depth, param) {
  if (!param.depthSnapshotSended) {
    param.depthSnapshotSended = true;
    param.depthSnapshot = await param.binance.futuresDepth(param.symbol);

    depthL = {
      lastUpdateId: param.depthSnapshot.lastUpdateId,
      bids: {},
      asks: {},
    };
    param.depthSnapshot.asks.forEach((el) => {
      depthL.asks[el[0]] = +el[1];
    });
    param.depthSnapshot.bids.forEach((el) => {
      depthL.bids[el[0]] = +el[1];
    });
    param.depthSnapshot = depthL;
  }

  if (param.depthSnapshot == undefined) {
    param.updateDepth.push(depth);
  } else if (!param.depthUpdated) {
    param.updateDepth.push(depth);
    param.updateDepth.forEach((element) => {
      if (
        element.U <= param.depthSnapshot.lastUpdateId + 1 &&
        element.u >= param.depthSnapshot.lastUpdateId + 1
      ) {
        appyUpdate(element, param.depthSnapshot);
        param.depthUpdated = true;
      }
    });

    if (!param.depthUpdated) {
      param.depthUpdated = true;
      param.fullDepth = param.depthSnapshot;
    }
  } else {
    appyUpdate(depth, param.fullDepth);
  }
}

module.exports.logDepthData = logDepthData;
module.exports.appyUpdate = appyUpdate;
module.exports.updateDepthData = updateDepthData;

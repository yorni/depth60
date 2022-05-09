let { config, sql } = require("./sql");
let { dataObject, logDataObject } = require("./dataobject");
let { getDepthVolumeToPrice } = require("./calcFunc");
let { logDepthData, appyUpdate, updateDepthData } = require("./depth");
let { param } = require("./param");
const Binance = require("node-binance-api");

function processTradesData(trade) {
  if (param.lastBuyerMakerPrice == 0 && trade.m) {
    param.lastBuyerMakerPrice = trade.p;
  }
  if (param.lastSellerMakerPrice == 0 && !trade.m) {
    param.lastSellerMakerPrice = trade.p;
  }
  newDataObject = param.dataByPeriods[0];
  if (!newDataObject) {
    //Еще нет ни одного элемента, начало работы
    return;
  }

  if (newDataObject.o == 0) {
    newDataObject.o = Number(trade.p);
    newDataObject.h = Number(trade.p);
    newDataObject.l = Number(trade.p);
    newDataObject.c = Number(trade.p);
  }

  newDataObject.h = Math.max(newDataObject.h, Number(trade.p));
  newDataObject.l = Math.min(newDataObject.h, Number(trade.p));
  newDataObject.c = Number(trade.p);

  let currentVol = Number(trade.q);
  newDataObject.totalVol =
    Math.round((newDataObject.totalVol + currentVol) * 100) / 100;
  if (trade.m) {
    //"m": true,          // Was the buyer the maker?
    newDataObject.dealsQuantityBuy++;
    newDataObject.buyVol =
      Math.round((newDataObject.buyVol + currentVol) * 100) / 100;
    param.lastBuyerMakerPrice = trade.p;
  } else {
    newDataObject.dealsQuantitySell++;
    newDataObject.sellVol =
      Math.round((newDataObject.sellVol + currentVol) * 100) / 100;
    param.lastSellerMakerPrice = trade.p;
  }
  if (param.dataByPeriods.length >= 7) {
    param.dataByPeriods.splice(6 - param.dataByPeriods.length);
  }
  //console.log(newDataObject);
}

async function processDepthData(depth) {
  await updateDepthData(depth, param);

  if (param.depthUpdated) {
    currentTime = param.fullDepth.eventTime;

    if (param.prevTime == 0) {
      param.newSecond = true;
    }

    if (
      !(param.prevTime == 0) &&
      Math.floor(currentTime / 100) > Math.floor(param.prevTime / 100)
    ) {
      param.newSecond = true;

      param.startSecondTime = currentTime;

      newDataObject = Object.assign({}, dataObject);

      newDataObject.time = Math.floor(currentTime / 100);

      prevDataObject = param.dataByPeriods[0];

      if (prevDataObject) {
        percent = 0.1;
        prevDataObject.vol01Bids = getDepthVolumeToPrice(
          param.lastBuyerMakerPrice,
          percent,
          "bids",
          param.fullDepth
        );
        prevDataObject.vol01Asks = getDepthVolumeToPrice(
          param.lastSellerMakerPrice,
          percent,
          "asks",
          param.fullDepth
        );

        percent = 0.2;
        prevDataObject.vol02Bids = getDepthVolumeToPrice(
          param.lastBuyerMakerPrice,
          percent,
          "bids",
          param.fullDepth
        );
        prevDataObject.vol02Asks = getDepthVolumeToPrice(
          param.lastSellerMakerPrice,
          percent,
          "asks",
          param.fullDepth
        );

        percent = 1;
        prevDataObject.vol1Bids = getDepthVolumeToPrice(
          param.lastBuyerMakerPrice,
          percent,
          "bids",
          param.fullDepth
        );
        prevDataObject.vol1Asks = getDepthVolumeToPrice(
          param.lastSellerMakerPrice,
          percent,
          "asks",
          param.fullDepth
        );
      }

      param.prevLastBuyerMakerPrice = param.lastBuyerMakerPrice;
      param.prevLastSellerMakerPrice = param.lastSellerMakerPrice;

      param.dataByPeriods.unshift(newDataObject);
      if (param.dataByPeriods[5]) {
        logDepthData(param);
      }
    }
    param.prevTime = param.fullDepth.eventTime;
  }
}

function initParameters() {
  var myArgs = process.argv.slice(2);
  if (myArgs[0]) {
    param.symbol = myArgs[0];
  }
  if (myArgs[1] && myArgs[1] == "sql") {
    param.useSql = true;
  }

  if (myArgs[2] && myArgs[2] == "log") {
    param.logData = true;
  }
}

function start() {
  initParameters();

  if (param.useSql) {
    param.pool = new sql.ConnectionPool(config);
    param.poolConnect = pool.connect();
    param.pool.on("error", (err) => {
      // ... error handler
    });
  }

  param.binance = new Binance().options({
    APIKEY: process.env["APIKEY"],
    APISECRET: process.env["APISECRET"],
    reconnect: true,
    verbose: true,
  });

  param.binance.futuresSubscribe(
    [
      param.symbol.toLowerCase() + "@depth@100ms",
      param.symbol.toLowerCase() + "@trade",
    ],
    (data) => {
      if (data.e == "depthUpdate") {
        processDepthData(data);
      } else if (data.e == "trade") {
        processTradesData(data);
      }
    }
  );
}

start();

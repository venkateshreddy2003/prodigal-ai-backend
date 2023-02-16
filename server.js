const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const pg = require("pg");
const axios = require("axios");
const URL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
const query = `
{
  swaps{
    id
    transaction {
      id
    }
    timestamp
    pool {
      id
    }
    token0 {
      id
      symbol
    }
    token1 {
      id
      symbol
    }
    sender
    recipient
    origin
    amount0
    amount1
    amountUSD
    sqrtPriceX96
    tick
    logIndex
  }
}
`;
app.put("/", (req, resp) => {
  axios.post(URL, { query }).then(async (result) => {
    // console.log(result.data.data);
    const res = await result.data.data.swaps;
    console.log("in db");
    var conString = `postgres://ylwzplrk:q05bU2-fiqFWUqcD0E4pBOnO_K7yCTUZ@raja.db.elephantsql.com/ylwzplrk`; //Can be found in the Details page
    var client = await new pg.Client(conString);
    await client.connect(function (err) {
      if (err) {
        return console.error("could not connect to postgres", err);
      }
    });
    await client.query(
      `TRUNCATE TABLE SWAPS,TRANSACTION,POOL,TOKENZERO,TOKENONE`,
      function (err, res) {
        if (err) {
          return console.error("error", err);
        }
        console.log(res);
      }
    );
    // res.json(resul);
    for (let i = 0; i < res.length; i++) {
      const temp = res[i];
      const id = temp.id;
      const transactionid = temp.transaction.id;
      const timestamp = temp.timestamp;
      const pool = temp.pool.id;
      const token0id = temp.token0.id;
      const token0sym = temp.token0.symbol;
      const token1id = temp.token1.id;
      const token1sym = temp.token1.symbol;
      const sender = temp.sender;
      const recipient = temp.recipient;
      const origin = temp.origin;
      const amount0 = temp.amount0;
      const amount1 = temp.amount1;
      const amountUSD = temp.amountUSD;
      const sqrtPriceX96 = temp.sqrtPriceX96;
      const TICK = temp.tick;
      const logIndex = temp.logIndex;
      await client.query(
        `INSERT INTO SWAPS (ID,TIME,SENDER,RECIPIENT,ORIGIN,AMOUNT0,AMOUNT1,AMOUNTUSD,SQRTPRICEX96,TICK,LOGINDEX) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          id,
          timestamp,
          sender,
          recipient,
          origin,
          amount0,
          amount1,
          amountUSD,
          sqrtPriceX96,
          TICK,
          logIndex,
        ],
        function (err, result) {
          if (err) {
            return console.error("error running query", err);
          }
          console.log(result);
        }
      );
      await client.query(
        `INSERT INTO TRANSACTION (ID,CHILDID) VALUES($1,$2)`,
        [id, transactionid],
        function (err, result) {
          if (err) {
            return console.error("error running query", err);
          }
          console.log(result);
        }
      );
      await client.query(
        `INSERT INTO POOL (ID,CHILDID) VALUES($1,$2)`,
        [id, pool],
        function (err, result) {
          if (err) {
            return console.error("error running query", err);
          }
          console.log(result);
        }
      );
      await client.query(
        `INSERT INTO TOKENZERO (ID,CHILDID,SYMBOL) VALUES($1,$2,$3)`,
        [id, token0id, token0sym],
        function (err, result) {
          if (err) {
            return console.error("error running query", err);
          }
          console.log(result);
        }
      );
      await client.query(
        `INSERT INTO TOKENONE (ID,CHILDID,SYMBOL) VALUES($1,$2,$3)`,
        [id, token1id, token1sym],
        function (err, result) {
          if (err) {
            return console.error("error running query", err);
          }
          console.log(result);
        }
      );
    }
    // client.end();
    // resp.json("success");
    setTimeout(() => {
      resp.json("success");
    }, 150000);
  });
  // const swaps = axios.get("http://localhost:9000/get-swaps").data;
  // const trans = axios.get("http://localhost:9000/get-trans").data;
  // const pool = axios.get("http://localhost:9000/get-pool").data;
  // const tokenzero = axios.get("http://localhost:9000/get-tokenzero").data;
  // const tokenone = axios.get("http://localhost:9000/get-tokenone").data;
  // res.json({ s: swaps, t: trans, p: pool, tz: tokenzero, to: tokenone });
});
app.get("/get-swaps", async (req, res) => {
  console.log("in db");
  var conString = `postgres://ylwzplrk:q05bU2-fiqFWUqcD0E4pBOnO_K7yCTUZ@raja.db.elephantsql.com/ylwzplrk`; //Can be found in the Details page
  var client = await new pg.Client(conString);
  await client.connect(function (err) {
    if (err) {
      return console.error("could not connect to postgres", err);
    }
  });
  await client.query(`SELECT * FROM SWAPS`, async function (err, result) {
    if (err) {
      return console.error("error running query", err);
    } else {
      console.log(result);
      const swaps = await result.rows;
      res.json(result.rows);
      client.end();
    }
  });
});
app.get("/get-trans", async (req, res) => {
  console.log("in db");
  var conString = `postgres://ylwzplrk:q05bU2-fiqFWUqcD0E4pBOnO_K7yCTUZ@raja.db.elephantsql.com/ylwzplrk`; //Can be found in the Details page
  var client = await new pg.Client(conString);
  await client.connect(function (err) {
    if (err) {
      return console.error("could not connect to postgres", err);
    }
  });
  await client.query(`SELECT * FROM TRANSACTION`, async function (err, result) {
    if (err) {
      return console.error("error running query", err);
    } else {
      console.log(result);
      const swaps = await result.rows;
      res.json(result.rows);
      client.end();
    }
  });
});
app.get("/get-pool", async (req, res) => {
  console.log("in db");
  var conString = `postgres://ylwzplrk:q05bU2-fiqFWUqcD0E4pBOnO_K7yCTUZ@raja.db.elephantsql.com/ylwzplrk`; //Can be found in the Details page
  var client = await new pg.Client(conString);
  await client.connect(function (err) {
    if (err) {
      return console.error("could not connect to postgres", err);
    }
  });
  await client.query(`SELECT * FROM POOL`, async function (err, result) {
    if (err) {
      return console.error("error running query", err);
    } else {
      console.log(result);
      const swaps = await result.rows;
      res.json(result.rows);
      client.end();
    }
  });
});
app.get("/get-tokenone", async (req, res) => {
  console.log("in db");
  var conString = `postgres://ylwzplrk:q05bU2-fiqFWUqcD0E4pBOnO_K7yCTUZ@raja.db.elephantsql.com/ylwzplrk`; //Can be found in the Details page
  var client = await new pg.Client(conString);
  await client.connect(function (err) {
    if (err) {
      return console.error("could not connect to postgres", err);
    }
  });
  await client.query(`SELECT * FROM TOKENONE`, async function (err, result) {
    if (err) {
      return console.error("error running query", err);
    } else {
      console.log(result);
      const swaps = await result.rows;
      res.json(result.rows);
      client.end();
    }
  });
});
app.get("/get-tokenzero", async (req, res) => {
  console.log("in db");
  var conString = `postgres://ylwzplrk:q05bU2-fiqFWUqcD0E4pBOnO_K7yCTUZ@raja.db.elephantsql.com/ylwzplrk`; //Can be found in the Details page
  var client = await new pg.Client(conString);
  await client.connect(function (err) {
    if (err) {
      return console.error("could not connect to postgres", err);
    }
  });
  await client.query(`SELECT * FROM TOKENZERO`, async function (err, result) {
    if (err) {
      return console.error("error running query", err);
    } else {
      console.log(result);
      res.json(result.rows);
      client.end();
    }
  });
});
app.listen(9000, console.log("running"));

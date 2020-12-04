const uniqBy = require('lodash/uniqBy');

const D_MAX = 19;
const P_MAX = 13;
const V_MAX = 7;

// moves all of one value into
// another slot
const moveAll = (dpv) => {
  var returnNodes = [];

  // move from D to P
  if (dpv.D + dpv.P <= P_MAX && dpv.D !== 0) {
    returnNodes.push({
      D: 0,
      P: dpv.D + dpv.P,
      V: dpv.V,
    });
  }
  // move from D to V
  if (dpv.D + dpv.V <= V_MAX && dpv.D !== 0) {
    returnNodes.push({
      D: 0,
      P: dpv.P,
      V: dpv.D + dpv.V,
    });
  }
  // move from P to D
  if (dpv.P + dpv.D <= D_MAX && dpv.P !== 0) {
    returnNodes.push({
      D: dpv.D + dpv.P,
      P: 0,
      V: dpv.V,
    });
  }
  // move from P to V
  if (dpv.P + dpv.V <= V_MAX && dpv.P !== 0) {
    returnNodes.push({
      D: dpv.D,
      P: 0,
      V: dpv.P + dpv.V,
    });
  }
  // move from V to D
  if (dpv.V + dpv.D <= D_MAX && dpv.V !== 0) {
    returnNodes.push({
      D: dpv.D + dpv.V,
      P: dpv.P,
      V: 0,
    });
  }
  // move from V to P
  if (dpv.V + dpv.P <= P_MAX && dpv.V !== 0) {
    returnNodes.push({
      D: dpv.D,
      P: dpv.P + dpv.V,
      V: 0,
    });
  }

  return returnNodes;
};

// move a partial amount of on value
//  to fill to limit of another
const moveToLimit = (dpv) => {
  var returnNodes = [];

  // D is not in its max so we can add into it
  if (dpv.D !== D_MAX) {
    let takeAway = D_MAX - dpv.D;
    // we can add from P to D
    if (dpv.D + dpv.P >= D_MAX) {
      returnNodes.push({
        D: D_MAX,
        P: dpv.P - takeAway,
        V: dpv.V,
      });
    }
    // we can add from V to D
    if (dpv.D + dpv.V >= D_MAX) {
      returnNodes.push({
        D: D_MAX,
        P: dpv.P,
        V: dpv.V - takeAway,
      });
    }
  }
  // P is not max so we can add into it
  if (dpv.P !== P_MAX) {
    let takeAway = P_MAX - dpv.P;
    //  we can add D into P
    if (dpv.P + dpv.D >= P_MAX) {
      returnNodes.push({
        D: dpv.D - takeAway,
        P: P_MAX,
        V: dpv.V,
      });
    }
    // we can add V into P
    if (dpv.P + dpv.V >= P_MAX) {
      returnNodes.push({
        D: dpv.D,
        P: P_MAX,
        V: dpv.V - takeAway,
      });
    }
  }
  // V is not in its max so we can add into it
  if (dpv.V !== V_MAX) {
    let takeAway = V_MAX - dpv.V;
    // we can add D into V
    if (dpv.V + dpv.D >= V_MAX) {
      returnNodes.push({
        D: dpv.D - takeAway,
        P: dpv.P,
        V: V_MAX,
      });
    }
    // we can add P into V
    if (dpv.V + dpv.P >= V_MAX) {
      returnNodes.push({
        D: dpv.D,
        P: dpv.P - takeAway,
        V: V_MAX,
      });
    }
  }

  return returnNodes;
};

// consolidate takes two arrays, combines them while
// removing duplicates.
const consolidate = (dpv1, dpv2) => {
  let dpv = [...dpv1, ...dpv2];
  var uniq = uniqBy(dpv, function(o) {
    return JSON.stringify([o.D, o.P, o.V]);
  })

  return uniq;
}

// return a random element from the array of nodes (move_options)
const move = (move_options) => {
  var randIndex = Math.floor(Math.random() * move_options.length);
  var dpvChoice = move_options[randIndex];
  return {
    Index: randIndex,
    DPV: dpvChoice
  }
}


const testMoveAll = () => {
  let dpv = {
    D: 14,
    P: 5,
    V: 0,
  };

  let nodes = moveToLimit(dpv);
  console.log("Move to Limit Results:\n");
  console.log(nodes);

  
  let nodes2 = moveAll(dpv);
  console.log("Move All results:\n");
  console.log(nodes2);

  let newNodes = consolidate(nodes, nodes2);

  console.log("\nConslidation:\n")
  console.log(newNodes);
  
  /*
  console.log("\nMoving to: \n")
  var moved = move(nodes);
  console.log(moved);
  */
};

const DPVToString = dpv => {
  return ("DPV("+ dpv.D + " " + dpv.P + " " + dpv.V + ")");
}



const runTests = () => {
  testMoveAll();
};

module.exports = { moveAll, moveToLimit, consolidate, move, DPVToString, testMoveAll, runTests };

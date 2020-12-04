import React, { useEffect, useState } from "react";
import Graph from "react-graph-vis";
import cloneDeep from "lodash/cloneDeep";
import { v4 as uuidv4 } from "uuid";
import {moveAll, moveToLimit, consolidate, move, DPVToString} from './utils/common.js';

const startingDPV = {
  D: 0,
  P: 13,
  V: 6
}

const graph = {
  nodes: [
    { id: 1, label: DPVToString(startingDPV), DPV: startingDPV, color: 'red'},
  ],
  edges: [

  ]
};

/*
edges: [
  { from: ID, to: ID },
  { from: ID, to: ID },
]
*/

export default function App() {
  const [graphData, setGraphData] = useState(graph);
  const options = {
    layout: {
      hierarchical: true
    },
    edges: {
      color: "#000000"
    },
    height: "1000px"
  };

  const generateRandomNode = e => {
    let newGraph = cloneDeep(graphData);

    const newNodeId = Math.max(...newGraph.nodes.map(d => d.id)) + 1;
    const newNode = {
      id: newNodeId,
      label: `Node ${newNodeId}`,
      title: `node ${newNodeId} tootip text`
    };
    const randomIndexForEdge =
      newGraph.nodes[Math.floor(Math.random() * newGraph.nodes.length)].id;

    const fromBool = [true, false][Math.floor(Math.random() * 2)];

    const newRandomEdge = {
      from: !!fromBool ? randomIndexForEdge : newNodeId,
      to: !fromBool ? randomIndexForEdge : newNodeId
    };

    newGraph.nodes.push(newNode);
    newGraph.edges.push(newRandomEdge);
    setGraphData(newGraph);
  };

  useEffect( () => {
    var node = graphData.nodes[0];
    console.log("hello world!");
    
    setInterval( () => {
      var connections = consolidate(moveAll(node.DPV), moveToLimit(node.DPV));
      console.log(connections);
      var nextMove = move(connections);
      let newGraph = cloneDeep(graphData);
      
      for (var i in connections) {
        const newNodeID = Math.max(...newGraph.nodes.map(d => d.id)) + 1;
        const newNode = {
          id: newNodeID,
          label: DPVToString(connections[i]),
          DPV: connections[i],
          color: "red"
        }
        const newEdge = {
          from: node.id,
          to: newNodeID
        }
        newGraph.nodes.push(newNode);
        newGraph.edges.push(newEdge);
        if(connections[i] === nextMove) {
          node = newNode;
        }
      }
      setGraphData(newGraph);
    }, 3000)
  }, [])

  return (
    <div className="App">
      <button onClick={() => setGraphData(cloneDeep(graph))}>
        Back to Original
      </button>
      <button onClick={generateRandomNode}>Generate Random Node</button>
      <Graph key={uuidv4} graph={graphData} options={options} />
    </div>
  );
}
import React, { useEffect, useRef, useState } from "react";
import Graph from "react-graph-vis";
import cloneDeep from "lodash/cloneDeep";
import { v4 as uuidv4 } from "uuid";
import {moveAll, moveToLimit, consolidate, move, DPVToString } from './utils/common.js';

const startingDPV = {
  D: 0,
  P: 13,
  V: 6
}

const graph = {
  nodes: [
    { id: 1, label: DPVToString(startingDPV), DPV: startingDPV, color: 'orange'},
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
  const graphDataRef = useRef(graphData);
  graphDataRef.current = graphData;

  const [currentNode, setCurrentNode] = useState(0);
  const currentNodeRef = useRef(currentNode);
  currentNodeRef.current = currentNode;

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
    let newGraph = cloneDeep(graphDataRef.current);

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

  const Run = () => {
    var Runner = setInterval( () => {
      //  get the current node
      var currNode = graphDataRef.current.nodes[currentNodeRef.current];

      //  check if we are at the balloon juice thing
      if (currNode.DPV.D === 3 && currNode.DPV.P === 13 && currNode.DPV.V === 3) {
        console.log("DONE");
        clearInterval(Runner);
      }

      //  copy the state
      let newGraph = cloneDeep(graphDataRef.current);

      var currentDPV = currNode.DPV;
      var possibleMoves = consolidate(moveAll(currentDPV), moveToLimit(currentDPV));
      var pick =  move(possibleMoves);

      var nextNodeDPV = pick.DPV;
      var nextNodeIndex = pick.Index;

      var set = false;
      for (var i in newGraph.nodes) {
        var current = newGraph.nodes[i];
        // check if node already exists in the network. 
        if(current.D === nextNodeDPV.D && current.P === nextNodeDPV.P && current.V === nextNodeDPV.V) {
          current.color = "orange";
          set = true;
          setCurrentNode(i);
        }
        current.color = "pink";
      }

      if (set) {
        setGraphData(newGraph);
        return;
      }
      
      
      // now possible moves has all but the next node we want to move to.
      possibleMoves.splice(nextNodeIndex, 1);

      for (let i in possibleMoves) {
        const newNodeId = Math.max(...newGraph.nodes.map(d => d.id)) + 1;
        const newNode = {
          id: newNodeId,
          label: DPVToString(possibleMoves[i]),
          DPV: possibleMoves[i],
          color: "pink"
        }
        const newEdge = {
          from: currNode.id,
          to: newNodeId
        }

        newGraph.nodes.push(newNode);
        newGraph.edges.push(newEdge);
      }

      const newNodeId = Math.max(...newGraph.nodes.map(d => d.id)) + 1;
      const newNode = {
        id: newNodeId,
        label: DPVToString(nextNodeDPV),
        DPV: nextNodeDPV,
        color: "orange"
      }
      const newEdge = {
        from: currNode.id,
        to: newNodeId
      }

      var newIdx = newGraph.nodes.push(newNode) - 1;
      newGraph.edges.push(newEdge);
      setGraphData(newGraph);
      setCurrentNode(newIdx);
    }, 5000)
  }

  useEffect( () => {
    Run();
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
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
    { id: 1, label: DPVToString(startingDPV), DPV: startingDPV, color: 'orange', visited: true},
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

  const [toggle, setToggle] = useState(false);
  const toggleRef = useRef(toggle);
  toggleRef.current = toggle;

  const options = {
    layout: {
      hierarchical: true
    },
    edges: {
      color: "#000000"
    },
    height: "1000px"
  };


  const Run = () => {
    var Runner = setInterval( () => {
      //  get the current node
      let currNode = graphDataRef.current.nodes[currentNodeRef.current];
      
      //  check if we are at the balloon juice thing
      if ((currNode.DPV.D === 3 && currNode.DPV.P === 13 && currNode.DPV.V === 3)|| toggleRef.current) {
        return
        //clearInterval(Runner);
      }

      //  copy the state
      let newGraph = cloneDeep(graphDataRef.current);

      //  get the next possible moves
      let possibleMoves = consolidate(moveAll(currNode.DPV), moveToLimit(currNode.DPV));

      let newDPVNotSeen = [];
      // check if these nodes exist in the network, update edges accordingly
      for (let i in possibleMoves) {
        for(let j in newGraph.nodes) {
          let g1 = newGraph.nodes[j].DPV;
          let g2 = possibleMoves[i];
          // found a possible move already in the graph, add edge
          if (g1.D === g2.D && g1.P === g2.P && g1.V === g2.V) {
            newGraph.edges.push({
              from: newGraph.nodes[j].id,
              to: currNode.id
            })
          } else {
            // its a new DPV, add it to the new nodes to be pushed
            newDPVNotSeen.push(g2);
          }
        }
      } // existing edges updated to point to current node, if it was one of the possible moves to begin with




      let nextGraphNodeIndex;
      let pick =  move(possibleMoves);
      let nextNodeDPV = pick.DPV;
      let nextNodeIndex = pick.Index;


      let nextNodeExistAlready = false;
      // loop through graph and reset colors
      for (let i in newGraph.nodes) {
        let current = newGraph.nodes[i];
        // check if node already exists in the network and update its color
        if(current.D === nextNodeDPV.D && current.P === nextNodeDPV.P && current.V === nextNodeDPV.V) {
          current.color = "orange"; // set color for active node
          nextGraphNodeIndex = i; // set state state for current node next run
          nextNodeExistAlready = true;
        }
        current.color = "pink"; // reset color
      }
      
      // we now have - 
      // 1. the node we are moving to exists and its color was set
      // 2. the node we are moving to is new and has yet to be added to the graph


      // if the selected node doesn't exist already, add it to the graph with orange color
      // along with its edge
      if(!nextNodeExistAlready) { 
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
        newGraph.nodes.push(newNode);
        newGraph.edges.push(newEdge);
        possibleMoves.splice(nextNodeIndex, 1);
        nextGraphNodeIndex = newGraph.nodes.length - 1;
        for(let i in possibleMoves) {
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
      } else { // the node we are going to already exists, so add all nodes/edges except for the one that already exist
        for(let i in newDPVNotSeen) {
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
      }
      

      setGraphData(newGraph);
      setCurrentNode(nextGraphNodeIndex);








      /*
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
      */
    }, 3500)
  }

  useEffect( () => {
    Run();
  }, [])

  return (
    <div className="App">
      <button onClick={() => {setToggle(!toggle)}}>
        Stop
      </button>
      <button onClick={() => { console.log("hi")}}>Generate Random Node</button>
      <Graph key={uuidv4} graph={graphData} options={options} />
    </div>
  );
}

/*
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
*/
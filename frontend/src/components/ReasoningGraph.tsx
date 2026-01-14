'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ReasoningMap } from '@/types';

interface ReasoningGraphProps {
  data: ReasoningMap;
}

export function ReasoningGraph({ data }: ReasoningGraphProps) {
  const initialNodes: Node[] = useMemo(() => {
    return data.nodes.map((node, index) => ({
      id: node.id,
      type: 'default',
      position: node.position,
      data: {
        label: (
          <div className="text-sm">
            <div className={`font-semibold inline-block px-2 py-1 rounded text-xs mb-1 ${
              node.type === 'premise' ? 'bg-blue-100 text-blue-700' :
              node.type === 'evidence' ? 'bg-green-100 text-green-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {node.type.toUpperCase()}
            </div>
            <div>{node.label}</div>
          </div>
        ),
      },
      style: {
        background: node.type === 'premise' ? '#dbeafe' :
                  node.type === 'evidence' ? '#dcfce7' :
                  '#f3e8ff',
        border: '2px solid',
        borderColor: node.type === 'premise' ? '#3b82f6' :
                    node.type === 'evidence' ? '#22c55e' :
                    '#a855f7',
        borderRadius: '8px',
        width: 200,
        padding: '8px',
      },
    }));
  }, [data.nodes]);

  const initialEdges: Edge[] = useMemo(() => {
    return data.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: edge.hasFallacy,
      style: {
        stroke: edge.hasFallacy ? '#ef4444' : '#64748b',
        strokeWidth: edge.hasFallacy ? 3 : 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.hasFallacy ? '#ef4444' : '#64748b',
      },
      labelStyle: {
        fontSize: '11px',
        fontWeight: 600,
        fill: edge.hasFallacy ? '#ef4444' : '#64748b',
      },
    }));
  }, [data.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full border rounded-lg bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        connectionMode={ConnectionMode.Loose}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      {data.analysis && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Logical Analysis</h4>
          <p className="text-sm text-muted-foreground">{data.analysis}</p>
        </div>
      )}
    </div>
  );
}

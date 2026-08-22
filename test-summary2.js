const response = await fetch('http://localhost:5000/api/study-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    messages: [{ role: 'user', content: 'Summarize these study notes from "DS-notes.txt" for exam revision:\n\nBinary Trees:\n- Definition: A hierarchical data structure where each node has at most two children (left and right)\n- Types: Full, Complete, Perfect, Balanced, Degenerate\n- Traversals: Inorder (Left-Root-Right), Preorder (Root-Left-Right), Postorder (Left-Right-Root)\n- Time Complexity: Search O(h), Insert O(h), Delete O(h) where h is height\n- BST: Binary Search Tree where left < root < right\n- AVL Tree: Self-balancing BST with height difference <= 1\n- Rotations: LL, RR, LR, RL\n\nGraphs:\n- Definition: Set of vertices connected by edges\n- Representations: Adjacency Matrix, Adjacency List\n- Traversals: BFS (queue), DFS (stack/recursion)\n- Algorithms: Dijkstra (shortest path), Kruskal/Prim (MST), Topological Sort\n- Time: BFS/DFS O(V+E), Dijkstra O((V+E)logV)' }],
    mode: 'summary'
  })
});
const data = await response.json();
console.log('Status:', response.status);
console.log('Response:', data);
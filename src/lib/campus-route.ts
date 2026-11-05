/**
 * Trasa piesza po kampusie - najkrótsza droga po sieci chodników z OpenStreetMap
 * (graf z scripts/build-campus-map.mjs, plik public/mapa/graf-pieszy.json).
 *
 * „Bez schodów” pomija odcinki highway=steps. Liczymy w przeglądarce: graf
 * ma ok. 3 tys. węzłów, Dijkstra z kopcem trwa milisekundy.
 */
export interface WalkGraph {
  nodes: [number, number][];
  /** [a, b, 1 = schody] */
  edges: [number, number, number][];
}

export type Adjacency = { to: number; len: number; steps: boolean }[][];

/** Średnie tempo marszu: 80 m na minutę (ok. 4,8 km/h). */
export const WALK_M_PER_MIN = 80;

export function buildAdjacency(g: WalkGraph): Adjacency {
  const adj: Adjacency = g.nodes.map(() => []);
  for (const [a, b, s] of g.edges) {
    const [ax, ay] = g.nodes[a], [bx, by] = g.nodes[b];
    const len = Math.hypot(bx - ax, by - ay);
    adj[a].push({ to: b, len, steps: s === 1 });
    adj[b].push({ to: a, len, steps: s === 1 });
  }
  return adj;
}

/** Najbliższy węzeł grafu do punktu planu (metry). */
export function nearestNode(g: WalkGraph, [x, y]: [number, number]): number {
  let best = 0, bd = Infinity;
  for (let i = 0; i < g.nodes.length; i++) {
    const d = (g.nodes[i][0] - x) ** 2 + (g.nodes[i][1] - y) ** 2;
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}

export function shortestPath(adj: Adjacency, from: number, to: number, avoidSteps = false): { nodes: number[]; length: number; steps: boolean } | null {
  const dist = new Float64Array(adj.length).fill(Infinity);
  const prev = new Int32Array(adj.length).fill(-1);
  const viaSteps = new Uint8Array(adj.length);
  // Kopiec binarny par [odległość, węzeł].
  const heap: [number, number][] = [[0, from]];
  dist[from] = 0;
  const push = (item: [number, number]) => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = (): [number, number] => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  while (heap.length) {
    const [d, v] = pop();
    if (d > dist[v]) continue;
    if (v === to) break;
    for (const e of adj[v]) {
      if (avoidSteps && e.steps) continue;
      const nd = d + e.len;
      if (nd < dist[e.to]) {
        dist[e.to] = nd;
        prev[e.to] = v;
        viaSteps[e.to] = viaSteps[v] || (e.steps ? 1 : 0);
        push([nd, e.to]);
      }
    }
  }
  if (!Number.isFinite(dist[to])) return null;
  const nodes: number[] = [];
  for (let v = to; v !== -1; v = prev[v]) nodes.push(v);
  return { nodes: nodes.reverse(), length: dist[to], steps: viaSteps[to] === 1 };
}

export function walkMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / WALK_M_PER_MIN));
}

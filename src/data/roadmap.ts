/**
 * Roadmap nodes that don't have a full lesson yet. Real topics come from
 * src/content/topics/*.mdx (their `chapter` = phase, `order` = position).
 * A placeholder sits right after the topic named in `after` (or first in the phase if omitted).
 * To promote one to a full lesson: create the MDX with the same slug and delete it here.
 */
export interface SoonNode {
  slug: string;
  phase: number;
  after?: string;
  title: string;
  summary: string;
  code: string;
  complexity: [string, string][];
  practice: { name: string; url: string; level: 'easy' | 'medium' | 'hard' }[];
  related?: string[];
}

export const comingSoon: SoonNode[] = [
  {
    slug: 'references',
    phase: 1,
    after: 'pointers-and-memory',
    title: 'References',
    summary:
      'A reference is another name for an existing variable. Unlike a pointer it can never be null or re-pointed, so functions use `T&` to change their argument and `const T&` to read big objects without copying.',
    code: `void addOne(int& x) { x++; }          // changes the caller's variable

int sum(const vector<int>& v) {        // no copy, read-only
    int s = 0;
    for (int x : v) s += x;
    return s;
}`,
    complexity: [
      ['Passing by reference', 'O(1), no copy'],
      ['Passing a vector by value', 'O(n) copy'],
    ],
    practice: [
      {
        name: 'Swap two integers through references, then through pointers',
        url: 'https://www.learncpp.com/cpp-tutorial/pass-by-lvalue-reference/',
        level: 'easy',
      },
    ],
    related: ['pointers-and-memory'],
  },
  {
    slug: 'avl-trees',
    phase: 4,
    after: 'bst-delete',
    title: 'AVL Trees',
    summary:
      'A BST that rebalances itself. After every insert or delete, each node checks that its two subtrees differ in height by at most 1, and fixes any imbalance with rotations, so operations stay O(log n) even on sorted input.',
    code: `Node* rotateRight(Node* y) {
    Node* x = y->left;
    y->left = x->right;
    x->right = y;
    update(y);                         // recompute heights, child first
    update(x);
    return x;                          // x is the new subtree root
}`,
    complexity: [
      ['Search / insert / delete', 'O(log n) worst case'],
      ['One rotation', 'O(1)'],
    ],
    practice: [
      {
        name: 'Balanced Binary Tree',
        url: 'https://leetcode.com/problems/balanced-binary-tree/',
        level: 'easy',
      },
    ],
    related: ['bst', 'bst-delete'],
  },
  {
    slug: 'shortest-paths',
    phase: 6,
    after: 'bfs-dfs',
    title: 'Shortest Paths',
    summary:
      "BFS already finds the fewest-edges path. When edges have weights, Dijkstra's algorithm picks the closest unfinished vertex with a priority queue and relaxes its edges.",
    code: `priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
dist[s] = 0;
pq.push({0, s});
while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (d > dist[u]) continue;         // stale entry
    for (auto [v, w] : adj[u])
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            pq.push({dist[v], v});
        }
}`,
    complexity: [
      ['BFS (unweighted)', 'O(V + E)'],
      ['Dijkstra with a heap', 'O((V + E) log V)'],
    ],
    practice: [
      {
        name: 'Network Delay Time',
        url: 'https://leetcode.com/problems/network-delay-time/',
        level: 'medium',
      },
    ],
    related: ['bfs-dfs', 'heap-sort'],
  },
  {
    slug: 'divide-and-conquer',
    phase: 7,
    title: 'Divide & Conquer',
    summary:
      'Split the problem into smaller copies of itself, solve them recursively, and combine the answers. You have already used it: binary search, merge sort and quick sort are all divide and conquer.',
    code: `int maxOf(const vector<int>& a, int lo, int hi) {
    if (lo == hi) return a[lo];                   // base case
    int mid = lo + (hi - lo) / 2;
    return max(maxOf(a, lo, mid), maxOf(a, mid + 1, hi));
}`,
    complexity: [
      ['Merge sort recurrence T(n) = 2T(n/2) + n', 'O(n log n)'],
      ['Binary search T(n) = T(n/2) + 1', 'O(log n)'],
    ],
    practice: [
      {
        name: 'Maximum Subarray (try the divide and conquer version)',
        url: 'https://leetcode.com/problems/maximum-subarray/',
        level: 'medium',
      },
    ],
    related: ['merge-sort', 'quick-sort', 'binary-search'],
  },
  {
    slug: 'greedy',
    phase: 7,
    after: 'divide-and-conquer',
    title: 'Greedy Algorithms',
    summary:
      'Make the choice that looks best right now and never undo it. It is fast and simple, but only correct when you can prove local choices lead to a global optimum.',
    code: `// Most meetings in one room: always take the one that ends first
sort(m.begin(), m.end(), [](auto& a, auto& b) { return a.second < b.second; });
int count = 0, freeAt = INT_MIN;
for (auto [start, end] : m)
    if (start >= freeAt) { count++; freeAt = end; }`,
    complexity: [['Interval scheduling', 'O(n log n) for the sort']],
    practice: [
      {
        name: 'Assign Cookies',
        url: 'https://leetcode.com/problems/assign-cookies/',
        level: 'easy',
      },
      {
        name: 'Non-overlapping Intervals',
        url: 'https://leetcode.com/problems/non-overlapping-intervals/',
        level: 'medium',
      },
    ],
  },
  {
    slug: 'dynamic-programming',
    phase: 7,
    after: 'greedy',
    title: 'Dynamic Programming',
    summary:
      'Recursion that remembers. When the same subproblems repeat, store each answer once (memoisation) or fill a table bottom-up, turning exponential time into polynomial time.',
    code: `long long fib(int n, vector<long long>& memo) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];            // already solved
    return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
}`,
    complexity: [
      ['Plain recursive Fibonacci', 'O(2ⁿ)'],
      ['Memoised / tabulated', 'O(n) time, O(n) space'],
    ],
    practice: [
      {
        name: 'Climbing Stairs',
        url: 'https://leetcode.com/problems/climbing-stairs/',
        level: 'easy',
      },
      { name: 'House Robber', url: 'https://leetcode.com/problems/house-robber/', level: 'medium' },
    ],
    related: ['recursion'],
  },
];

#include <iostream>
#include <vector>
#include <queue>
#include <stack>
using namespace std;

void bfs(int s, const vector<vector<int>>& adj) {
    vector<bool> visited(adj.size(), false);
    queue<int> q;
    visited[s] = true;
    q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        cout << u << " ";
        for (int v : adj[u])
            if (!visited[v]) {
                visited[v] = true;            // mark when enqueued, not when printed
                q.push(v);
            }
    }
}

void dfs(int u, const vector<vector<int>>& adj, vector<bool>& visited) {
    visited[u] = true;
    cout << u << " ";
    for (int v : adj[u])
        if (!visited[v]) dfs(v, adj, visited);
}

void dfsIterative(int s, const vector<vector<int>>& adj) {
    vector<bool> visited(adj.size(), false);
    stack<int> st;
    st.push(s);
    while (!st.empty()) {
        int u = st.top(); st.pop();
        if (visited[u]) continue;
        visited[u] = true;
        cout << u << " ";
        for (int i = adj[u].size() - 1; i >= 0; i--)   // push in reverse so the smallest pops first
            if (!visited[adj[u][i]]) st.push(adj[u][i]);
    }
}

int main() {
    vector<vector<int>> adj = {
        {1, 3},        // 0
        {0, 2, 4},     // 1
        {1, 5},        // 2
        {0, 4},        // 3
        {1, 3, 5},     // 4
        {2, 4},        // 5
    };
    cout << "BFS from 0: "; bfs(0, adj); cout << "\n";
    vector<bool> vis(adj.size(), false);
    cout << "DFS from 0: "; dfs(0, adj, vis); cout << "\n";
    cout << "DFS (stack): "; dfsIterative(0, adj); cout << "\n";
}

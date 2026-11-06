#include <iostream>
#include <vector>
using namespace std;

const int V = 6;

int main() {
    int edges[][2] = {{0, 1}, {0, 3}, {1, 2}, {1, 4}, {3, 4}, {2, 5}, {4, 5}};

    int matrix[V][V] = {};                    // O(V²) space
    vector<vector<int>> list(V);              // O(V + E) space
    for (auto& e : edges) {
        int u = e[0], v = e[1];
        matrix[u][v] = matrix[v][u] = 1;      // undirected: both directions
        list[u].push_back(v);
        list[v].push_back(u);
    }

    cout << "Adjacency matrix:\n   ";
    for (int j = 0; j < V; j++) cout << j << " ";
    cout << "\n";
    for (int i = 0; i < V; i++) {
        cout << i << ": ";
        for (int j = 0; j < V; j++) cout << matrix[i][j] << " ";
        cout << "\n";
    }

    cout << "Adjacency list:\n";
    for (int i = 0; i < V; i++) {
        cout << i << " ->";
        for (int v : list[i]) cout << " " << v;
        cout << "   (degree " << list[i].size() << ")\n";
    }

    cout << "edge 1-4? " << (matrix[1][4] ? "yes" : "no") << ", edge 0-5? " << (matrix[0][5] ? "yes" : "no") << "\n";
}

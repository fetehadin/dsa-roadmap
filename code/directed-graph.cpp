#include <iostream>
#include <vector>
using namespace std;

const int V = 6;

int main() {
    // one-way arrows u -> v
    int edges[][2] = {{0, 1}, {1, 2}, {2, 5}, {3, 0}, {4, 3}, {1, 4}, {5, 4}};

    int matrix[V][V] = {};
    vector<vector<int>> out(V);
    for (auto& e : edges) {
        matrix[e[0]][e[1]] = 1;                // only one direction
        out[e[0]].push_back(e[1]);
    }

    for (int u = 0; u < V; u++) {
        int in = 0;
        for (int w = 0; w < V; w++) in += matrix[w][u];   // column sum
        cout << u << ": out ->";
        for (int v : out[u]) cout << " " << v;
        cout << " | in-degree " << in << ", out-degree " << out[u].size() << "\n";
    }

    bool symmetric = true;
    for (int i = 0; i < V; i++)
        for (int j = 0; j < V; j++)
            if (matrix[i][j] != matrix[j][i]) symmetric = false;
    cout << "matrix symmetric? " << (symmetric ? "yes" : "no") << "\n";
    cout << "0->1? " << matrix[0][1] << "  1->0? " << matrix[1][0] << "\n";
}

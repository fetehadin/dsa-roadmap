// Lab: Map Navigator (starter). Build each part, test it, then move to the next milestone.
#include <iostream>
#include <string>
#include <vector>
#include <queue>
using namespace std;

struct BNode {
    string name;
    int id;
    BNode* left = nullptr;
    BNode* right = nullptr;
};

BNode* insert(BNode* r, const string& name, int id) {
    // TODO: standard recursive BST insert keyed by name
    if (!r) return new BNode{name, id};
    return r;
}
int findId(BNode* r, const string& name) {
    // TODO: iterative BST search, return id or -1
    (void)r; (void)name;
    return -1;
}
void destroy(BNode* r) { if (!r) return; destroy(r->left); destroy(r->right); delete r; }

// TODO: BFS that fills dist[] and parent[] (for ROUTE and NEAREST)
// TODO: recursive DFS that records the visit order (for REACH)
// TODO: merge sort of {name, hops} by hops then name; quick sort of names A-Z

int main() {
    int n, m;
    cin >> n;
    vector<string> names(n);
    BNode* root = nullptr;
    for (int i = 0; i < n; i++) { cin >> names[i]; root = insert(root, names[i], i); }
    cin >> m;
    vector<vector<int>> adj(n);
    for (int k = 0; k < m; k++) {
        string a, b;
        cin >> a >> b;
        // TODO: look up both ids in the BST and add an undirected edge
    }
    string cmd;
    while (cin >> cmd) {
        string rest;
        getline(cin, rest);
        cout << "TODO " << cmd << "\n";       // ROUTE a b · NEAREST a · REACH a
    }
    destroy(root);
}

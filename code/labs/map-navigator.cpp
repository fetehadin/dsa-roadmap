// Lab: Map Navigator (solution)
#include <iostream>
#include <string>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;

// ---------- BST of buildings, keyed by name ----------
struct BNode {
    string name;
    int id;
    BNode* left = nullptr;
    BNode* right = nullptr;
};

BNode* insert(BNode* r, const string& name, int id) {
    if (!r) return new BNode{name, id};
    if (name < r->name) r->left = insert(r->left, name, id);
    else if (name > r->name) r->right = insert(r->right, name, id);
    return r;
}
int findId(BNode* r, const string& name) {
    while (r) {
        if (name == r->name) return r->id;
        r = name < r->name ? r->left : r->right;
    }
    return -1;
}
void inorder(BNode* r) { if (!r) return; inorder(r->left); cout << r->name << " "; inorder(r->right); }
void destroy(BNode* r) { if (!r) return; destroy(r->left); destroy(r->right); delete r; }

// ---------- graph traversals ----------
vector<int> bfsDistances(int s, const vector<vector<int>>& adj, vector<int>& parent) {
    vector<int> dist(adj.size(), -1);
    parent.assign(adj.size(), -1);
    queue<int> q;
    dist[s] = 0;
    q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u])
            if (dist[v] == -1) { dist[v] = dist[u] + 1; parent[v] = u; q.push(v); }
    }
    return dist;
}
void dfs(int u, const vector<vector<int>>& adj, vector<bool>& seen, vector<int>& order) {
    seen[u] = true;
    order.push_back(u);
    for (int v : adj[u]) if (!seen[v]) dfs(v, adj, seen, order);
}

// ---------- sorting results ----------
struct Result { string name; int hops; };
bool before(const Result& a, const Result& b) { return a.hops != b.hops ? a.hops < b.hops : a.name < b.name; }

void mergeSort(vector<Result>& a, int lo, int hi) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    mergeSort(a, lo, mid);
    mergeSort(a, mid + 1, hi);
    vector<Result> tmp;
    int i = lo, j = mid + 1;
    while (i <= mid && j <= hi) tmp.push_back(before(a[j], a[i]) ? a[j++] : a[i++]);
    while (i <= mid) tmp.push_back(a[i++]);
    while (j <= hi) tmp.push_back(a[j++]);
    for (int k = 0; k < (int)tmp.size(); k++) a[lo + k] = tmp[k];
}
int partition(vector<string>& a, int lo, int hi) {
    string pivot = a[hi];
    int i = lo - 1;
    for (int j = lo; j < hi; j++) if (a[j] < pivot) swap(a[++i], a[j]);
    swap(a[i + 1], a[hi]);
    return i + 1;
}
void quickSort(vector<string>& a, int lo, int hi) {
    if (lo < hi) { int p = partition(a, lo, hi); quickSort(a, lo, p - 1); quickSort(a, p + 1, hi); }
}

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
        int u = findId(root, a), v = findId(root, b);
        if (u == -1 || v == -1) { cout << "unknown building in path " << a << "-" << b << "\n"; continue; }
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    for (auto& l : adj) sort(l.begin(), l.end(), [&](int x, int y) { return names[x] < names[y]; });

    cout << "Buildings (BST inorder): ";
    inorder(root);
    cout << "\n";

    string cmd;
    while (cin >> cmd) {
        if (cmd == "ROUTE") {
            string a, b;
            cin >> a >> b;
            int s = findId(root, a), t = findId(root, b);
            if (s == -1 || t == -1) { cout << "unknown building\n"; continue; }
            vector<int> parent;
            vector<int> dist = bfsDistances(s, adj, parent);
            if (dist[t] == -1) { cout << "no route from " << a << " to " << b << "\n"; continue; }
            vector<string> path;
            for (int v = t; v != -1; v = parent[v]) path.push_back(names[v]);
            cout << "route " << a << " -> " << b << " (" << dist[t] << " hops): ";
            for (int k = path.size() - 1; k >= 0; k--) cout << path[k] << (k ? " > " : "\n");
        } else if (cmd == "NEAREST") {
            string a;
            cin >> a;
            int s = findId(root, a);
            if (s == -1) { cout << "unknown building\n"; continue; }
            vector<int> parent;
            vector<int> dist = bfsDistances(s, adj, parent);
            vector<Result> r;
            for (int v = 0; v < n; v++) if (v != s && dist[v] != -1) r.push_back({names[v], dist[v]});
            mergeSort(r, 0, (int)r.size() - 1);
            cout << "nearest to " << a << ":";
            for (auto& x : r) cout << " " << x.name << "(" << x.hops << ")";
            cout << "\n";
        } else if (cmd == "REACH") {
            string a;
            cin >> a;
            int s = findId(root, a);
            if (s == -1) { cout << "unknown building\n"; continue; }
            vector<bool> seen(n, false);
            vector<int> order;
            dfs(s, adj, seen, order);
            vector<string> reach;
            for (int v : order) reach.push_back(names[v]);
            cout << "DFS order from " << a << ":";
            for (auto& x : reach) cout << " " << x;
            quickSort(reach, 0, (int)reach.size() - 1);
            cout << "\nreachable A-Z:";
            for (auto& x : reach) cout << " " << x;
            cout << "\n";
        }
    }
    destroy(root);
}

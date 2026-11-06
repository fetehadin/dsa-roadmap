#include <iostream>
#include <list>
#include <vector>
using namespace std;

const int M = 7;
int h(int key) { return key % M; }

struct ChainTable {                           // separate chaining
    vector<list<int>> table = vector<list<int>>(M);
    void insert(int key) { table[h(key)].push_back(key); }
    bool search(int key) const {
        for (int k : table[h(key)]) if (k == key) return true;
        return false;
    }
};

struct ProbeTable {                           // open addressing, linear probing
    int table[M];
    ProbeTable() { for (int& x : table) x = -1; }
    bool insert(int key) {
        for (int i = 0; i < M; i++) {
            int idx = (h(key) + i) % M;
            if (table[idx] == -1) { table[idx] = key; return true; }
        }
        return false;
    }
    int search(int key) const {               // index, or -1
        for (int i = 0; i < M; i++) {
            int idx = (h(key) + i) % M;
            if (table[idx] == -1) return -1;   // an empty slot ends the search
            if (table[idx] == key) return idx;
        }
        return -1;
    }
};

int main() {
    int keys[] = {14, 23, 12, 21, 30};
    ChainTable c;
    ProbeTable p;
    for (int k : keys) { c.insert(k); p.insert(k); }

    cout << "chaining:\n";
    for (int i = 0; i < M; i++) {
        cout << "  " << i << ":";
        for (int k : c.table[i]) cout << " " << k;
        cout << "\n";
    }
    cout << "linear probing: ";
    for (int x : p.table) cout << (x == -1 ? string("_") : to_string(x)) << " ";
    cout << "\n";
    cout << "search 21: chain " << (c.search(21) ? "found" : "missing") << ", probe index " << p.search(21) << "\n";
    cout << "search 5:  chain " << (c.search(5) ? "found" : "missing") << ", probe index " << p.search(5) << "\n";
}

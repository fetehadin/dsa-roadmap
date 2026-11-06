#include <iostream>
#include <string>
using namespace std;

struct GNode {
    char data;
    GNode* firstChild;    // leftmost child
    GNode* nextSibling;   // next brother to the right
};

GNode* make(char c) { return new GNode{c, nullptr, nullptr}; }

void addChild(GNode* parent, GNode* child) {
    if (!parent->firstChild) { parent->firstChild = child; return; }
    GNode* s = parent->firstChild;
    while (s->nextSibling) s = s->nextSibling;
    s->nextSibling = child;
}

void print(GNode* n, int depth) {          // preorder with indentation
    if (n == nullptr) return;
    cout << string(depth * 2, ' ') << n->data << "\n";
    print(n->firstChild, depth + 1);
    print(n->nextSibling, depth);
}

int countChildren(GNode* n) {
    int c = 0;
    for (GNode* k = n->firstChild; k; k = k->nextSibling) c++;
    return c;
}

void destroy(GNode* n) { if (!n) return; destroy(n->firstChild); destroy(n->nextSibling); delete n; }

int main() {
    GNode *A = make('A'), *B = make('B'), *C = make('C'), *D = make('D');
    addChild(A, B); addChild(A, C); addChild(A, D);
    addChild(B, make('E')); addChild(B, make('F'));
    addChild(D, make('G')); addChild(D, make('H')); addChild(D, make('I'));
    print(A, 0);
    cout << "children of A: " << countChildren(A) << ", of D: " << countChildren(D) << "\n";
    destroy(A);
}

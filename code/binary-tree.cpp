#include <iostream>
#include <algorithm>
using namespace std;

struct Node {
    int data;
    Node* left;
    Node* right;
};

Node* make(int x, Node* l = nullptr, Node* r = nullptr) { return new Node{x, l, r}; }

int countNodes(Node* r) { return r ? 1 + countNodes(r->left) + countNodes(r->right) : 0; }
int countLeaves(Node* r) {
    if (!r) return 0;
    if (!r->left && !r->right) return 1;
    return countLeaves(r->left) + countLeaves(r->right);
}
int height(Node* r) {                         // edges on the longest root-to-leaf path
    if (!r) return -1;                        // empty tree: -1, single node: 0
    return 1 + max(height(r->left), height(r->right));
}
int depthOf(Node* r, int x, int d = 0) {      // -1 if not found
    if (!r) return -1;
    if (r->data == x) return d;
    int L = depthOf(r->left, x, d + 1);
    return L != -1 ? L : depthOf(r->right, x, d + 1);
}
void destroy(Node* r) { if (!r) return; destroy(r->left); destroy(r->right); delete r; }

int main() {
    //          1
    //        /   \
    //       2     3
    //      / \     \
    //     4   5     6
    //        / \
    //       7   8
    Node* root = make(1, make(2, make(4), make(5, make(7), make(8))), make(3, nullptr, make(6)));
    cout << "nodes:  " << countNodes(root) << "\n";
    cout << "leaves: " << countLeaves(root) << "\n";
    cout << "height: " << height(root) << "\n";
    cout << "depth of 7: " << depthOf(root, 7) << "\n";
    destroy(root);
}

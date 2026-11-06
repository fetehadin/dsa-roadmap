#include <iostream>
#include <queue>
using namespace std;

struct Node { int data; Node* left; Node* right; };

Node* insert(Node* r, int x) {
    if (!r) return new Node{x, nullptr, nullptr};
    if (x < r->data) r->left = insert(r->left, x);
    else r->right = insert(r->right, x);
    return r;
}

void preorder(Node* r)  { if (!r) return; cout << r->data << " "; preorder(r->left); preorder(r->right); }
void inorder(Node* r)   { if (!r) return; inorder(r->left); cout << r->data << " "; inorder(r->right); }
void postorder(Node* r) { if (!r) return; postorder(r->left); postorder(r->right); cout << r->data << " "; }

void levelOrder(Node* root) {
    if (root == nullptr) return;
    queue<Node*> q;
    q.push(root);
    while (!q.empty()) {
        Node* cur = q.front(); q.pop();
        cout << cur->data << " ";
        if (cur->left)  q.push(cur->left);
        if (cur->right) q.push(cur->right);
    }
}

void destroy(Node* r) { if (!r) return; destroy(r->left); destroy(r->right); delete r; }   // postorder!

int main() {
    Node* root = nullptr;
    for (int x : {50, 30, 70, 20, 40, 60, 80}) root = insert(root, x);
    cout << "preorder:    "; preorder(root);   cout << "\n";
    cout << "inorder:     "; inorder(root);    cout << "\n";
    cout << "postorder:   "; postorder(root);  cout << "\n";
    cout << "level order: "; levelOrder(root); cout << "\n";
    destroy(root);
}

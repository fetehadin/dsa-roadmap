#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* left;
    Node* right;
};

Node* insert(Node* root, int x) {
    if (!root) return new Node{x, nullptr, nullptr};
    if (x < root->data) root->left = insert(root->left, x);
    else if (x > root->data) root->right = insert(root->right, x);
    return root;
}

Node* findMin(Node* root) {
    while (root->left != nullptr) root = root->left;
    return root;
}

Node* remove(Node* root, int x) {
    if (root == nullptr) return nullptr;
    if (x < root->data) root->left = remove(root->left, x);
    else if (x > root->data) root->right = remove(root->right, x);
    else {
        if (root->left == nullptr) {           // case 1 (leaf) and case 2 (only right child)
            Node* r = root->right; delete root; return r;
        }
        if (root->right == nullptr) {          // case 2 (only left child)
            Node* l = root->left; delete root; return l;
        }
        Node* s = findMin(root->right);        // case 3: two children
        root->data = s->data;                  // copy the inorder successor
        root->right = remove(root->right, s->data);
    }
    return root;
}

void inorder(Node* r) { if (!r) return; inorder(r->left); cout << r->data << " "; inorder(r->right); }
void destroy(Node* r) { if (!r) return; destroy(r->left); destroy(r->right); delete r; }

int main() {
    Node* root = nullptr;
    for (int x : {50, 30, 70, 20, 40, 60, 80, 65, 35}) root = insert(root, x);
    cout << "start:        "; inorder(root); cout << "\n";
    root = remove(root, 20);  cout << "delete 20 (leaf):       "; inorder(root); cout << "\n";
    root = remove(root, 60);  cout << "delete 60 (one child):  "; inorder(root); cout << "\n";
    root = remove(root, 50);  cout << "delete 50 (two children): "; inorder(root); cout << "\n";
    cout << "new root: " << root->data << "\n";
    destroy(root);
}

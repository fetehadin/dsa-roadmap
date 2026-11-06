#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* left;
    Node* right;
};

Node* insert(Node* root, int x) {
    if (root == nullptr) return new Node{x, nullptr, nullptr};
    if (x < root->data) root->left = insert(root->left, x);
    else if (x > root->data) root->right = insert(root->right, x);
    return root;                       // duplicates are ignored
}

bool search(Node* root, int x) {
    if (root == nullptr) return false;
    if (x == root->data) return true;
    if (x < root->data) return search(root->left, x);
    return search(root->right, x);
}

Node* findMin(Node* root) {
    while (root->left != nullptr) root = root->left;
    return root;
}

Node* findMax(Node* root) {
    while (root->right != nullptr) root = root->right;
    return root;
}

void inorder(Node* r) {
    if (!r) return;
    inorder(r->left);
    cout << r->data << " ";
    inorder(r->right);
}

void destroy(Node* r) { if (!r) return; destroy(r->left); destroy(r->right); delete r; }

int main() {
    Node* root = nullptr;
    for (int x : {50, 30, 70, 20, 40, 60, 80, 45})
        root = insert(root, x);
    cout << "inorder (sorted): ";
    inorder(root);
    cout << "\nsearch 45: " << (search(root, 45) ? "found" : "not found") << "\n";
    cout << "search 65: " << (search(root, 65) ? "found" : "not found") << "\n";
    cout << "min: " << findMin(root)->data << ", max: " << findMax(root)->data << "\n";
    destroy(root);
}

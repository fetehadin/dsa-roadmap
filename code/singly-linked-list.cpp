#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
};

void insertFront(Node*& head, int x) {
    Node* n = new Node{x, nullptr};
    n->next = head;          // 1. new node points at the old head
    head = n;                // 2. head points at the new node
}

void insertEnd(Node*& head, int x) {
    Node* n = new Node{x, nullptr};
    if (head == nullptr) { head = n; return; }
    Node* temp = head;
    while (temp->next != nullptr)
        temp = temp->next;
    temp->next = n;
}

void insertAt(Node*& head, int pos, int x) {      // pos is 0-based
    if (pos == 0) { insertFront(head, x); return; }
    Node* temp = head;
    for (int i = 0; i < pos - 1 && temp != nullptr; i++)
        temp = temp->next;
    if (temp == nullptr) return;                  // position too big
    Node* n = new Node{x, temp->next};
    temp->next = n;
}

void deleteValue(Node*& head, int x) {
    if (head == nullptr) return;
    if (head->data == x) {                        // deleting the head
        Node* temp = head;
        head = head->next;
        delete temp;
        return;
    }
    Node* prev = head;
    while (prev->next != nullptr && prev->next->data != x)
        prev = prev->next;
    if (prev->next == nullptr) return;            // not found
    Node* temp = prev->next;
    prev->next = temp->next;
    delete temp;
}

void deleteDummy(Node*& head, int x) {            // same job, no special case
    Node dummy{0, head};
    Node* prev = &dummy;
    while (prev->next != nullptr && prev->next->data != x)
        prev = prev->next;
    if (prev->next != nullptr) {
        Node* temp = prev->next;
        prev->next = temp->next;
        delete temp;
    }
    head = dummy.next;
}

bool search(Node* head, int x) {
    Node* temp = head;
    while (temp != nullptr) {
        if (temp->data == x) return true;
        temp = temp->next;
    }
    return false;
}

void print(Node* head) {
    for (Node* t = head; t != nullptr; t = t->next) cout << t->data << " -> ";
    cout << "null\n";
}

void freeList(Node*& head) {
    while (head != nullptr) {
        Node* temp = head;
        head = head->next;
        delete temp;
    }
}

int main() {
    Node* head = nullptr;
    insertEnd(head, 12);
    insertEnd(head, 7);
    insertEnd(head, 31);
    insertFront(head, 9);
    print(head);
    insertAt(head, 2, 15);
    print(head);
    deleteValue(head, 9);      // head
    deleteValue(head, 31);     // tail
    print(head);
    deleteDummy(head, 12);     // new head, handled by the dummy
    print(head);
    cout << "search 15: " << search(head, 15) << ", search 99: " << search(head, 99) << "\n";
    freeList(head);
    print(head);
}

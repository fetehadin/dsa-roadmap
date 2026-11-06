#include <iostream>
using namespace std;

struct DNode {
    int data;
    DNode* prev;
    DNode* next;
};

void insertFront(DNode*& head, DNode*& tail, int x) {
    DNode* n = new DNode{x, nullptr, head};
    if (head != nullptr) head->prev = n;
    else tail = n;
    head = n;
}

void insertEnd(DNode*& head, DNode*& tail, int x) {
    DNode* n = new DNode{x, tail, nullptr};
    if (tail != nullptr) tail->next = n;
    else head = n;
    tail = n;
}

void deleteValue(DNode*& head, DNode*& tail, int x) {
    DNode* cur = head;
    while (cur != nullptr && cur->data != x) cur = cur->next;
    if (cur == nullptr) return;
    if (cur->prev) cur->prev->next = cur->next;
    else head = cur->next;
    if (cur->next) cur->next->prev = cur->prev;
    else tail = cur->prev;
    delete cur;
}

void printForward(DNode* head) {
    for (DNode* c = head; c != nullptr; c = c->next) cout << c->data << " ";
    cout << "\n";
}

void printBackward(DNode* tail) {
    for (DNode* c = tail; c != nullptr; c = c->prev) cout << c->data << " ";
    cout << "\n";
}

int main() {
    DNode* head = nullptr;
    DNode* tail = nullptr;
    insertEnd(head, tail, 10);
    insertEnd(head, tail, 20);
    insertEnd(head, tail, 30);
    insertFront(head, tail, 5);
    cout << "forward:  "; printForward(head);
    cout << "backward: "; printBackward(tail);
    deleteValue(head, tail, 20);   // middle
    deleteValue(head, tail, 30);   // tail
    cout << "after deletes: "; printForward(head);
    cout << "tail is now " << tail->data << "\n";
    while (head) deleteValue(head, tail, head->data);
    cout << "empty: " << (head == nullptr && tail == nullptr ? "yes" : "no") << "\n";
}

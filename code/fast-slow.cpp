#include <iostream>
using namespace std;

struct Node { int data; Node* next; };

Node* middle(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;                            // 1 step
        fast = fast->next->next;                      // 2 steps
    }
    return slow;
}

Node* nthFromEnd(Node* head, int n) {
    Node* lead = head;
    for (int i = 0; i < n; i++) { if (!lead) return nullptr; lead = lead->next; }
    Node* trail = head;
    while (lead) { lead = lead->next; trail = trail->next; }   // gap of n stays fixed
    return trail;
}

bool hasCycle(Node* head) {                           // Floyd's tortoise and hare
    Node* slow = head;
    Node* fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}

int main() {
    Node* nodes[7];
    for (int i = 6; i >= 0; i--) nodes[i] = new Node{i + 1, i < 6 ? nodes[i + 1] : nullptr};
    Node* head = nodes[0];                            // 1 2 3 4 5 6 7

    cout << "middle: " << middle(head)->data << "\n";
    cout << "2nd from end: " << nthFromEnd(head, 2)->data << "\n";
    cout << "cycle? " << (hasCycle(head) ? "yes" : "no") << "\n";
    nodes[6]->next = nodes[2];                        // 7 -> 3 makes a loop
    cout << "after linking 7 -> 3, cycle? " << (hasCycle(head) ? "yes" : "no") << "\n";
    nodes[6]->next = nullptr;

    for (Node* n : nodes) delete n;
}

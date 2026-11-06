#include <iostream>
using namespace std;

class Queue {
    struct Node { int data; Node* next; };
    Node* front = nullptr;
    Node* rear = nullptr;
public:
    bool isEmpty() const { return front == nullptr; }
    void enqueue(int x) {
        Node* n = new Node{x, nullptr};
        if (rear == nullptr) { front = rear = n; return; }
        rear->next = n;
        rear = n;
    }
    int dequeue() {
        if (isEmpty()) { cout << "Empty\n"; return -1; }
        Node* temp = front;
        int x = temp->data;
        front = front->next;
        if (front == nullptr) rear = nullptr;   // queue became empty
        delete temp;
        return x;
    }
    int peek() const { return isEmpty() ? -1 : front->data; }
    ~Queue() { while (!isEmpty()) dequeue(); }
};

int main() {
    Queue q;
    q.enqueue(4); q.enqueue(9); q.enqueue(6);
    cout << "front: " << q.peek() << "\n";
    cout << "served: ";
    while (!q.isEmpty()) cout << q.dequeue() << " ";
    cout << "\n";
    q.enqueue(1);                       // works again after becoming empty
    cout << "front after reuse: " << q.peek() << "\n";
}

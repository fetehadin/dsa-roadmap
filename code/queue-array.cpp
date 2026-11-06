#include <iostream>
using namespace std;

const int MAX = 6;

// Naive queue: dequeue shifts everything left -> O(n)
struct NaiveQueue {
    int q[MAX]; int rear = -1; int moves = 0;
    void enqueue(int x) { if (rear == MAX - 1) { cout << "Full\n"; return; } q[++rear] = x; }
    int dequeue() {
        if (rear == -1) { cout << "Empty\n"; return -1; }
        int x = q[0];
        for (int i = 0; i < rear; i++) { q[i] = q[i + 1]; moves++; }
        rear--;
        return x;
    }
};

// Front-index queue: dequeue just moves front -> O(1), but wastes slots
struct FrontQueue {
    int q[MAX]; int front = 0, rear = -1;
    void enqueue(int x) { if (rear == MAX - 1) { cout << "Full (front=" << front << ")\n"; return; } q[++rear] = x; }
    int dequeue() {
        if (front > rear) { cout << "Empty\n"; return -1; }
        return q[front++];
    }
};

int main() {
    NaiveQueue a;
    for (int i = 1; i <= 5; i++) a.enqueue(i);
    cout << "naive: ";
    for (int i = 0; i < 5; i++) cout << a.dequeue() << " ";
    cout << "| element moves: " << a.moves << "\n";

    FrontQueue b;
    for (int i = 1; i <= 6; i++) b.enqueue(i);
    cout << "front-index: " << b.dequeue() << " " << b.dequeue() << "\n";
    b.enqueue(7);   // "Full" although 2 slots at the front are free
}

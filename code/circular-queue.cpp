#include <iostream>
using namespace std;

const int N = 5;

class CircularQueue {
    int q[N];
    int front = 0, rear = -1, count = 0;
public:
    bool isFull() const { return count == N; }
    bool isEmpty() const { return count == 0; }
    bool enqueue(int x) {
        if (isFull()) return false;
        rear = (rear + 1) % N;          // wrap around
        q[rear] = x;
        count++;
        return true;
    }
    int dequeue() {
        if (isEmpty()) return -1;
        int x = q[front];
        front = (front + 1) % N;        // wrap around
        count--;
        return x;
    }
    void print() const {
        cout << "[front=" << front << " rear=" << rear << " count=" << count << "] ";
        for (int i = 0, k = front; i < count; i++, k = (k + 1) % N) cout << q[k] << " ";
        cout << "\n";
    }
};

int main() {
    CircularQueue cq;
    for (int i = 1; i <= 5; i++) cq.enqueue(i * 10);
    cq.print();
    cout << "enqueue 60 when full: " << (cq.enqueue(60) ? "ok" : "rejected") << "\n";
    cout << "dequeued " << cq.dequeue() << " and " << cq.dequeue() << "\n";
    cq.enqueue(60);
    cq.enqueue(70);                     // these reuse slots 0 and 1
    cq.print();
}

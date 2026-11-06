#include <iostream>
using namespace std;

const int MAX = 5;

class Stack {
    int st[MAX];
    int top = -1;
public:
    bool isEmpty() const { return top == -1; }
    bool isFull() const { return top == MAX - 1; }
    void push(int x) {
        if (isFull()) { cout << "Overflow! cannot push " << x << "\n"; return; }
        st[++top] = x;
    }
    int pop() {
        if (isEmpty()) { cout << "Underflow!\n"; return -1; }
        return st[top--];
    }
    int peek() const {
        if (isEmpty()) { cout << "Empty!\n"; return -1; }
        return st[top];
    }
};

int main() {
    Stack s;
    for (int i = 1; i <= 6; i++) s.push(i * 10);   // the 6th push overflows
    cout << "peek: " << s.peek() << "\n";
    cout << "pop:  ";
    while (!s.isEmpty()) cout << s.pop() << " ";
    cout << "\n";
    s.pop();                                        // underflow
}

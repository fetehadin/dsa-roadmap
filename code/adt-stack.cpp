#include <iostream>
using namespace std;

// The ADT: WHAT a stack does. Users only see these operations.
class Stack {
public:
    virtual void push(int x) = 0;
    virtual int pop() = 0;
    virtual int top() const = 0;
    virtual bool isEmpty() const = 0;
    virtual ~Stack() {}
};

// Implementation 1: array (fixed capacity)
class ArrayStack : public Stack {
    int a[100];
    int t = -1;
public:
    void push(int x) override { a[++t] = x; }
    int pop() override { return a[t--]; }
    int top() const override { return a[t]; }
    bool isEmpty() const override { return t == -1; }
};

// Implementation 2: linked list (grows as needed)
class ListStack : public Stack {
    struct Node { int data; Node* next; };
    Node* head = nullptr;
public:
    void push(int x) override { head = new Node{x, head}; }
    int pop() override {
        Node* old = head;
        int x = old->data;
        head = head->next;
        delete old;
        return x;
    }
    int top() const override { return head->data; }
    bool isEmpty() const override { return head == nullptr; }
    ~ListStack() { while (!isEmpty()) pop(); }
};

// Client code only knows the ADT, so it works with either implementation.
void demo(Stack& s, const char* name) {
    for (int i = 1; i <= 3; i++) s.push(i * 10);
    cout << name << ": ";
    while (!s.isEmpty()) cout << s.pop() << " ";
    cout << "\n";
}

int main() {
    ArrayStack a;
    ListStack l;
    demo(a, "array stack");
    demo(l, "list stack ");
}

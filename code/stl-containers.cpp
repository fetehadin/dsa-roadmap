#include <iostream>
#include <stack>
#include <queue>
#include <deque>
using namespace std;

int main() {
    stack<int> s;
    s.push(1); s.push(2); s.push(3);
    cout << "stack top: " << s.top() << ", size: " << s.size() << "\n";
    s.pop();                                  // pop() returns void!
    cout << "after pop, top: " << s.top() << "\n";

    queue<string> q;
    q.push("Abel"); q.push("Hana"); q.push("Liya");
    cout << "queue front: " << q.front() << ", back: " << q.back() << "\n";
    q.pop();
    cout << "after pop, front: " << q.front() << "\n";

    deque<int> d = {3, 6, 9};
    d.push_front(1);
    d.push_back(12);
    cout << "deque: ";
    for (int x : d) cout << x << " ";
    cout << "| d[2] = " << d[2] << "\n";
    d.pop_front(); d.pop_back();
    cout << "after pops: front " << d.front() << ", back " << d.back() << "\n";

    stack<int> e;
    if (!e.empty()) e.pop();                  // always check empty() first
    cout << "empty stack handled safely\n";
}

#include <iostream>
#include <vector>
#include <stack>
#include <queue>
using namespace std;

struct Node {           // building block of a linked list (dynamic, linear)
    int data;
    Node* next;
};

int main() {
    int age = 20;                    // primitive
    char grade = 'A';                // primitive
    int marks[5] = {70, 85, 90, 65, 88};  // static, linear: size fixed at compile time

    vector<int> scores;              // dynamic, linear: grows at run time
    for (int m : marks) scores.push_back(m);
    scores.push_back(95);

    Node* second = new Node{2, nullptr};
    Node* head = new Node{1, second};  // 1 -> 2 -> nullptr

    stack<int> s;  s.push(1); s.push(2);   // linear ADT: last in, first out
    queue<int> q;  q.push(1); q.push(2);   // linear ADT: first in, first out

    cout << "age=" << age << " grade=" << grade << "\n";
    cout << "marks has fixed size " << sizeof(marks) / sizeof(marks[0]) << "\n";
    cout << "scores grew to " << scores.size() << "\n";
    cout << "list: " << head->data << " -> " << head->next->data << "\n";
    cout << "stack top=" << s.top() << ", queue front=" << q.front() << "\n";

    delete second;
    delete head;
}

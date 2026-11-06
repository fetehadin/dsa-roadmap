#include <iostream>
#include <string>
using namespace std;

class Stack {
    struct Node { char data; Node* next; };
    Node* top = nullptr;
public:
    bool isEmpty() const { return top == nullptr; }
    void push(char x) { top = new Node{x, top}; }
    char pop() {
        if (isEmpty()) return '\0';
        Node* temp = top;
        char x = temp->data;
        top = top->next;
        delete temp;
        return x;
    }
    char peek() const { return isEmpty() ? '\0' : top->data; }
    ~Stack() { while (!isEmpty()) pop(); }
};

// Classic stack application: are the brackets balanced?
bool balanced(const string& s) {
    Stack st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') st.push(c);
        else if (c == ')' || c == ']' || c == '}') {
            if (st.isEmpty()) return false;
            char o = st.pop();
            if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{')) return false;
        }
    }
    return st.isEmpty();
}

int main() {
    for (string s : {"{[()()]}", "([)]", "((", "a*(b+c)"})
        cout << s << " -> " << (balanced(s) ? "balanced" : "not balanced") << "\n";
}

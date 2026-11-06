#include <iostream>
#include <vector>
#include <stack>
using namespace std;

vector<int> nextGreater(const vector<int>& a) {
    int n = a.size();
    vector<int> ans(n, -1);
    stack<int> st;                                    // indices; values decreasing
    for (int i = 0; i < n; i++) {
        while (!st.empty() && a[st.top()] < a[i]) {   // a[i] answers everyone smaller
            ans[st.top()] = a[i];
            st.pop();
        }
        st.push(i);
    }
    return ans;
}

vector<int> waitDays(const vector<int>& a) {          // span: how far away is the next greater?
    vector<int> d(a.size(), 0);
    stack<int> st;
    for (int i = 0; i < (int)a.size(); i++) {
        while (!st.empty() && a[st.top()] < a[i]) { d[st.top()] = i - st.top(); st.pop(); }
        st.push(i);
    }
    return d;
}

vector<int> nextGreaterCircular(const vector<int>& a) {
    int n = a.size();
    vector<int> ans(n, -1);
    stack<int> st;
    for (int i = 0; i < 2 * n; i++) {                 // loop twice to wrap around
        while (!st.empty() && a[st.top()] < a[i % n]) { ans[st.top()] = a[i % n]; st.pop(); }
        if (i < n) st.push(i);
    }
    return ans;
}

void print(const char* label, const vector<int>& v) {
    cout << label;
    for (int x : v) cout << x << " ";
    cout << "\n";
}

int main() {
    vector<int> a = {2, 1, 3, 5, 6, 1};
    print("a:                ", a);
    print("next greater:     ", nextGreater(a));
    print("span (j - i):     ", waitDays(a));
    print("circular greater: ", nextGreaterCircular(a));
}

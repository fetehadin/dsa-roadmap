#include <iostream>
#include <vector>
using namespace std;

vector<int> buildPrefix(const vector<int>& a) {
    vector<int> p(a.size() + 1, 0);                   // p[i] = sum of first i items
    for (int i = 0; i < (int)a.size(); i++) p[i + 1] = p[i] + a[i];
    return p;
}

int rangeSum(const vector<int>& p, int l, int r) {    // sum of a[l..r]
    return p[r + 1] - p[l];
}

int main() {
    vector<int> a = {3, 1, 4, 1, 5, 9, 2};
    vector<int> p = buildPrefix(a);
    cout << "prefix: ";
    for (int x : p) cout << x << " ";
    cout << "\n";
    cout << "sum a[1..4] = " << rangeSum(p, 1, 4) << "\n";
    cout << "sum a[0..6] = " << rangeSum(p, 0, 6) << "\n";
    cout << "sum a[5..5] = " << rangeSum(p, 5, 5) << "\n";
}

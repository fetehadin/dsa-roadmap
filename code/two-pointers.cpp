#include <iostream>
#include <vector>
using namespace std;

bool pairSum(const vector<int>& a, int target) {     // a must be sorted
    int l = 0, r = a.size() - 1;
    while (l < r) {
        int sum = a[l] + a[r];
        if (sum == target) { cout << a[l] << " + " << a[r] << " = " << target << "\n"; return true; }
        if (sum < target) l++;                         // need a bigger sum
        else r--;                                      // need a smaller sum
    }
    cout << "no pair sums to " << target << "\n";
    return false;
}

void reverseInPlace(vector<int>& a) {
    for (int l = 0, r = a.size() - 1; l < r; l++, r--) swap(a[l], a[r]);
}

int main() {
    vector<int> a = {1, 3, 4, 6, 8, 11, 14};
    pairSum(a, 15);
    pairSum(a, 2);
    reverseInPlace(a);
    for (int x : a) cout << x << " ";
    cout << "\n";
}

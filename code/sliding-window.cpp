#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int maxSum(const vector<int>& a, int k) {             // fixed-size window
    int sum = 0;
    for (int i = 0; i < k; i++) sum += a[i];
    int best = sum;
    for (int r = k; r < (int)a.size(); r++) {
        sum += a[r] - a[r - k];                        // add new, drop old
        best = max(best, sum);
    }
    return best;
}

int longestUnique(const string& s) {                  // variable-size window
    int seen[256] = {};
    int best = 0;
    for (int l = 0, r = 0; r < (int)s.size(); r++) {
        seen[(unsigned char)s[r]]++;
        while (seen[(unsigned char)s[r]] > 1) seen[(unsigned char)s[l++]]--;   // shrink until valid
        best = max(best, r - l + 1);
    }
    return best;
}

int main() {
    cout << "max sum of 3: " << maxSum({2, 1, 5, 1, 3, 2, 7, 1}, 3) << "\n";
    cout << "longest without repeats in \"abcabcbb\": " << longestUnique("abcabcbb") << "\n";
}

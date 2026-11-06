#include <iostream>
using namespace std;

int comparisons;

int linearSearch(const int a[], int n, int key) {
    for (int i = 0; i < n; i++) {
        comparisons++;
        if (a[i] == key) return i;
    }
    return -1;
}

int main() {
    int a[] = {8, 3, 14, 6, 21, 9, 17, 2};
    int n = 8;
    struct { const char* label; int key; } cases[] = {
        {"best  (first item)", 8}, {"middle", 6}, {"worst (missing)", 99}};
    for (auto c : cases) {
        comparisons = 0;
        int pos = linearSearch(a, n, c.key);
        cout << c.label << ": key " << c.key << " -> index " << pos
             << " after " << comparisons << " comparisons\n";
    }
    // Average over every key that is present: (1 + 2 + ... + n) / n = (n + 1) / 2
    int total = 0;
    for (int i = 0; i < n; i++) { comparisons = 0; linearSearch(a, n, a[i]); total += comparisons; }
    cout << "average when found: " << total << "/" << n << " = " << (double)total / n << "\n";
}

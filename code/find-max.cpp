#include <iostream>
using namespace std;

// Input: an array and its size. Output: the largest value.
// Finite (n-1 comparisons), definite, effective, general, correct.
int findMax(const int a[], int n) {
    int max = a[0];
    for (int i = 1; i < n; i++)
        if (a[i] > max)
            max = a[i];
    return max;
}

int main() {
    int a[] = {14, 3, 27, 9, 31, 8};
    int b[] = {-5, -2, -9};
    cout << "max of a = " << findMax(a, 6) << "\n";
    cout << "max of b = " << findMax(b, 3) << "\n";
}

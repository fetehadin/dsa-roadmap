#include <iostream>
#include <utility>
using namespace std;

void bubbleSort(int a[], int n) {
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {
                swap(a[j], a[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;  // no swaps: already sorted
    }
}

void print(const int a[], int n) {
    for (int i = 0; i < n; i++) cout << a[i] << (i + 1 < n ? " " : "\n");
}

int main() {
    int a[] = {29, 10, 14, 37, 13, 5};
    int n = sizeof(a) / sizeof(a[0]);
    cout << "Before: ";
    print(a, n);
    bubbleSort(a, n);
    cout << "After:  ";
    print(a, n);
}

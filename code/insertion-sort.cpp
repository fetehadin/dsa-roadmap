#include <iostream>
using namespace std;

void insertionSort(int a[], int n) {
    for (int i = 1; i < n; i++) {
        int key = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > key) {   // shift bigger items right
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;                  // drop key into the gap
    }
}

int main() {
    int a[] = {29, 10, 14, 37, 13, 5};
    int n = sizeof(a) / sizeof(a[0]);
    insertionSort(a, n);
    for (int i = 0; i < n; i++) cout << a[i] << " ";
    cout << "\n";
}

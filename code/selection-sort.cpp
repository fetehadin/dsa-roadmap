#include <iostream>
#include <utility>
using namespace std;

void selectionSort(int a[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[minIdx])
                minIdx = j;
        swap(a[i], a[minIdx]);   // at most one swap per pass
    }
}

int main() {
    int a[] = {29, 10, 14, 37, 13, 5};
    int n = sizeof(a) / sizeof(a[0]);
    selectionSort(a, n);
    for (int i = 0; i < n; i++) cout << a[i] << " ";
    cout << "\n";
}

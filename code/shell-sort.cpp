#include <iostream>
using namespace std;

void shellSort(int a[], int n) {
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {        // insertion sort on items gap apart
            int temp = a[i];
            int j = i;
            while (j >= gap && a[j - gap] > temp) {
                a[j] = a[j - gap];
                j -= gap;
            }
            a[j] = temp;
        }
        cout << "after gap " << gap << ": ";
        for (int k = 0; k < n; k++) cout << a[k] << " ";
        cout << "\n";
    }
}

int main() {
    int a[] = {35, 33, 42, 10, 14, 19, 27, 44};
    int n = sizeof(a) / sizeof(a[0]);
    shellSort(a, n);
}

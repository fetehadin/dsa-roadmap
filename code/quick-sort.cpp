#include <iostream>
using namespace std;

int partition(int a[], int lo, int hi) {      // Lomuto: last item is the pivot
    int pivot = a[hi];
    int i = lo - 1;
    for (int j = lo; j < hi; j++) {
        if (a[j] < pivot) {
            i++;
            swap(a[i], a[j]);
        }
    }
    swap(a[i + 1], a[hi]);
    return i + 1;
}

void print(int a[], int n) { for (int k = 0; k < n; k++) cout << a[k] << " "; cout << "\n"; }

void quickSort(int a[], int lo, int hi, int n) {
    if (lo < hi) {
        int p = partition(a, lo, hi);
        cout << "pivot " << a[p] << " -> index " << p << ": ";
        print(a, n);
        quickSort(a, lo, p - 1, n);
        quickSort(a, p + 1, hi, n);
    }
}

int main() {
    int a[] = {10, 80, 30, 90, 40, 50, 70};
    int n = sizeof(a) / sizeof(a[0]);
    quickSort(a, 0, n - 1, n);
    cout << "sorted: "; print(a, n);
}

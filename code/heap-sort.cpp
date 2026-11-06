#include <iostream>
using namespace std;

void heapify(int a[], int n, int i) {         // sift a[i] down in a max-heap of size n
    int largest = i;
    int l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && a[l] > a[largest]) largest = l;
    if (r < n && a[r] > a[largest]) largest = r;
    if (largest != i) {
        swap(a[i], a[largest]);
        heapify(a, n, largest);
    }
}

void print(int a[], int n) { for (int k = 0; k < n; k++) cout << a[k] << " "; cout << "\n"; }

void heapSort(int a[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--)      // build the max-heap
        heapify(a, n, i);
    cout << "max-heap: "; print(a, n);
    for (int end = n - 1; end > 0; end--) {
        swap(a[0], a[end]);                   // biggest goes to the end
        heapify(a, end, 0);
    }
}

int main() {
    int a[] = {4, 10, 3, 5, 1, 8};
    int n = sizeof(a) / sizeof(a[0]);
    heapSort(a, n);
    cout << "sorted:   "; print(a, n);
}

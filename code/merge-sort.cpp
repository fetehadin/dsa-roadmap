#include <iostream>
#include <vector>
using namespace std;

void merge(int a[], int lo, int mid, int hi) {
    vector<int> tmp;                          // O(n) extra space
    int i = lo, j = mid + 1;
    while (i <= mid && j <= hi) {
        if (a[i] <= a[j]) tmp.push_back(a[i++]);   // <= keeps it stable
        else tmp.push_back(a[j++]);
    }
    while (i <= mid) tmp.push_back(a[i++]);
    while (j <= hi) tmp.push_back(a[j++]);
    for (int k = 0; k < (int)tmp.size(); k++) a[lo + k] = tmp[k];
}

void mergeSort(int a[], int lo, int hi) {
    if (lo >= hi) return;                     // 0 or 1 item: already sorted
    int mid = lo + (hi - lo) / 2;
    mergeSort(a, lo, mid);
    mergeSort(a, mid + 1, hi);
    merge(a, lo, mid, hi);
    cout << "merged [" << lo << ".." << hi << "]: ";
    for (int k = lo; k <= hi; k++) cout << a[k] << " ";
    cout << "\n";
}

int main() {
    int a[] = {38, 27, 43, 3, 9, 82, 10};
    int n = sizeof(a) / sizeof(a[0]);
    mergeSort(a, 0, n - 1);
    cout << "sorted: ";
    for (int x : a) cout << x << " ";
    cout << "\n";
}

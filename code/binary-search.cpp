#include <iostream>
using namespace std;

int binarySearch(const int a[], int n, int key) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;   // same as (low+high)/2, but cannot overflow
        if (a[mid] == key) return mid;
        else if (a[mid] < key) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    int a[] = {3, 8, 12, 17, 23, 31, 38, 45, 52, 60};   // must be sorted
    int n = 10;
    cout << "search 38 -> " << binarySearch(a, n, 38) << "\n";
    cout << "search 3  -> " << binarySearch(a, n, 3) << "\n";
    cout << "search 40 -> " << binarySearch(a, n, 40) << "\n";
}

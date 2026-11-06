#include <iostream>
using namespace std;

int linearSearch(const int a[], int n, int key) {
    for (int i = 0; i < n; i++)
        if (a[i] == key)
            return i;      // found: stop right away
    return -1;             // checked everything: not there
}

int main() {
    int a[] = {23, 7, 41, 15, 9, 32, 18};
    int n = 7;
    cout << "search 9  -> " << linearSearch(a, n, 9) << "\n";
    cout << "search 23 -> " << linearSearch(a, n, 23) << "\n";
    cout << "search 50 -> " << linearSearch(a, n, 50) << "\n";
}

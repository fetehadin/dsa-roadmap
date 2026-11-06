#include <iostream>
using namespace std;

int factorial(int n) {
    if (n <= 1) return 1;            // base case: stops the recursion
    return n * factorial(n - 1);     // recursive case: smaller problem
}

int bs(const int a[], int low, int high, int key) {
    if (low > high) return -1;               // base case 1: empty range
    int mid = (low + high) / 2;
    if (a[mid] == key) return mid;           // base case 2: found
    if (a[mid] < key) return bs(a, mid + 1, high, key);
    return bs(a, low, mid - 1, key);
}

void countDown(int n) {
    if (n == 0) { cout << "liftoff!\n"; return; }
    cout << n << " ";
    countDown(n - 1);
}

int main() {
    cout << "5! = " << factorial(5) << "\n";
    int a[] = {2, 5, 9, 14, 20, 27, 33, 41};
    cout << "bs(27) -> " << bs(a, 0, 7, 27) << "\n";
    cout << "bs(4)  -> " << bs(a, 0, 7, 4) << "\n";
    countDown(3);
}

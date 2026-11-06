#include <iostream>
using namespace std;

int main() {
    int x = 5;
    int* p = &x;                 // p holds the address of x
    *p = 10;                     // write through the pointer
    cout << "x = " << x << ", *p = " << *p << "\n";
    cout << "p points to x? " << (p == &x ? "yes" : "no") << "\n";

    int* q = new int(42);        // one int on the heap
    cout << "*q = " << *q << "\n";
    delete q;                    // give it back
    q = nullptr;                 // never leave a dangling pointer
    if (q == nullptr) cout << "q is safely null\n";

    int n = 4;
    int* arr = new int[n];       // array on the heap: size chosen at run time
    for (int i = 0; i < n; i++) arr[i] = (i + 1) * 10;
    cout << "arr: ";
    for (int i = 0; i < n; i++) cout << *(arr + i) << " ";   // pointer arithmetic
    cout << "\n";
    delete[] arr;                // new[] needs delete[]
    arr = nullptr;
}

#include <iostream>
using namespace std;

// We count time units with the counting rules by adding to `t`
// next to each operation, then compare with the formula T(n) = 4n + 3.
long long countLoop(int n) {
    long long t = 0;
    int k = 0;
    int i;
    t++; i = 0;                  // 1 assignment (init)
    while (true) {
        t++;                     // 1 test: i < n
        if (!(i < n)) break;
        t += 2; k = k + 1;       // add + assign
        t++; i++;                // 1 increment
    }
    t++; (void)k;                // cout << k: 1 output
    return t;
}

long long countNested(int n) {
    long long t = 0;
    int k = 0;
    t++;                                     // k = 0
    t++;                                     // i = 0
    for (int i = 0; ; i++) {
        t++;                                 // i < n
        if (!(i < n)) break;
        t++;                                 // j = 0
        for (int j = 0; ; j++) {
            t++;                             // j < n
            if (!(j < n)) break;
            t++; k++;                        // k++
            t++;                             // j++
        }
        t++;                                 // i++
    }
    return t;
}

int main() {
    for (int n : {1, 3, 10}) {
        cout << "n=" << n << "  loop: counted " << countLoop(n)
             << ", 4n+3 = " << 4 * n + 3
             << "  |  nested: counted " << countNested(n)
             << ", 3n^2+4n+3 = " << 3 * n * n + 4 * n + 3 << "\n";
    }
}

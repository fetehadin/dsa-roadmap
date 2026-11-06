#include <iostream>
using namespace std;

int checks = 0;

// Late termination: keeps looping after the answer is known.
bool containsSlow(const int a[], int n, int key) {
    bool found = false;
    for (int i = 0; i < n; i++) {
        checks++;
        if (a[i] == key) found = true;
    }
    return found;
}

// Fixed: stop as soon as we know.
bool containsFast(const int a[], int n, int key) {
    for (int i = 0; i < n; i++) {
        checks++;
        if (a[i] == key) return true;
    }
    return false;
}

int main() {
    int a[] = {5, 12, 8, 3, 19, 7, 25, 11};
    int n = 8;

    checks = 0; containsSlow(a, n, 8);
    cout << "slow: " << checks << " checks\n";
    checks = 0; containsFast(a, n, 8);
    cout << "fast: " << checks << " checks\n";

    // Redundant computation: x*x is recomputed on every pass
    double x = 3, total = 0;
    for (int i = 0; i < 4; i++) total += a[i] * (x * x);
    // Better: compute it once, outside the loop
    double x2 = x * x, total2 = 0;
    for (int i = 0; i < 4; i++) total2 += a[i] * x2;
    cout << "same result: " << total << " == " << total2 << "\n";

    // Repeated array referencing: read a[i] once into a local variable
    int best = a[0];
    for (int i = 1; i < n; i++) {
        int v = a[i];            // one reference instead of two
        if (v > best) best = v;
    }
    cout << "max = " << best << "\n";
}

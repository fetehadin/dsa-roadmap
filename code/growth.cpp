#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;

int main() {
    cout << left << setw(6) << "n" << setw(9) << "log n" << setw(8) << "n"
         << setw(11) << "n log n" << setw(9) << "n^2" << "2^n\n";
    for (int n : {1, 2, 4, 8, 16, 32}) {
        double lg = log2(n);
        cout << left << setw(6) << n << setw(9) << lg << setw(8) << n
             << setw(11) << n * lg << setw(9) << n * n << (long long)pow(2, n) << "\n";
    }
    // Big-O check for f(n) = 3n^2 + 4n + 1 with c = 8, k = 1
    bool ok = true;
    for (long long n = 1; n <= 1000; n++)
        if (3 * n * n + 4 * n + 1 > 8 * n * n) ok = false;
    cout << "3n^2+4n+1 <= 8n^2 for n = 1..1000: " << (ok ? "true" : "false") << "\n";
}

#include <iostream>
using namespace std;

int main() {
    // 1-D array: contiguous memory, index i is at base + i * sizeof(int)
    int a[5] = {12, 7, 31, 4, 19};
    int n = sizeof(a) / sizeof(a[0]);
    cout << "a[3] = " << a[3] << "\n";
    cout << "elements are " << sizeof(int) << " bytes apart: "
         << (&a[1] - &a[0]) * sizeof(int) << "\n";

    int sum = 0;
    for (int i = 0; i < n; i++) sum += a[i];
    cout << "sum = " << sum << "\n";

    // 2-D array: stored row by row (row-major)
    const int R = 3, C = 4;
    int m[R][C];
    for (int i = 0; i < R; i++)
        for (int j = 0; j < C; j++)
            m[i][j] = i * C + j + 1;

    for (int i = 0; i < R; i++) {
        for (int j = 0; j < C; j++) cout << m[i][j] << "\t";
        cout << "\n";
    }
    // m[1][2] is element number 1*C + 2 = 6 in memory
    cout << "m[1][2] = " << m[1][2] << ", offset = " << (&m[1][2] - &m[0][0]) << "\n";
}

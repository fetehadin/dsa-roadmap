// Lab: Grade Analyzer (starter). Fill in every TODO, then compare with the sample output.
#include <iostream>
#include <string>
using namespace std;

const int MAXN = 100;

struct Student {
    string name;
    int score;
};

struct Counter {
    long comparisons = 0, swaps = 0;
};

// Each sort orders students by score, HIGHEST first, and counts its work in c.
void selectionSort(Student a[], int n, Counter& c) {
    // TODO: find the best remaining student, swap it into place, count comparisons and swaps
    (void)a; (void)n; (void)c;
}

void bubbleSort(Student a[], int n, Counter& c) {
    // TODO: adjacent compare-and-swap with an early-exit flag
    (void)a; (void)n; (void)c;
}

void insertionSort(Student a[], int n, Counter& c) {
    // TODO: shift lower scores right and insert the key; count shifts in c.swaps
    (void)a; (void)n; (void)c;
}

void sortByName(Student a[], int n) {
    // TODO: any simple sort, A to Z by name (binary search needs this)
    (void)a; (void)n;
}

int binarySearch(const Student a[], int n, const string& name, int& steps) {
    // TODO: return the index of name, or -1; count loop iterations in steps
    (void)a; (void)n; (void)name;
    steps = 0;
    return -1;
}

int main() {
    int n;
    Student input[MAXN];
    if (!(cin >> n) || n < 1 || n > MAXN) { cout << "bad input\n"; return 1; }
    for (int i = 0; i < n; i++) cin >> input[i].name >> input[i].score;

    // TODO 1: copy input into three arrays and run each sort with its own Counter
    // TODO 2: print the ranking, the average, and the three operation counts
    // TODO 3: sort by name, then read names until end of input and binary-search each one

    cout << "read " << n << " students\n";
}

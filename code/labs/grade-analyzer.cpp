// Lab 1: Grade Analyzer (solution)
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

// Sort by score, highest first. Ties keep input order (stable sorts only).
void selectionSort(Student a[], int n, Counter& c) {
    for (int i = 0; i < n - 1; i++) {
        int best = i;
        for (int j = i + 1; j < n; j++) {
            c.comparisons++;
            if (a[j].score > a[best].score) best = j;
        }
        if (best != i) { swap(a[i], a[best]); c.swaps++; }
    }
}

void bubbleSort(Student a[], int n, Counter& c) {
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {
            c.comparisons++;
            if (a[j].score < a[j + 1].score) { swap(a[j], a[j + 1]); c.swaps++; swapped = true; }
        }
        if (!swapped) break;
    }
}

void insertionSort(Student a[], int n, Counter& c) {
    for (int i = 1; i < n; i++) {
        Student key = a[i];
        int j = i - 1;
        while (j >= 0) {
            c.comparisons++;
            if (a[j].score >= key.score) break;
            a[j + 1] = a[j];
            c.swaps++;                       // counts shifts
            j--;
        }
        a[j + 1] = key;
    }
}

void sortByName(Student a[], int n) {        // insertion sort, A to Z
    for (int i = 1; i < n; i++) {
        Student key = a[i];
        int j = i - 1;
        while (j >= 0 && a[j].name > key.name) { a[j + 1] = a[j]; j--; }
        a[j + 1] = key;
    }
}

int binarySearch(const Student a[], int n, const string& name, int& steps) {
    int lo = 0, hi = n - 1;
    steps = 0;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        steps++;
        if (a[mid].name == name) return mid;
        if (a[mid].name < name) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

char grade(int s) { return s >= 85 ? 'A' : s >= 70 ? 'B' : s >= 55 ? 'C' : s >= 40 ? 'D' : 'F'; }

int main() {
    int n;
    Student input[MAXN];
    if (!(cin >> n) || n < 1 || n > MAXN) { cout << "bad input\n"; return 1; }
    long total = 0;
    for (int i = 0; i < n; i++) { cin >> input[i].name >> input[i].score; total += input[i].score; }

    Student a[MAXN], b[MAXN], c[MAXN];
    for (int i = 0; i < n; i++) a[i] = b[i] = c[i] = input[i];
    Counter cs, cb, ci;
    selectionSort(a, n, cs);
    bubbleSort(b, n, cb);
    insertionSort(c, n, ci);

    cout << "Ranking:\n";
    for (int i = 0; i < n; i++)
        cout << "  " << i + 1 << ". " << c[i].name << " " << c[i].score << " (" << grade(c[i].score) << ")\n";
    cout << "Average: " << (double)total / n << "\n\n";

    cout << "Operation counts (n = " << n << "):\n";
    cout << "  selection  comparisons " << cs.comparisons << ", swaps " << cs.swaps << "\n";
    cout << "  bubble     comparisons " << cb.comparisons << ", swaps " << cb.swaps << "\n";
    cout << "  insertion  comparisons " << ci.comparisons << ", shifts " << ci.swaps << "\n\n";

    sortByName(c, n);
    string q;
    while (cin >> q) {
        int steps;
        int k = binarySearch(c, n, q, steps);
        if (k == -1) cout << "search " << q << ": not found (" << steps << " steps)\n";
        else cout << "search " << q << ": " << c[k].score << " (" << steps << " steps)\n";
    }
}

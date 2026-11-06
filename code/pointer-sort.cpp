#include <iostream>
#include <string>
#include <utility>
using namespace std;

struct Student {
    string name;
    int score;
    char bigData[1000];   // pretend each record is large and slow to copy
};

// Sort an array of POINTERS by score. The records never move.
void pointerSort(Student* p[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int min = i;
        for (int j = i + 1; j < n; j++)
            if (p[j]->score < p[min]->score)
                min = j;
        swap(p[i], p[min]);   // swaps two addresses (8 bytes), not two records
    }
}

int main() {
    Student s[5] = {{"Abel", 72, {}}, {"Bethel", 95, {}}, {"Dawit", 58, {}},
                    {"Hana", 81, {}}, {"Kidus", 66, {}}};
    const int n = 5;
    Student* p[n];
    for (int i = 0; i < n; i++) p[i] = &s[i];

    pointerSort(p, n);

    cout << "Sorted view:   ";
    for (int i = 0; i < n; i++) cout << p[i]->name << "(" << p[i]->score << ") ";
    cout << "\nOriginal array: ";
    for (int i = 0; i < n; i++) cout << s[i].name << " ";
    cout << "\n";
}

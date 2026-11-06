// Lab 2: Library Manager (starter). Implement the three classes, then make main() pass the sample.
#include <iostream>
#include <string>
using namespace std;

struct Book {
    int id;
    string title;
    bool out = false;
    Book* next = nullptr;
};

class Library {                       // singly linked list kept sorted by id
    Book* head = nullptr;
public:
    Book* find(int id) const {
        // TODO: walk the list
        (void)id;
        return nullptr;
    }
    bool add(int id, const string& title) {
        // TODO: reject duplicates; insert in id order (a dummy node avoids the head special case)
        (void)id; (void)title;
        return false;
    }
    bool remove(int id, string& title) {
        // TODO: unlink and delete; copy the title out so UNDO can restore it
        (void)id; (void)title;
        return false;
    }
    void list() const { cout << "  (no books)\n"; }   // TODO
    // TODO: destructor that frees every node
};

// TODO: class UndoStack   (linked-list stack of {type, id, title})
// TODO: class RequestQueue (circular array queue of {who, id})

int main() {
    Library lib;
    string cmd;
    while (cin >> cmd) {
        // TODO: handle ADD, REMOVE, UNDO, REQUEST, SERVE, RETURN, LIST (see the lab page for the format)
        string rest;
        getline(cin, rest);
        cout << "TODO " << cmd << "\n";
    }
}

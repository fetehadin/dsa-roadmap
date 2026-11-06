// Lab: Library Manager (solution)
#include <iostream>
#include <string>
using namespace std;

struct Book {
    int id;
    string title;
    bool out = false;
    Book* next = nullptr;
};

// ---------- linked list of books (sorted by id) ----------
class Library {
    Book* head = nullptr;
public:
    Book* find(int id) const {
        for (Book* b = head; b; b = b->next) if (b->id == id) return b;
        return nullptr;
    }
    bool add(int id, const string& title) {
        if (find(id)) return false;
        Book dummy{0, "", false, head};
        Book* prev = &dummy;
        while (prev->next && prev->next->id < id) prev = prev->next;
        prev->next = new Book{id, title, false, prev->next};
        head = dummy.next;
        return true;
    }
    bool remove(int id, string& title) {     // returns the removed title for undo
        Book dummy{0, "", false, head};
        Book* prev = &dummy;
        while (prev->next && prev->next->id != id) prev = prev->next;
        if (!prev->next) return false;
        Book* gone = prev->next;
        title = gone->title;
        prev->next = gone->next;
        delete gone;
        head = dummy.next;
        return true;
    }
    void list() const {
        if (!head) { cout << "  (no books)\n"; return; }
        for (Book* b = head; b; b = b->next)
            cout << "  #" << b->id << " " << b->title << (b->out ? " [borrowed]" : "") << "\n";
    }
    ~Library() { while (head) { Book* n = head->next; delete head; head = n; } }
};

// ---------- undo stack (linked list) ----------
struct Action { char type; int id; string title; Action* next; };   // type: 'A'dded or 'R'emoved
class UndoStack {
    Action* top = nullptr;
public:
    bool empty() const { return top == nullptr; }
    void push(char t, int id, const string& title) { top = new Action{t, id, title, top}; }
    Action pop() {
        Action a = *top;
        Action* old = top;
        top = top->next;
        delete old;
        return a;
    }
    ~UndoStack() { while (!empty()) pop(); }
};

// ---------- request queue (circular array) ----------
struct Request { string who; int id; };
class RequestQueue {
    static const int N = 8;
    Request q[N];
    int front = 0, rear = -1, count = 0;
public:
    bool empty() const { return count == 0; }
    bool enqueue(const Request& r) {
        if (count == N) return false;
        rear = (rear + 1) % N;
        q[rear] = r;
        count++;
        return true;
    }
    Request dequeue() {
        Request r = q[front];
        front = (front + 1) % N;
        count--;
        return r;
    }
    int size() const { return count; }
};

int main() {
    Library lib;
    UndoStack undo;
    RequestQueue requests;
    string cmd;
    while (cin >> cmd) {
        if (cmd == "ADD") {
            int id; string title;
            cin >> id; getline(cin >> ws, title);
            if (lib.add(id, title)) { undo.push('A', id, title); cout << "added #" << id << "\n"; }
            else cout << "#" << id << " already exists\n";
        } else if (cmd == "REMOVE") {
            int id; cin >> id;
            string title;
            if (lib.remove(id, title)) { undo.push('R', id, title); cout << "removed #" << id << "\n"; }
            else cout << "#" << id << " not found\n";
        } else if (cmd == "UNDO") {
            if (undo.empty()) { cout << "nothing to undo\n"; continue; }
            Action a = undo.pop();
            string t;
            if (a.type == 'A') { lib.remove(a.id, t); cout << "undo: removed #" << a.id << " again\n"; }
            else { lib.add(a.id, a.title); cout << "undo: restored #" << a.id << "\n"; }
        } else if (cmd == "REQUEST") {
            Request r; cin >> r.who >> r.id;
            if (!lib.find(r.id)) cout << "#" << r.id << " not in library\n";
            else if (requests.enqueue(r)) cout << r.who << " queued for #" << r.id << " (" << requests.size() << " waiting)\n";
            else cout << "request queue full\n";
        } else if (cmd == "SERVE") {
            if (requests.empty()) { cout << "no requests\n"; continue; }
            Request r = requests.dequeue();
            Book* b = lib.find(r.id);
            if (!b) cout << r.who << ": #" << r.id << " was removed\n";
            else if (b->out) { requests.enqueue(r); cout << r.who << ": #" << r.id << " is out, back to the end of the line\n"; }
            else { b->out = true; cout << r.who << " borrows " << b->title << "\n"; }
        } else if (cmd == "RETURN") {
            int id; cin >> id;
            Book* b = lib.find(id);
            if (b && b->out) { b->out = false; cout << "returned #" << id << "\n"; }
            else cout << "#" << id << " was not borrowed\n";
        } else if (cmd == "LIST") {
            lib.list();
        } else {
            cout << "unknown command " << cmd << "\n";
            string rest; getline(cin, rest);
        }
    }
}

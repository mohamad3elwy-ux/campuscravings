// database.h - simple SQLite wrapper for Campus Cravings
#pragma once
#include <string>
#include <vector>

struct MenuItem { int id; int truck_id; std::string name; double price; };

class Database {
public:
    Database(const std::string &path);
    ~Database();
    std::vector<MenuItem> getMenuItems();
    bool verifyUser(const std::string &email, const std::string &password);
    int insertOrder(int user_id, const std::vector<int>& items, const std::string &pickup_time);
    void updateOrderStatus(int order_id, const std::string &status);
    int insertTruck(const std::string &name, const std::string &location);
    int insertMenuItem(int truck_id, const std::string &name, double price);
private:
    struct Impl;
    Impl* impl;
};

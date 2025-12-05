// database.cpp
#include "database.h"
#include <sqlite3.h>
#include <iostream>
#include <sstream>

struct Database::Impl {
    sqlite3* db = nullptr;
};

Database::Database(const std::string &path): impl(new Impl()){
    if(sqlite3_open(path.c_str(), &impl->db) != SQLITE_OK){
        std::cerr<<"Failed to open DB\n";
    }
}

Database::~Database(){
    if(impl->db) sqlite3_close(impl->db);
    delete impl;
}

std::vector<MenuItem> Database::getMenuItems(){
    std::vector<MenuItem> out;
    const char* sql = "SELECT id, truck_id, name, price FROM menu_items;";
    sqlite3_stmt* stmt;
    if(sqlite3_prepare_v2(impl->db, sql, -1, &stmt, 0) == SQLITE_OK){
        while(sqlite3_step(stmt) == SQLITE_ROW){
            MenuItem it;
            it.id = sqlite3_column_int(stmt,0);
            it.truck_id = sqlite3_column_int(stmt,1);
            it.name = (const char*)sqlite3_column_text(stmt,2);
            it.price = sqlite3_column_double(stmt,3);
            out.push_back(it);
        }
    }
    sqlite3_finalize(stmt);
    return out;
}

bool Database::verifyUser(const std::string &email, const std::string &password){
    const char* sql = "SELECT password FROM users WHERE email = ?;";
    sqlite3_stmt* stmt;
    bool ok=false;
    if(sqlite3_prepare_v2(impl->db, sql, -1, &stmt, 0) == SQLITE_OK){
        sqlite3_bind_text(stmt,1,email.c_str(),-1,SQLITE_STATIC);
        if(sqlite3_step(stmt) == SQLITE_ROW){
            const unsigned char* pw = sqlite3_column_text(stmt,0);
            if(pw && password == (const char*)pw) ok=true;
        }
    }
    sqlite3_finalize(stmt);
    return ok;
}

int Database::insertOrder(int user_id, const std::vector<int>& items, const std::string &pickup_time){
    std::stringstream ss;
    for(size_t i=0;i<items.size();++i){ if(i) ss<<","; ss<<items[i]; }
    std::string items_str = ss.str();
    const char* sql = "INSERT INTO orders(user_id, items, pickup_time, status) VALUES(?,?,?,?);";
    sqlite3_stmt* stmt;
    int lastid = -1;
    if(sqlite3_prepare_v2(impl->db, sql, -1, &stmt, 0) == SQLITE_OK){
        sqlite3_bind_int(stmt,1,user_id);
        sqlite3_bind_text(stmt,2,items_str.c_str(),-1,SQLITE_STATIC);
        sqlite3_bind_text(stmt,3,pickup_time.c_str(),-1,SQLITE_STATIC);
        sqlite3_bind_text(stmt,4,"Pending",-1,SQLITE_STATIC);
        if(sqlite3_step(stmt) == SQLITE_DONE) lastid = (int)sqlite3_last_insert_rowid(impl->db);
    }
    sqlite3_finalize(stmt);
    return lastid;
}

void Database::updateOrderStatus(int order_id, const std::string &status){
    const char* sql = "UPDATE orders SET status = ? WHERE id = ?;";
    sqlite3_stmt* stmt;
    if(sqlite3_prepare_v2(impl->db, sql, -1, &stmt, 0) == SQLITE_OK){
        sqlite3_bind_text(stmt,1,status.c_str(),-1,SQLITE_STATIC);
        sqlite3_bind_int(stmt,2,order_id);
        sqlite3_step(stmt);
    }
    sqlite3_finalize(stmt);
}

int Database::insertTruck(const std::string &name, const std::string &location){
    const char* sql = "INSERT INTO trucks(name, location) VALUES(?,?);";
    sqlite3_stmt* stmt;
    int lastid=-1;
    if(sqlite3_prepare_v2(impl->db, sql, -1, &stmt, 0) == SQLITE_OK){
        sqlite3_bind_text(stmt,1,name.c_str(),-1,SQLITE_STATIC);
        sqlite3_bind_text(stmt,2,location.c_str(),-1,SQLITE_STATIC);
        if(sqlite3_step(stmt) == SQLITE_DONE) lastid = (int)sqlite3_last_insert_rowid(impl->db);
    }
    sqlite3_finalize(stmt);
    return lastid;
}

int Database::insertMenuItem(int truck_id, const std::string &name, double price){
    const char* sql = "INSERT INTO menu_items(truck_id, name, price) VALUES(?,?,?);";
    sqlite3_stmt* stmt;
    int lastid=-1;
    if(sqlite3_prepare_v2(impl->db, sql, -1, &stmt, 0) == SQLITE_OK){
        sqlite3_bind_int(stmt,1,truck_id);
        sqlite3_bind_text(stmt,2,name.c_str(),-1,SQLITE_STATIC);
        sqlite3_bind_double(stmt,3,price);
        if(sqlite3_step(stmt) == SQLITE_DONE) lastid = (int)sqlite3_last_insert_rowid(impl->db);
    }
    sqlite3_finalize(stmt);
    return lastid;
}

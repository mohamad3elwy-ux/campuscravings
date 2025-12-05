// main.cpp - simple C++ REST server using httplib and sqlite3
// Notes: Requires httplib.h and nlohmann/json.hpp in include path.
// Build example: g++ main.cpp database.cpp -lsqlite3 -pthread -o campus-server

#include <iostream>
#include <string>
#include <vector>
#include "httplib.h"
#include "database.h"
#include <nlohmann/json.hpp>

using json = nlohmann::json;
using namespace httplib;

int main(){
    Server svr;
    Database db("database/campus_cravings.db");

    svr.Get("/api/menu", [&](const Request& req, Response& res){
        auto items = db.getMenuItems();
        json j = json::array();
        for(auto &it: items){
            j.push_back({{"id", it.id}, {"truck_id", it.truck_id}, {"name", it.name}, {"price", it.price}});
        }
        res.set_content(j.dump(), "application/json");
    });

    svr.Post("/api/login", [&](const Request& req, Response& res){
        try{
            auto j = json::parse(req.body);
            std::string email = j["email"], password = j["password"];
            auto ok = db.verifyUser(email, password);
            if(ok){
                json r; r["token"]="demo-token"; res.set_content(r.dump(),"application/json"); res.status = 200;
            } else { res.status = 401; res.set_content("{\"error\":\"invalid\"}","application/json"); }
        }catch(...){ res.status=400; res.set_content("{\"error\":\"bad json\"}","application/json"); }
    });

    svr.Post("/api/orders", [&](const Request& req, Response& res){
        try{
            auto j = json::parse(req.body);
            int user_id = j.value("user_id", 1);
            std::vector<int> items = j["items"].get<std::vector<int>>();
            std::string pickup = j.value("pickup_time", std::string());
            int id = db.insertOrder(user_id, items, pickup);
            json out; out["order_id"]=id;
            res.set_content(out.dump(),"application/json");
            res.status=201;
        }catch(...){ res.status=400; res.set_content("{\"error\":\"bad json\"}","application/json"); }
    });

    svr.Put(R"(/api/orders/(\d+)/status)", [&](const Request& req, Response& res){
        int id = std::stoi(req.matches[1]);
        try{
            auto j = json::parse(req.body);
            std::string status = j.value("status","Ready");
            db.updateOrderStatus(id, status);
            res.set_content("{\"ok\":true}","application/json");
        }catch(...){ res.status=400; res.set_content("{\"error\":\"bad json\"}","application/json"); }
    });

    svr.Post("/api/trucks", [&](const Request& req, Response& res){
        try{
            auto j = json::parse(req.body);
            std::string name=j["name"], loc=j["location"];
            int id = db.insertTruck(name, loc);
            json out; out["truck_id"]=id;
            res.set_content(out.dump(),"application/json");
        }catch(...){ res.status=400; res.set_content("{\"error\":\"bad json\"}","application/json"); }
    });

    svr.Post("/api/menu", [&](const Request& req, Response& res){
        try{
            auto j = json::parse(req.body);
            int truck_id = j["truck_id"];
            std::string name = j["name"];
            double price = j["price"];
            int id = db.insertMenuItem(truck_id, name, price);
            json out; out["item_id"]=id;
            res.set_content(out.dump(),"application/json");
        }catch(...){ res.status=400; res.set_content("{\"error\":\"bad json\"}","application/json"); }
    });

    std::cout << "Server running at http://localhost:8080\n";
    svr.listen("0.0.0.0", 8080);
    return 0;
}

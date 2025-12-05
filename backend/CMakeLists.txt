cmake_minimum_required(VERSION 3.10)
project(campus_cravings)
set(CMAKE_CXX_STANDARD 17)
find_package (Threads REQUIRED)
add_executable(campus-server main.cpp database.cpp)
target_link_libraries(campus-server PRIVATE sqlite3 pthread)
# Note: ensure httplib.h and nlohmann/json.hpp are available in include path

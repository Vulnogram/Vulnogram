cmake_minimum_required(VERSION 3.10)

# Set the project name
project(security-vulnogram)

# Specify the C++ standard
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Add the src directory to the build
add_subdirectory(src)
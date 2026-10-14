@echo off
title SmartCityX - Review-1 Web Dashboard

echo.
echo  Compiling SmartCityX...
echo.

javac -d out module1\KMP.java module1\ZFunction.java module1\RabinKarp.java module1\AhoCorasick.java module2\SuffixArray.java module2\SAIS.java module2\LCPKasai.java module2\SuffixAutomaton.java module3\EditDistance.java module3\BitmaskDP.java module3\MatrixChainDP.java module3\SubsetDP.java Main.java SmartCityXServer.java

if %errorlevel% neq 0 (
    echo.
    echo  Checking if classes already exist...
    if not exist out\SmartCityXServer.class (
        echo  [ERROR] Compilation failed. Make sure Java JDK is installed.
        pause
        exit /b 1
    )
)

echo  Ready!
echo.
echo  Starting SmartCityX Web Dashboard...
echo  Browser will open at:  http://localhost:3000
echo.

java -cp out SmartCityXServer

@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the NOTICE file
@REM delegating responsibility to the Apache Maven Team.
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%" == "true" @ECHO ON

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------

@setlocal
@set MAVEN_PROJECTBASEDIR=%~dp0
@set MAVEN_PROJECTBASEDIR_ALMOST=%MAVEN_PROJECTBASEDIR%
@if "%MAVEN_PROJECTBASEDIR_ALMOST:~-1%"=="\" set MAVEN_PROJECTBASEDIR_ALMOST=%MAVEN_PROJECTBASEDIR_ALMOST:~0,-1%
@set MAVEN_ARGUMENTS=%*

@if not defined JAVA_HOME (
  @set JAVA_EXE=java.exe
) else (
  @set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
)

@set WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar
@set WRAPPER_MAIN=org.apache.maven.wrapper.MavenWrapperMain

"%JAVA_EXE%" %MAVEN_OPTS% "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR_ALMOST%" -classpath "%WRAPPER_JAR%" %WRAPPER_MAIN% %MAVEN_ARGUMENTS%
@if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%
@endlocal

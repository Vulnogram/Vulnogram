# Vulnogram

_Making the world safer one CVE ID at a time, since 2017._

## Introduction

Vulnogram is a tool for creating and editing CVE information in CVE JSON format, and for generating advisories.

The name Vulnogram is inspired from Greek origin suffix '-gram' which is used for denoting something written or recorded especially in a certain way. Vulnerability related information when recorded in a standard format can help in aggregation, curation, dissemination, analysis and remediation. This enables automation and efficiency in response activities.

Vulnogram project aims to make it easier for vendors and security researchers to accurately record vulnerability information for inclusion in the CVE List.

## Getting started

#### Step 1. Install required node modules


	$ cd vulnogram
	$ npm install
 	... this should install required dependencies ...


#### Step 2. Setup monogodb to be used for persistent storage of CVE JSON and users.
	See https://www.mongodb.com/

#### Step 3. Copy /config/conf-default.js to config/conf.js and edit the file to suite your requirements

	See config/conf-default.js comments for hints

#### Step 4 (Optional). Copy the "default" directory as "custom" and modify relevant pug templates, schemas or routes. Files from "custom" override "default".

#### Step 5. If any pug templates were modified, regenerate client side javascript

	$ node scripts/pug2js.js

#### Step 6. Configure a user on the CLI for logging in

	$ node useradd.js tester tester@example.com Tester sirt@example.com 1
	Enter Password: ********************************************
	Enter Password again: ********************************************
	Success New user is now registered and can log in: tester

#### Step 7. Start the node application

	$ npm start
    
  	Vulnogram@0.0.4 start /home/user/vulnogram
	nodemon app
	
	[nodemon] 1.11.0
	[nodemon] to restart at any time, enter `rs`
	[nodemon] watching: *.*
	[nodemon] starting `node app app.js`
	Server started on port 3555
	Connected to MongoDB ...

Tip: Use foreverjs to run this service continuously like a daemon.

#### Finish: Web application should be now accessible
	http://localhost:3555/

## Create the minimal standalone web page and client side scripts.

    $ make min
    
This creates standalone/index.html with minimized javascript and stylesheets can be hosted independelty on websites serving static files.

## Dependencies

This project uses or depends on software from

* NodeJS https://nodejs.org/
* Express https://github.com/expressjs
* Mongodb
* Passportjs http://passportjs.org/
* Pug https://pugjs.org/
* ACE editor https://ace.c9.io/
* JSON Schema based editor https://github.com/jdorn/json-editor
* yamljs https://github.com/jeremyfa/yaml.js
* tablesort v5.0.1 https://github.com/tristen/tablesort
* cvssjs https://github.com/cvssjs
* json-patch-extended
* multer
* querymen

## Licence

Copyright (c) 2017 Chandan B N

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

4. If security vulnerabilities are found in this project, best effort shall be made to inform the named security contacts or current maintainers of this project.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

# Vulnogram

_Making the world safer one CVE ID at a time, since 2017._

## Introduction

Vulnogram is a tool for creating and editing CVE information in CVE JSON format, and for generating advisories.

The name Vulnogram is inspired from Greek origin suffix '-gram' which is used for denoting something written or recorded especially in a certain way. Vulnerability related information when recorded in a standard format can help in aggregation, curation, dissemination, analysis and remediation. This enables automation and efficiency in response activities.

Vulnogram project aims to make it easier for vendors and security researchers to accurately record vulnerability information for inclusion in the CVE List.

<img src="https://raw.githubusercontent.com/Vulnogram/Vulnogram.github.io/master/screenshots/Vulnogram-ScreenShot.jpg" width="50%">

## Getting started

Vulnogram can be deployed in two modes:

| Browser mode                  | Server mode |
|------------------------------|------------|
| Frontend web UI only, as seen on [vulnogram.github.io](https://vulnogram.github.io). | A NodeJS web application serves frontend web UI for a backend Mongodb. |
| It is a Javascript based tool to open, import, edit, preview and save JSON documents which conform to a given [JSON-Schema](https://json-schema.org). | It is a modern scalable issue tracker similar to JIRA or bugtrack but using [JSON-Schemas](https://json-schema.org) as data models and a NoSQL database as a backend. Along with customizable [plugins](https://github.com/Vulnogram/plugins) it can be used for tracking anything that can be expressed with a [JSON-Schema](https://json-schema.org). [plugins](https://github.com/Vulnogram/plugins) are available for tracking security incidents, tickets, contacts, NVD entries and CVE assignments. | 
| Can't save CVE JSON drafts.  | JSON documents are saved to a NoSQL (Mongodb) backend. |
| No login required.           | Users are authenticated. |
| No workflow or tracking.     | Allows tracking, querying, searching, version control, audit trail of changes, commenting and dashboard charts and graphs on collections of JSON documents. |
| Security considerations: <br>👍 Information entered in the tool is not transmitted anywhere out of the browser.<br>ℹ️ Download button saves the JSON document in the browser to a local file.<br>⚠️ Ensure local filesystem is secured.<br>⚠️ Avoid using the tool on a public computer (beware of browser autofill). | Security considerations:<br>ℹ️ Configure HTTPS in the config file.<br>⚠️ Ensure that MongoDB is secured and hardened. Mongodb backend is used for storing documents on the server.<br>⚠️ Keep configuration files secured.<br>⚠️ Only create accounts for trusted users. There is no RBAC or ACL feature (as of now)! |

### Server mode deployment:

#### Step 1. Install required Node.js modules.


	$ cd vulnogram
	$ npm install
 	... this should install required dependencies ...


#### Step 2. Setup monogodb to be used for persistent storage of CVE JSON and users.
	See https://www.mongodb.com/

 **Important**: Ensure mongodb authentication is enabled. It is recommended to run mongodb bound to loopback/localhost and not expose it to network.

#### Step 3. Edit the config parameters in conf.js to suite your requirements.

	See config/conf-default.js comments for hints

#### Step 4 (Optional). Copy the "default" directory as "custom" and modify relevant pug templates, schemas or routes. Files or fields from "custom" override "default".

#### Step 5. Configure a user on the CLI for logging in

	$ node useradd.js tester tester@example.com Tester sirt@example.com 1
	Enter Password: ********************************************
	Enter Password again: ********************************************
	Success New user is now registered and can log in: tester

#### Step 5. Start the node application.

    $ npm start

    > Vulnogram@0.0.6 start /home/vulnogram/
    > forever start --id 'vulnogram' --spinSleepTime 5000 --minUptime 2000 app.js

    info:    Forever processing file: app.js
    info:    Forever processes running
    data:        uid  command                      script forever pid   id        logfile                      uptime     
    data:    [0] v3wE /usr/bin/node app.js 11208   11210 vulnogram /home/vulnogram/.forever/v3wE.log 0:0:0:0.23 

#### Finish: Web application should be now accessible at:
	http://localhost:3555/ or https://localhost:3555/ depending on configuration.

## Browser mode deployment: 

#### Configure defaults

* Install required nodejs modules. See [step 1](https://github.com/Vulnogram/Vulnogram#step-1-install-required-nodejs-modules)  above.
* Configure Vulnogram following [step 3](https://github.com/Vulnogram/Vulnogram#step-3-edit-the-config-parameters-in-confjs-to-suite-your-requirements) to 5 above.

#### Generate files needed for a front-end only static website (browser mode).

    $ make min
    
This creates standalone /index.html with minimized javascript and stylesheets can be hosted independently on websites serving static files. This does not require the backend mongodb server or the nodejs server application to be running.

Note: Opening the index.html as a file URL may not work since some browsers (including Chrome) will not run async requests on file:// URLs. It is recommended to serve these files from a webserver. See https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server for examples on how to run a simple testing webserver.

## Dependencies:

This project uses or depends on software from

* NodeJS https://nodejs.org/
* Express https://github.com/expressjs
* Mongodb
* Passportjs http://passportjs.org/
* Pug https://pugjs.org/
* ACE editor https://ace.c9.io/
* JSON Schema based editor https://github.com/jdorn/json-editor
* tablesort v5.0.1 https://github.com/tristen/tablesort
* cvssjs https://github.com/cvssjs
* json-patch-extended
* querymen
* linkifyjs
* pptxGenJS


Copyright (c) 2017-2019 Chandan B N.

SPDX-License-Identifier: MIT

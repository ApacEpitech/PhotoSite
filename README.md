# ToDoList

Project written in flask and React to manage tasks for users registered by email  
Require a MongoDB database to run  
Backend testing written with Cypress  
Frontend testing written with Mocha and Chai

##Run project
###Backend
Go in "/Back" folder  
Install required packages ```pip install -r requirements.txt```  
Run server ```python main.py```

###Frontend
Go in "/Front" folder  
Install required packages ```npm install```  
Run server ```npm start```

##Tests
###Backend tests
With online servers, go in "/Tests" folder  
Install required packages ```npm install```  
Start tests ```npm test```  

###E2E testing
With online servers, go in "/Front" folder  
Required dependencies such as Cypress have been installed when installing front dependencies 
Open cypress ```$(npm bin)/cypress open```  
To start cypress automated test, click on "e2eTests.js"

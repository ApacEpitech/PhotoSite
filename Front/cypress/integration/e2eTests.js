context('Connect', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
  });
  it('Fails to connect', () => {
    cy.get('#normal_login_username')
      .type('fake@email.com').should('have.value', 'fake@email.com');

    cy.get('#normal_login_password')
      .type('fake');
    cy.contains('Log in').click().wait(1000);
    cy.on('window:alert', (str) => {
        expect(str).to.equal(`Email Or Password Incorrect`)
    });
  });
  it('Success to connect', () => {
    cy.get('#normal_login_username')
      .type('admin@admin.com');
    cy.get('#normal_login_password')
      .type('admin');
    cy.contains('Log in').click();
    cy.on('window:alert', () => {
        expect(true).to.be.false;
    });
    cy.url().should('include', '/homeAdmin?show=All');
  });
});

context('Manage users Administrator', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
    cy.get('#normal_login_username')
        .type('admin@admin.com');
    cy.get('#normal_login_password')
        .type('admin');
    cy.contains('Log in').click().wait(200);
  });

   it('creates user', () => {
    cy.visit('http://localhost:3000/users');
    cy.get(".User").its("length").then(numUsers => {
      cy.get('.anticon-plus').click();
      cy.get("#NewUserEmail").type("random.mail@google.com");
      cy.get("#NewUserPassword").type("random");
      cy.get("#NewUserConfirmPassword").type("random");
      cy.get("button").get("span").contains("Create").click({force:true}).wait(200);
      cy.get(".User").its("length").should("equal", numUsers + 1);
    });
  });

  it('updates user', () => {
      cy.visit('http://localhost:3000/users');
      cy.get(".User").its("length").then(numUsers => {
      cy.get('.userEmail').contains("random.mail@google.com").parent().within(() => {
          cy.get('.anticon-edit').first().click();
      });
      cy.get("#EditUserEmail").clear();
      cy.get("#EditUserEmail").type("random2.mail@google.com");
      cy.get("#EditUserPassword").type("random");
      cy.get("#EditUserConfirmPassword").type("random");
      cy.get("button").get("span").contains("Edit").click({force:true}).wait(200);
      cy.get(".User").its("length").should("equal", numUsers);
      cy.get('.userEmail').contains("random2.mail@google.com").its('length').should('gte', 1);
    });
  });

  it('ban user', () => {
      cy.visit('http://localhost:3000/users');
      cy.get('.userEmail').contains("random2.mail@google.com").parent().within(() => {
        cy.get('.ant-checkbox-input').first().click().wait(500);
      });
      cy.get(".User").its("length").then(numUsers => {
      cy.get('.userEmail').contains("random2.mail@google.com").parent()
          .get('.ant-checkbox-input').should('be.checked');
    });
  });

  it('banned user can\'t connect', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('#normal_login_username')
      .type('random2.mail@google.com').should('have.value', 'random2.mail@google.com');
    cy.get('#normal_login_password')
      .type('random');
    cy.contains('Log in').click().wait(1000);
    cy.on('window:alert', (str) => {
        expect(str).to.equal(`You are banned!`);
    });
  });

    it('delete user', () => {
        cy.visit('http://localhost:3000/users');
        cy.get(".User").its("length").then(numUsers => {
        cy.get('.userEmail').contains("random2.mail@google.com").parent().within(() => {
            cy.get('.anticon-user-delete').first().click().wait(400);
        });
        cy.get(".User").its("length").should("equal", numUsers - 1);
        });
    });
});

context('Manage tasks Administrator', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
    cy.get('#normal_login_username')
      .type('admin@admin.com');
    cy.get('#normal_login_password')
      .type('admin');
    cy.contains('Log in').click().wait(200);
  });

  it('creates task', () => {
    cy.get(".Task").its("length").then(numTasks => {
      cy.get('.anticon-plus').click();
      cy.get('#createTask').should("be.visible");
      cy.get("#NewTitleTask").type("This is a task");
      cy.get(".ant-select-selection").click().wait(200);
      cy.contains("admin").click().wait(200);
      cy.get("button").get("span").contains("Create").click({force:true}).wait(200);
      cy.get(".Task").its("length").should("equal", numTasks + 1);
    });
  });

  it('creates task for user', () => {
    cy.get(".Task").its("length").then(numTasks => {
      cy.get('.anticon-plus').click().wait(200);
      cy.get('#createTask').should("be.visible");
      cy.get("#NewTitleTask").type("This is a task");
      cy.get(".ant-select-selection").click().wait(200);
      cy.contains("random").click().wait(200);
      cy.get("button").get("span").contains("Create").click({force:true}).wait(200);
      cy.get(".Task").its("length").should("equal", numTasks + 1);
    });
  });

  it('delete task', () => {
    cy.get(".Task").its("length").then(numTasks => {
      cy.get('.anticon-close').first().click({force: true}).wait(1000);
      cy.get(".Task").its("length").should("equal", numTasks - 1);
    });
  });
});

context('Manage tasks User', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
    cy.get('#normal_login_username')
      .type('random.mail@google.com');
    cy.get('#normal_login_password')
      .type('random');
    cy.contains('Log in').click().wait(200);
  });

  it('.creates task', () => {
      cy.visit('http://localhost:3000/home');
      cy.get('.anticon-plus').click().wait(200);
      cy.get('#createTask').should("be.visible");
      cy.get("#NewTitleTask").type("This is a task");
      cy.get("button").get("span").contains("Create").click({force:true}).wait(200);
  });
});
describe('TestApp', () => {
  it('Full Program', () => {
    cy.visit('')
    cy.contains('h1', 'Welcome to the Guess Word Game').should('exist');
    // Clique no link pelo texto visível
    cy.contains('Create a Game').click();

    // Verifique se a navegação foi bem-sucedida
    cy.url().should('include', '/maker');


    cy.log('Verificando se a url está generica');
      const randomString = Math.random().toString(36).substring(2, 12);


      // Preencha o formulário com a string aleatória
      cy.get('input') // Substitua pelo seletor correto do campo de texto
          .type(randomString);


      cy.intercept('POST', '**').as('apiRequest');

      cy.get('button').click();
      cy.wait('@apiRequest').then((interception) => {
            const backendUrl = new URL(interception.request.url).origin;
            cy.log(`O REACT_APP_BACKEND_URL parece ser: ${backendUrl}`);
            try{
            expect(backendUrl).equal(Cypress.config('baseUrl'));
            } catch (error) {
                cy.log('A asserção falhou, mas o teste continua.');
            }

      });
      // Adicione validações após o envio, se necessário
      cy.log(`Formulário enviado com o valor: ${randomString}`);

      cy.get('p')
          .invoke('text')
          .then((fullText) => {
              const code = fullText.split(': ')[1].trim(); // Divide pelo ":" e remove espaços extras
              cy.log(`O código do jogo é: ${code}`);
              expect(code).to.exist;
              cy.wrap(code).as('gameCode');
          });
      cy.get('a[href="/breaker"]') // Seleciona o link com o href especificado
          // .should('exist') // Verifica se o link existe
          .click(); // Clica no link

      // Verifique se a URL foi alterada para /breaker
      cy.url().should('include', '/breaker');


      // Encontre o label pelo texto e o input dentro dele
      cy.get('@gameCode').then((code) => {
          cy.log(`Reutilizando o código: ${code}`);
          cy.contains('label', 'Game ID:') // Procura o label com o texto "Game Id:"
              .find('input') // Encontra o input dentro do label
              // .should('exist') // Garante que o input existe
              .type(code); // Digite algo no input, por exemplo "12345"
      });
     cy.contains('label','Your Guess:')
         .find('input')
         // .should('exist')
         .type(randomString);
      cy.get('button').click();

      cy.get('p')
          .invoke('text')
          .then((fullText) => {
              const result = fullText.split(': ')[1].trim(); // Divide pelo ":" e remove espaços extras
              cy.log(`O resultado é: ${result}`);
              expect(result).to.equal('Correct');
          });


      cy.contains('label','Your Guess:')
          .find('input')
          // .should('exist')
          .type('A');
      cy.get('button').click();
      cy.get('p')
          .invoke('text')
          .then((fullText) => {
              const result = fullText.split(': ')[1].trim(); // Divide pelo ":" e remove espaços extras
              cy.log(`O resultado é: ${result}`);
              expect(result).to.equal('Incorrect. Guess is too long');
          });
  });
    it('Same URL Post', () => {
        cy.visit('')
        cy.contains('h1', 'Welcome to the Guess Word Game').should('exist');
        // Clique no link pelo texto visível
        cy.contains('Create a Game').click();

        // Verifique se a navegação foi bem-sucedida
        cy.url().should('include', '/maker');


        cy.log('Verificando se a url está generica');
        const randomString = Math.random().toString(36).substring(2, 12);


        // Preencha o formulário com a string aleatória
        cy.get('input') // Substitua pelo seletor correto do campo de texto
            .type(randomString);


        cy.intercept('POST', '**').as('apiRequest');

        cy.get('button').click();
        cy.wait('@apiRequest').then((interception) => {
            const backendUrl = new URL(interception.request.url).origin;
            cy.log(`O REACT_APP_BACKEND_URL parece ser: ${backendUrl}`);

            expect(backendUrl).equal(Cypress.config('baseUrl'));

        });
        // Adicione validações após o envio, se necessário
        cy.log(`Formulário enviado com o valor: ${randomString}`);

        cy.get('p')
            .invoke('text')
            .then((fullText) => {
                const code = fullText.split(': ')[1].trim(); // Divide pelo ":" e remove espaços extras
                cy.log(`O código do jogo é: ${code}`);
                expect(code).to.exist;
                cy.wrap(code).as('gameCode');
            });
    });
});
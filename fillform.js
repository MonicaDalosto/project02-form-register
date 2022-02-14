const configs = { // define qual o método 'GET' a constante, nesse caso, a constante será utilizada quando 'fetch' for executado;
  method: "GET"
}

// Criação das constantes para receber os elementos HTML que serão validados mais abaixo:
const form = document.getElementById('form');
const fullName = document.getElementById('fullName');
const birthday = document.getElementById('birthday')
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const cep = document.getElementById('cep');
const searchCep = document.getElementById('searchCep');
const street = document.getElementById('street'); // não utlizei 'address'para não confundir com os dados recebidos;
const numberAddress = document.getElementById('numberAddress');
const district = document.getElementById('district');
const city = document.getElementById('city');
const state = document.getElementById('state');
const letter = document.getElementById('letter');
const capitalLetter = document.getElementById('capitalLetter');
const numberCharacter = document.getElementById('numberCharacter');
const specialCharacter = document.getElementById('specialCharacter');
const lengthPassword = document.getElementById('lengthPassword');

// Código para validação, consulta e autopreenchimento do Cep:
// Como eu alterei o type de Submit para Button, não precisa mais usar o preventDefault() da página nesse momento.
searchCep.addEventListener('click', () => { // o event é um parâmetro da arrow function
  search(); // chama a função de validação que vai ser escrita mais abaixo.
});

const search = async () => { // função assíncrona, pois depende de retorno externo à página.

  
  const cepValue = cep.value; // constante recebe o value da constante cep, que recebeu acima o elemento html 'input cep'.
  const cepValueParsed = cepValue.normalize('NFD').replace(/([\u0300-\u036f]|[^0-9a-zA-Z])/g, ''); // retira a máscara do cep da constante antes de executar o fetch;
  
  try {
    if(!isValidCep(cep)) { // se o valor de cep não estiver dentro do padrão determinado...
      setError(cep, 'Informe um Cep válido!'); // chama a função setError(),
      swal('Erro!', 'Informe um Cep válido!', 'error'); // e dispara um alerta na tela com a mensagem de erro.
    } else {                                            // se o cep estiver no padrão... 
      const result = await fetch(`https://ws.apicep.com/cep/${cepValueParsed}.json`, configs) // executa a consulta do Cep na API externa;
      const dataAddress = await result.json(); // converte os dados retornados em arquivo JSON;

      if (dataAddress.status >= 400 && dataAddress.status < 500) { // valida pelo código do status se o retorno do request foi inválido...
        console.log(dataAddress) // imprime os dados retornado no console, e 
        throw dataAddress.message // envia o value da message de retorno para catch, como se estivesse invocando a função throw com o argumento 'data.message';
      }

      showResults(dataAddress) // se o retorno do request for válido, invoka a função showResults() passando como argumento o objeto 'dataAddress' que possui os dados retornados;
    }
  } catch (error) {  // error é o parâmetro da function 'catch'. Quando ocorre o erro, throw passa o argumento a ser recebido por catch, que nesse caso é o valor da mensagem de erro recebida na consulta cep;
    console.log(error) // Imprime no console a mensagem de erro;
    if(error == 'Blocked by flood') { // valida o teor da mensagem de erro para definir o tipo da mensagem a ser exibida ao usuário.
      swal('Erro!', 'Você excedeu o limite de solicitações. É necessário alterar o país da sua VPN!', 'error'); // exibe um alerta na tela do usuário. Alerta é uma aplicação externa;
    } else {
      swal('Erro!', error, 'error');
    }
  }
}

// Função a ser executada para adicionar o resultado da consulta Cep aos campos de endereço:
const showResults = (dataAddress) => { // a função receberá como argumento um objeto com os dados retornados;
  street.value = dataAddress.address // o valor da constante 'street' receberá o valor da propriedade 'address' do objeto 'dataAddress';
  if(street.value !== '') { // caso o campo 'street'tenha recebido algum valor diferente de vazio ('')...
    validateStreet(street); // executa a função de validação do campo;
  }

  district.value = dataAddress.district 
  if(district.value !== '') {
    validateDistrict(district);
  }

  city.value = dataAddress.city
  if(city.value !== '') {
    validateCity(city);
  }

  state.value = dataAddress.state
  if(state.value !== '') {
    validateState(state);
  }
}

// Código para validação do formulário:

// Essa função evita que o formulário seja submetido antes da validação ser realizada:
form.addEventListener('submit', event => { // o event é um parâmetro da arrow function
  event.preventDefault(); // para o comportamento padrão do sistema (enviar o formulário).

  submitInputs(); // chama a função de validação que vai ser escrita mais abaixo.
});

// Função que define o comportamento do campo do formulário em caso de erro na validação:
const setError = (element, message) => { // arrow function vai receber dois parâmetros, o 1º é elemento (campo) preenchido e o 2º é a mensagem de erro a ser mostrada;
  const inputControl = element.parentElement; // a constante recebe o elemento pai do campo preenchido;
  const errorMessage = inputControl.querySelector('.errorMessage'); // a constante recebe o elemento com a classe .errorMessage dentro do elemento pai do campo preenchido;
  console.log(errorMessage);
  errorMessage.innerText = message; // o campo com a classe .errorMessage vai receber o valor recebido no segundo argumento da função;
  inputControl.classList.add('error'); // o elemento pai do campo preenchido irá receber a classe .error, que no CSS está estilizada com borda vermelha;
  inputControl.classList.remove('success'); // a classe .success será removida do elemento pai do campo preenchido (caso ele tenha);
  inputControl.classList.remove('underAge'); // a classe .underAge será removida do elemento pai do campo preenchido (caso ele tenha);
}


// Função que define o comportamento do campo do formulário em caso de validação positiva:
const setSuccess = (element) => { // arrow function com parâmetro element, o argumento será o elemento (campo) preenchido;
  const inputControl = element.parentElement; // a constante recebe o elemento pai do campo preenchido;
  const errorMessage = inputControl.querySelector('.errorMessage'); // a constante recebe o elemento com a classe .errorMessage dentro do elemento pai do campo preenchido;
  errorMessage.innerText = ''; // o campo com a classe .errorMessage vai receber valor vazio;
  inputControl.classList.add('success'); // o elemento pai do campo preenchido vai receber a classe .success, que no CSS está estilizada com borda verde;
  inputControl.classList.remove('error'); // a classe .success será removida do elemento pai do campo preenchido (caso ele tenha);
  inputControl.classList.remove('underAge'); // a classe .underAge será removida do elemento pai do campo preenchido (caso ele tenha);
}

// Função que define o comportamento do campo do formulário em caso de menor de 18 anos, comportamento similar ao 'setSuccess' e 'SetError':
const setUnderAge = (element, message) => {
  const inputControl = element.parentElement;
  const errorMessage = inputControl.querySelector('.errorMessage');
  console.log(errorMessage);
  errorMessage.innerText = message;
  inputControl.classList.add('underAge'); // o elemento pai do campo preenchido vai receber a classe .underAge, que no CSS está estilizada com borda amarela;
  inputControl.classList.remove('error');
  inputControl.classList.remove('success'); 
}

// Abaixo, criaremos uma função de validação para cada input, que serão executadas quando o botão 'submit'for clicado ou, unitariamente, quando o usuário tirar o foco do campo html correspondente:

// Validação do campo Nome (fullName):
const validateFullName = (element) => { // Função de validação: recebe como argumento a constante do campo 'fullName';
  const fullNameValue = element.value.trim(); // a constante recebe o valor da variável e o trim() retira os espaços vazios;
  if(fullNameValue === '' || fullNameValue.lenght < 6) { // se o campo estiver vazio ou o seu tamanho for menor que 6 caracteres...
    setError(element, 'É necessário preencher o nome');  // invoca função de erro;
  } else {                                               // se não...
    setSuccess(element);                                 // invoca a função de sucesso;
    return true;                                         // retorna verdadeiro;
  }
}

fullName.onblur = () => { // função executada quando o campo perder o foco... **** Todas as funções onblur são iguais, só muda a função a ser invocada;
  validateFullName(fullName); // invoca função de validação do campo.
}

// Validação do campo Data de Nascimento (birthday):
function isBirthdayDateValid (birthday) { // Valida se a data de nascimento informada é anterior à 01/01/1900:
  const limitDate = new Date(1900, 00, 01); // define a data limite;
  const limitDateString = Date.parse(limitDate); // converte a data limite em String;
  const birthdayDate = Date.parse(birthday.value); // constante recebe o valor digitado pelo usuário e convertido em String pelo Date.parse;
  return (birthdayDate > limitDateString) // retorna true se a data digitada for mais recente(maior) que a data limite;
}

function isOverAge(birthday) { // Valida se é maior de 18 anos:
  const underAgeLimit = 18;    // define idade limite;
  const underAgeMinDate = new Date(new Date().setFullYear(new Date().getFullYear() - underAgeLimit)).setHours(00,00,00,00); // 1º cria variável de data (new date) e retorna o ano no padrão YYYY com base na data atual (getFullYear), diminuindo a idade limite de 18 anos; 2º define o ano com base na data atual (setFullYear); 3º define o valor da hora para zero hora;
  const birthdayDate = new Date(new Date(birthday.value)).setHours(00,00,00,00); // recebe a variável de data, com o valor zero definido para hora;
  return (birthdayDate < underAgeMinDate); // retorna true se a data digitada for anterior(menor) que a data limite;
}

const validateBirthday = (element) => { // Função de validação: recebe como argumento a constante do campo 'birthday';
  birthdayValue = element.value.trim(); // a constante recebe o valor da variável e o trim() retira os espaços vazios;
  if(birthdayValue === '') { // se o campo estiver vazio... invoca a função de erro;
    setError(element, 'É necessário informar a data de Nascimento'); 
  } else if(!isBirthdayDateValid(element)) { // se a data informada não for válida... invoca a função de erro;
    setError(element, 'O ano de nascimento informado é inválido');
  } else if(!isOverAge(element)) { // se não for maior de idade... invoca a função de erro;
    setUnderAge(element, 'Você é menor de idade. Peça a autorização dos seus pais para concluir o cadastro!'); 
  } else { // se não... invoca a função de sucesso e retorna verdadeiro;
    setSuccess(element);
    return true;
  }
}

birthday.onblur = () => { // função executada quando o campo perder o foco...
  validateBirthday(birthday); // invoca função de validação do campo.
}

// Validação do campo email (email):
function isValidEmail(email) { // valida se o email digitado é válido, de acordo com a RegExp abaixo:
  const regexEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // a constante regex (regular expression) é uma forma de validação dos caracteres do e-mail;
  return regexEmail.test(String(email).toLowerCase()); //Returns a Boolean value that indicates whether or not a pattern exists in a searched string.
}

const validateEmail = (element) => { // Função de validação: recebe como argumento a constante do campo 'email';
  const emailValue = element.value.trim();
  if(emailValue === '') { // Se o campo estiver vazio...
    setError(element, 'É necessário preencher um endereço de e-mail'); // invoca a função setError()
  } else if(!isValidEmail(emailValue)) { // Se o campo estiver preenchido, mas não bater com o padrão verificado na função isValidEmail()...
    setError(element, 'Informe um endereço de e-mail válido!'); // chama a função setError()
  } else { // Se o campo passou nas validações acima...
    setSuccess(element); // chama a função setSuccess().
    return true;
  }
}

email.onblur = () => {
  validateEmail(email);
}

// Validação do campo Senha (password):
// O padrão definido para a senha é:
// ^	The password string will start this way;
// (?=.*[a-z])	The string must contain at least 1 lowercase alphabetical character;
// (?=.*[A-Z])	The string must contain at least 1 uppercase alphabetical character;
// (?=.*[0-9])	The string must contain at least 1 numeric character;
// (?=.*[!@#$%^&*])	The string must contain at least one special character, but we are escaping reserved RegEx characters to avoid conflict;
// (?=.{8,})	The string must be eight characters or longer;
// regex pattern code = ("^(patternRequired)(sizeRequired)");

const isValidPassword = (password) => { // valida se a senha está dentro do padrão esperado:
  const passwordValue = password.value;
  const regexPassword = new RegExp("(^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]))(?=.{8,}))");
  return regexPassword.test(passwordValue); // retorna true se estiver no padrão;
}

const passwordContainsName = () => { // valida se a senha informada possui o mesmo valor do campo nome:
  const passwordValue = password.value.toLowerCase(); // recebe o valor de senha e converte em minúsculas para fazer a validação;
  const fullNameString = fullName.value.toLowerCase(); // recebe o valor de nome e converte em minúsculas para fazer a validação;
  const fullNamewithoutAccent = fullNameString.normalize('NFD').replace(/[\u0300-\u036f]/g, ""); // retira os acentos do nome;
  console.log(fullNamewithoutAccent);
  const fullNameArray = fullNamewithoutAccent.split(' '); // converte a string nome em um array, cada posição recebe uma palavra, a separação ocorre com base no espaço entre elas;;
  
  for (const element of fullNameArray) { // usa o for para percorrer todos os elementos do array...
    if (passwordValue.includes(element)) { // se a senha possui alguma palavra do nome... retorna true;
      console.log(element);
      return true;
    }
  }
}

const passwordContainsBirthdayDate = () => { // valida se a senha informada possui o mesmo valor do campo data de nascimento:
  const passwordValue = password.value.trim();
  const birthdayValue = new Date(birthday.value); // converte birthday em data;
  // Vamos construir duas strings de data de nascimento para comparar com a senha, uma terá o ano padrão YY e outra YYYY;
  const birthdayDay = String(birthdayValue.getDate()).padStart(2,'0'); // pega o dia da data, converte em String e define o lenght da string em 2 caracteres (caso ele seja menor, adicionar o 0 na frente);
  const birthdayMonth = String((birthdayValue.getMonth() + 1)).padStart(2,'0'); //January is 0! Pega o mês da data, soma 1 porque Janeiro é 0, converte em String e define o lenght da string em 2 caracteres (caso ele seja menor, adicionar o 0 na frente);
  const birthdayFullYear = String(birthdayValue.getFullYear()); // pega o ano com padrão YYYY e converte em string;
  const birthdayYear = String(birthdayValue.getYear()); // pega o ano com padrão YY e converte em string;
  const birthdayDDMMYYYY = birthdayDay + birthdayMonth + birthdayFullYear; // concatena as strings para formar uma data completa com o ano no padrão YYYY;
  const birthdayDDMMYY = birthdayDay + birthdayMonth + birthdayYear; // concatena as strings para formar uma data completa com o ano no padrão YY;

  if (passwordValue.includes(birthdayDDMMYY) || passwordValue.includes(birthdayDDMMYYYY)) { // se a senha possuir a data de nascimento...
    return true;
  }
}

const passwordContainsEmail = () => { // valida se a senha informada possui o mesmo valor do campo email:
  const passwordValue = password.value.toLowerCase();
  const emailString = email.value.toLowerCase();
  const emailArray = emailString.split('@'); // separa o valor do e-mail a partir do @ e transforma em Array;
  
  for (element of emailArray) {
    if (passwordValue.includes(element)) { // valida se a senha contêm um dos elementos do novo array e-mail;
      return true;
    }
  }
}

const validatePassword = (element) => { // Função de validação: recebe como argumento a constante do campo 'password':
  const passwordValue = element.value.trim();
  console.log(passwordValue);
  
  if(passwordValue === '' || !isValidPassword(element)) { // se o valor da senha for vazio ou não for válido... 
    setError(element, 'Informe uma senha válida!'); // invoca a função de erro;
  } else if(fullName.value.trim() !== '' && passwordContainsName()) { // se o valor de nome não for vazio e a senha contém o nome...
    setError(element, 'Informe uma senha válida, diferente do nome!'); // invoca a função de erro;
  } else if(birthday.value.trim() !== '' && passwordContainsBirthdayDate()) { // se o valor de data de nascimento não for vazio e a senha contém a data de nascimento...
    setError(element, 'Informe uma senha válida, diferente da data de nascimento!'); // invoca a função de erro;
  } else if(isValidEmail(email) && passwordContainsEmail()) { // se o valor de email não for vazio e a senha contém o email...
    setError(element, 'Informe uma senha válida, diferente do e-mail!'); // invoca a função de erro;
  } else {
    setSuccess(element); // invoca a função de sucesso;
    return true;
  }
}


password.onfocus = () => { // Código para quando o usuário clicar no campo Senha...
  document.getElementById('passwordMessage').style.display = "block"; // mostrar a div Html 'passwordMessage' com a informação do padrão da senha;
}

password.onblur = () => { // quando o usuário tirar o foco do campo senha...
  document.getElementById('passwordMessage').style.display = "none"; // a div com o padrão da senha será ocultada, e 
  validatePassword(password); // a função de validação de senha será invocada, e 
  validateConfirmPassword(confirmPassword); // a função de validação da confirmação da senha também será invocada;
}

// Código mostrar para o usuário quais requisitos da senha foram atingidos, enquanto essa é digitada. Construção:
// Na div 'passwordMessage' do Html, cada requisito foi adicionado dentro de um parágrafo com ID específico. 
// No Css, foram criadas as classes: 'invalid' que estilliza a fonte na cor vermelha e 'valid' que estiliza a fonte na cor verde.
// Então, a cada caractere digitado a função é executada, os parágrafos dos requisitos atingidos recebem a classe 'valid', enquanto a classe 'invalid' é removida.
// Lembrete: a div Html com essa validação será mostrada ao usuário somente enquanto o foco desse estiver no campo senha.
password.onkeyup = () => {
  // Validar letras minúsculas:
  const LowerCaseLetter = /[a-z]/g;
  if(password.value.match(LowerCaseLetter)) { // se letras minúsculas forem digitadas...
    letter.classList.remove('invalid'); // remove a classe 'invalid' que tem a estilização na cor vermelha;
    letter.classList.add('valid'); // adiciona a classe 'valid' que tem a estilização na cor verde;
  } else {                          // se for false... inverte as classes.
    letter.classList.remove('valid');
    letter.classList.add('invalid');
  }
  // Validar letras maiúsculas:
  const UpperCaseLetter = /[A-Z]/g;
  if(password.value.match(UpperCaseLetter)) {
    capitalLetter.classList.remove('invalid');
    capitalLetter.classList.add('valid');
  } else {
    capitalLetter.classList.remove('valid');
    capitalLetter.classList.add('invalid');
  }
  // Validar número:
  const numberCharacterExists = /[0-9]/g;
  if(password.value.match(numberCharacterExists)) {
    numberCharacter.classList.remove('invalid');
    numberCharacter.classList.add('valid');
  } else {
    numberCharacter.classList.remove('valid');
    numberCharacter.classList.add('invalid');
  }
  // Validar Caractere Especial:
  const specialCharacterExists = /[!@#$%^&*]/g;
  if(password.value.match(specialCharacterExists)) {
    specialCharacter.classList.remove('invalid');
    specialCharacter.classList.add('valid');
  } else {
    specialCharacter.classList.remove('valid');
    specialCharacter.classList.add('invalid');
  }
  // Validar Comprimento de 8 caracteres: ^
  if(password.value.length >= 8) {
    lengthPassword.classList.remove('invalid');
    lengthPassword.classList.add('valid');
  } else {
    lengthPassword.classList.remove('valid');
    lengthPassword.classList.add('invalid');
  }
}

// Validação do campo Confirmação de Senha (confirmPassword):
const validateConfirmPassword = (element) => { // Função de validação: recebe como argumento a constante do campo 'confirmPassword':
  const confirmPasswordValue = element.value.trim();
  if(confirmPasswordValue === '') { // se o campo estiver vazio;
    setError(element, 'Confirme sua senha!'); // invoca a função de erro;
  } else if(confirmPasswordValue !== password.value.trim()) { // se o valor de confirmação de senha for diferente do valor de senha;
    setError(element, 'As senhas informadas são diferentes!'); // invoca a função de erro;
  } else {
    setSuccess(element);
    return true;
  }
}

confirmPassword.onblur = () => {
  validateConfirmPassword(confirmPassword);
}

// Validação do campo Cep (cep):
const isValidCep = (element) => { // valida se o valor do cep corresponde a Regex determinada;
  const cepValue = element.value;
  const cepValueParsed = cepValue.normalize('NFD').replace(/([\u0300-\u036f]|[^0-9a-zA-Z])/g, ''); // tira a máscara de Cep do valor de Cep. Essa conversão é necessária, pois o valor de 'cep' é alterado após a primeira validação;
  const regexCepJustNumbers = /^[0-9]{8}$/; // padrão somente números e oito caracteres;
  return regexCepJustNumbers.test(String(cepValueParsed)); // retorna true se teste indicar que o cep está no padrão;
}

const validateCep = (element) => { // Função de validação: recebe como argumento a constante do campo 'cep':
  const cepValue = element.value.trim();
  if(isValidCep(element)) { // se o cep for válido...
    element.value = cepValue.replace(/\D/g, "").replace(/^(\d{2})(\d{3})(\d{3})+?$/, "$1.$2-$3"); // adiciona a máscara: 00.000-000 ao valor de cep, e 
    setSuccess(element); // invoca a função de sucesso;
    return true;
  } else { // se não...
    setError(element, 'Informe um Cep válido!'); // invoca a função de erro;
  }
}

cep.onblur = () => {
  validateCep(cep);
}

// Validação do campo Logradouro (street):
const validateStreet = (element) => { // Função de validação: recebe como argumento a constante do campo 'street';
  const streetValue = element.value.trim();
  if(streetValue === '' || streetValue.lenght < 3) { // se o campo estiver vazio ou lenght for menor que 3 caracteres...
    setError(element, 'Informe um endereço válido!'); // invoca a função de erro;
  } else { // se não...
    setSuccess(element); // invoca a função de sucesso;
    return true;
  }
}

street.onblur = () => {
  validateStreet(street);
}

// Validação do campo Número (numberAddress):
const isValidNumber = (numberAddress) => { // valida se o valor de número atende o padrão definido:
  const regexNumber = /^[0-9]{1,}$/; // padrão de somente números e no mínimo 1 caractere;
  return regexNumber.test(String(number)); // retorna true se estiver no padrão.
}

const validateNumberAddress = (element) => { // Função de validação: recebe como argumento a constante do campo 'numberAddress';
  const numberAddressValue = element.value.toLowerCase().trim();
  if (numberAddressValue === 's/n' || (isValidNumber && numberAddressValue > 0)) { // se número for s/n ou (for válido e maior que 0)...
    setSuccess(element); // invoca a função de sucesso;
    return true;
  } else {
    setError(element, 'Informe um número ou s/n!');
  }
}

numberAddress.onblur = () => {
  validateNumberAddress(numberAddress);
}

// Validação do campo Bairro (district):
const validateDistrict = (element) => { // Função de validação: recebe como argumento a constante do campo 'district';
  const districtValue = element.value.trim();
  if(districtValue === '' || districtValue.lenght < 3) { // se o valor for vazio ou o lenght menor que 3 caracteres...
    setError(element, 'Informe um bairro válido!'); // invoca a função de erro;
  } else {
    setSuccess(element);
    return true;
  }
}

district.onblur = () => {
  validateDistrict(district)
}

// Validação do campo Cidade (city):
const validateCity = (element) => { // Função de validação: recebe como argumento a constante do campo 'city';
  const cityValue = element.value.trim();
  if(cityValue === '' || cityValue.lenght < 3) { // se o valor for vazio ou o lenght menor que 3 caracteres...
    setError(element, 'Informe uma cidade válida!'); // invoca a função de erro;
  } else {
    setSuccess(element);
    return true;
  }
}

city.onblur = () => {
  validateCity(city);
}

// Validação do campo Estado (state):
const validateState = (element) => { // Função de validação: recebe como argumento a constante do campo 'state';
  const stateValue = element.value.trim();
  if(stateValue === '' || stateValue.lenght < 3) { // se o valor for vazio ou o lenght menor que 3 caracteres...
    setError(element, 'Informe um estado válido!'); // invoca a função de erro;
  } else {
    setSuccess(element);
    return true;
  }
}

state.onblur = () => {
  validateState(state);
}

// Função para limpar os campos no momento da submissão do formulário:
const cleanInputs = () => {
  const inputFields = document.getElementsByClassName("inputField"); // pega os campos com a classe indicada, como todos os campos de input possuem essa classe, a constante recebe um array;
  for (fieldElement of inputFields) { // usa o for para percorrer todos os elementos do array, executando...
    const inputElement = fieldElement; // recebe o elemento (inputField) do array;
    const inputControl = fieldElement.parentElement; // recebe o elemento pai do inputField do array;
    const errorMessage = inputControl.querySelector('.errorMessage'); // recebe a div errorMessage que está dentro do elemento pai;
    inputElement.value = ''; // o valor do inputField recebe vazio (limpa);
    errorMessage.innerText = ''; // o texto da div errorMessage recebe vazio (limpa;)
    inputControl.classList.remove('success'); // remove do elemento pai a classe adicionada na função de sucesso;
    inputControl.classList.remove('underAge'); // remove do elemento pai a classe adicionada na função de validação da data de nascimento (caso exista);
  }
}

// Função que verifica se tem algum elemento com a classe '.error':
const validateClassError = () => {
  const errorMessageClass = document.getElementsByClassName("error"); // recebe todos os elementos com a classe '.error';
  return (errorMessageClass.length > 0);  // retorna true se o lenght da constante é maior que 0 (se tem algum elemento com a classe '.error');
}

// Função de validação dos inputs e de submissão do formulário:
const submitInputs = () => { // invoca as funções de validação de todos os campos do formulário;

  validateFullName(fullName);
  validateBirthday(birthday);
  validateEmail(email);
  validatePassword(password);
  validateConfirmPassword(confirmPassword);
  validateCep(cep);
  validateStreet(street);
  validateNumberAddress(numberAddress);
  validateDistrict(district);
  validateCity(city);
  validateState(state);

  if (validateClassError()) { // se tiver algum elemento com a classe '.error':
    console.log('Deu erro!'); 
    swal('Dados inválidos!', 'Verifique os campos em vermelho!', 'error'); // Dispara um alerta de erro na tela;
  } else {                    // se não...
    console.log('Deu certo!') 
    cleanInputs();            // invoca a função de limpar os campos do formulário, e...
    swal('Feito!', 'Dados salvos com sucesso!', 'success'); // dispara um alerta de sucesso na tela.
  }
}

const configs = {
  method: "GET"
}

// Criação das constantes para receber os elementos HTML que serão validados mais abaixo:
const form = document.getElementById('form');
const fullName = document.getElementById('fullName');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const cep = document.getElementById('cep');
const searchCep = document.getElementById('searchCep');
const street = document.getElementById('street');
const number = document.getElementById('number');
const district = document.getElementById('district');
const city = document.getElementById('city');
const state = document.getElementById('state');
const letter = document.getElementById('letter');
const capitalLetter = document.getElementById('capitalLetter');
const numberCharacter = document.getElementById('numberCharacter');
const specialCharacter = document.getElementById('specialCharacter');
const lengthPassword = document.getElementById('lengthPassword');

// Código para quando o usuário clicar no campo Senha, mostrar o campo da Mensagem do padrão de senha:
password.onfocus = () => {
  document.getElementById('passwordMessage').style.display = "block";
}
// Código para ocultar o campo da Mensagem quando o usuário tirar o foco do campo Senha:
password.onblur = () => {
  document.getElementById('passwordMessage').style.display = "none";
}
// Código para validar o que o usuário digita no campo Senha:
password.onkeyup = () => {
  // Validar letras minúsculas:
  const LowerCaseLetter = /[a-z]/g;
  if(password.value.match(LowerCaseLetter)) { // se a verificação for true...
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
  // Validar Comprimento de 8 caracteres:
  if(password.value.length >= 8) {
    lengthPassword.classList.remove('invalid');
    lengthPassword.classList.add('valid');
  } else {
    lengthPassword.classList.remove('valid');
    lengthPassword.classList.add('invalid');
  }
}


// Código para validação, consulta e autopreenchimento do Cep:
// Como eu alterei o type de Submit para Button, não precisa mais usar o preventDefault() da página nesse momento.
searchCep.addEventListener('click', () => { // o event é um parâmetro da arrow function
  search(); // chama a função de validação que vai ser escrita mais abaixo.
});

const search = async () => { // função assíncrona, pois depende de retorno externo à página.

  const cepValue = cep.value // constante recebe o value da constante cep, que recebeu acima o elemento html 'input cep'.
  
  try {
    if(!isValidCep(cepValue)) { // invoka a função de validação de cep mais abaixo, se não for válido...
      setError(cep, 'Informe um Cep válido!'); // chama a função setError(),
      swal('Erro!', 'Informe um Cep válido!', 'error'); // e dispara um alerta na tela com a mensagem de erro.
    } else {                                            // se o cep for válido...
      const result = await fetch(`https://ws.apicep.com/cep/${cepValue}.json`, configs) // executa o request na API externa usando fetch()
      const data = await result.json();

      if (data.status >= 400 && data.status < 500) { // valida pelo código do status se o retorno do request foi inválido...
        console.log(data)
        throw data.message // envia o value da message de retorno para catch
      }
      console.log(data)
      showResults(data) // se o retorno do request for válido, invoka a função showResults() com os dados retornados.
    }
  } catch (error) {
    console.log(error)
    if(error == 'Blocked by flood') { // valida o teor do erro para definir o tipo da mensagem exibida ao usuário. Validação feita pela message, pois é o valor recebido (de throw) pelo catch(error).
      swal('Erro!', 'Você excedeu o limite de solicitações. É necessário alterar o país da sua VPN!', 'error');
    } else {
      swal('Erro!', error, 'error');
    }
  }
}

// Código para adicionar o resultado da consulta Cep aos campos de endereço:
const showResults = (address) => {
  street.value = address.address
  district.value = address.district
  city.value = address.city
  state.value = address.state
}

// Código para validação do formulário:

// Essa função evita que o formulário seja submetido antes da validação ser realizada:
form.addEventListener('submit', event => { // o event é um parâmetro da arrow function
  event.preventDefault(); // para o comportamento padrão do sistema (enviar o formulário).

  validateInputs(); // chama a função de validação que vai ser escrita mais abaixo.
});

// Função que define o comportamento do campo do formulário em caso de erro na validação:
const setError = (element, message) => { // arrow function vai receber dois parâmetros, o 1º é a tag do campo preenchido e o 2º é a mensagem de erro a ser mostrada;
  const inputControl = element.parentElement; // a constante recebe o elemento pai do campo preenchido;
  const errorDisplay = inputControl.querySelector('.errorMessage'); // a constante recebe o elemento com a classe .errorMessage dentro do elemento pai do campo preenchido;
  console.log(errorDisplay);
  errorDisplay.innerText = message; // o campo com a classe .errorMessage vai receber o valor recebido no segundo argumento da função;
  inputControl.classList.add('error'); // o elemento pai do campo preenchido irá receber a classe .error, que no CSS está estilizada com borda vermelha;
  inputControl.classList.remove('success'); // a classe .success será removida do elemento pai do campo preenchido.
}


// Função que define o comportamento do campo do formulário em caso de validação positiva:
const setSuccess = (element) => { // arrow function com parâmetro element, o argumento será a tag do campo preenchido;
  const inputControl = element.parentElement; // a constante recebe o elemento pai do campo preenchido;
  const errorDisplay = inputControl.querySelector('.errorMessage'); // a constante recebe o elemento com a classe .errorMessage dentro do elemento pai do campo preenchido;

  errorDisplay.innerText = ''; // o campo com a classe .errorMessage vai receber valor em branco;
  inputControl.classList.add('success'); // o elemento pai do campo preenchido vai receber a classe .success, que no CSS está estilizada com borda verde;
  inputControl.classList.remove('error'); // a classe .error será removida do elemento pai do campo preenchido.
}

// Função para validar se a senha é válida, o padrão deve ser:
// ^	The password string will start this way;
// (?=.*[a-z])	The string must contain at least 1 lowercase alphabetical character;
// (?=.*[A-Z])	The string must contain at least 1 uppercase alphabetical character;
// (?=.*[0-9])	The string must contain at least 1 numeric character;
// (?=.*[!@#$%^&*])	The string must contain at least one special character, but we are escaping reserved RegEx characters to avoid conflict;
// (?=.{8,})	The string must be eight characters or longer;
// regex pattern = ("^(patternRequired)(sizeRequired)");

const isValidPassword = (password) => {
  const regexPassword = ("(^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]))(?=.{8,}))");
  return regexPassword.test(String(password));
}

// Função para validar o e-mail válido:
const isValidEmail = (email) => { // a arrow function vai validar se o e-mail digitado bate com a regex e retornar um boolean;
  const regexEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // a constante re (regular expression) é uma forma de validação dos caracteres do e-mail;
  return regexEmail.test(String(email).toLowerCase()); //Returns a Boolean value that indicates whether or not a pattern exists in a searched string.
}

// Função para validar se o cep é válido (não dá pra usar o retorno da função search() porque o user pode alterar o número do campo)
const isValidCep = (cep) => {
  const regexCep = /^[0-9]{8}$/;
  return regexCep.test(String(cep));
}

// Função para validar se o campo número está preenchido somente com números ou com s/n:
const isValidNumber = (number) => {
  const regexNumber = /^[0-9]{1}$/;
  return regexNumber.test(String(number));
}

// Função que fará a validação dos inputs:
const validateInputs = () => {
  const fullNameValue = fullName.value.trim(); // Cada constante receberá o valor digitado no campo, a função .trim() retira os espaços em branco do campo;
  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();
  const confirmPasswordValue = confirmPassword.value.trim();
  const cepValue = cep.value.trim();
  const streetValue = street.value.trim();
  const numberValue = number.value.toLowerCase().trim()
  const districtValue = district.value.trim();
  const cityValue = city.value.trim();
  const stateValue = state.value.trim();

  if(fullNameValue === '') {
    setError(fullName, 'É necessário preencher o nome'); 
  } else {
    setSuccess(fullName);
  }

  if(emailValue === '') { // Se o campo estiver vazio...
    setError(email, 'É necessário preencher um endereço de e-mail'); // chama a função setError()
  } else if(!isValidEmail(emailValue)) { // Se o campo estiver preenchido, mas não bater com o padrão verificado na função isValidEmail()...
    setError(email, 'Informe um endereço de e-mail válido!'); // chama a função setError()
  } else { // Se o campo passou nas validações acima...
    setSuccess(email); // chama a função setSuccess().
  }

  // Validação da senha, ainda falta comparar com o nome e com a data de nascimento:
  if(passwordValue === '' || !isValidPassword ) {
    setError(password, 'Informe uma senha válida!');
  } else if(emailValue !== '') {
    if (passwordValue.toLowerCase().match(emailValue.toLowerCase())) { 
      setError(password, 'Informe uma senha válida, diferente do seu e-mail!');
    }
  } else if(fullNameValue !== '') {
    if(passwordValue.toLowerCase().match(fullNameValue.toLowerCase())) {
      setError(password, 'Informe uma senha válida, diferente do seu nome!');
    }
  } else {
    setSuccess(password);
  }

  if(confirmPasswordValue === '') {
    setError(confirmPassword, 'Confirme sua senha!');
  } else if(confirmPasswordValue !== passwordValue) {
    setError(confirmPassword, 'As senhas informadas são diferentes!');
  } else { 
    setSuccess(confirmPassword);
  }

  if(isValidCep(cepValue)) {
    setSuccess(cep);
  } else {
    setError(cep, 'Informe um Cep válido!');
  }

  if(streetValue === '') {
    setError(street, 'Informe um endereço válido!');
  } else {
    setSuccess(street);
  }

  if (numberValue === 's/n' || (numberValue != 0 && isValidNumber(numberValue))) {
    setSuccess(number);
  } else {
    setError(number, 'Informe um número ou s/n!');
  }

  if(districtValue === '') {
    setError(district, 'Informe um bairro válido!');
  } else {
    setSuccess(district);
  }

  if(cityValue === '') {
    setError(city, 'Informe uma cidade válida!');
  } else {
    setSuccess(city);
  }

  if(stateValue === '') {
    setError(state, 'Informe um estado válido!');
  } else {
    setSuccess(state);
  }
}


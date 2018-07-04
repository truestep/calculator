'use strict'
function calculateRpn(query) {

  // operators look-up-table
  // left value is needed to compare precedence
  // right value is means left association (0) or right association (1)
  var operators = { };
  operators['+'] = [0, 0];
  operators['-'] = [0, 0];
  operators['*'] = [1, 0];
  operators['/'] = [1, 0];
  operators['%'] = [1, 0];

  // check whether given token is operator or not
  function isOperator(token) {
    if (operators[token])
      return true;

    return false;
  }

  // compare precedence of operators i.e. which of them should be
  // calculated first (returns number)
  function comparePrecedence(token1, token2) {
    if (!isOperator(token1))
      throw new Error("Invalid token: " + token);

    if (!isOperator(token2))
      throw new Error("Invalid token: " + token);

    return operators[token1][0] - operators[token2][0];
  }

  // little helper function allowing to look up value in last cell in
  // a given array which simulates a stack
  function peek(array) {
    if (array.length > 0)
      return array[array.length - 1];

    return null;
  }

  // take input string and return array of tokens or null if the input is
  // incorrect
  function tokenizeInput(input) {

    var query = input.replace(/\s/g, '');

    // first we get rid of any invalid characters
    if (/[^0-9.+\-/*()]/g.test(query))
      return null;

    // if string ends or startswith either of those
    // ('.', '+', '-', '*', '/', '(') it must be incorrect
    // NOTE: '-' is allowed at the beginning as it means
    // negative number
    if (/[.+\-*\(]/.test(query.charAt(query.length - 1))
      || /[.+*\)]/.test(query.charAt(0)))
      return null;

    // find places where negation occurs (i.e. '(-3)'') and place zeros
    // before minuses
    var indexesForZeros = [];
    for (var i = 0; i < query.length; i++)
      if (query.charAt(i) === '('
        && query.charAt(i + 1) === '-')
        indexesForZeros.push(i + 1);

    for (var i = 0; i < indexesForZeros.length; i++) {
      query = query.slice(0, indexesForZeros[i])
        + '0' + query.slice(indexesForZeros[i]);
    }

    // special case where negation happens at the beginning of input
    if (query.charAt(0) === '-')
      query = '0' + query;

    var tokens = [];
    var parentheses = 0;
    var currentNumber = '';
    var areWeInsideANumber = false;
    var wasPreviousTokenOperator = false;

    for (var i = 0; i < query.length; i++) {
      var a = query.charAt(i);


      if (/[+\-/*]/.test(a)) {
        // previous token was an operator and this one is so
        // there are two operators after each other and the input
        // is invalid
        if (wasPreviousTokenOperator)
          return null;

        wasPreviousTokenOperator = true;
      } else {
        wasPreviousTokenOperator = false;
      }

      // check if current char is a number
      if (/[0-9]/.test(a)) {
        areWeInsideANumber = true;
        currentNumber += a;
        // or an operator (including brackets)
      } else if (/[+\-/*()]/.test(a)) {

        areWeInsideANumber = false;

        if (currentNumber !== '')
          tokens.push(currentNumber);

        currentNumber = '';

        tokens.push(a);
      }

      if (a === '(') parentheses++;
      if (a === ')') parentheses--;
    }

    // parentheses is broken
    if (parentheses != 0)
      return null;

    // add last number to the tokens array
    tokens.push(currentNumber);
    return tokens;
  }

  // convert infix to Reverse Polish notation
  function shuntingYard(tokens) {
    var out = [];
    var stack = [];

    for (var i = 0; i < tokens.length; i++) {
      if (isOperator(tokens[i])) {
        while (stack.length > 0 && isOperator(peek(stack))) {
          if (comparePrecedence(tokens[i], peek(stack)) <= 0)
          {
            out.push(stack.pop());
            continue;
          }
          break;
        }
        stack.push(tokens[i]);
      } else if (tokens[i] == '(') {
        stack.push(tokens[i]);
      } else if (tokens[i] == ')') {
        while (stack.length > 0 && peek(stack) != '(') {
          out.push(stack.pop());
        }
        stack.pop();
      } else {
        out.push(tokens[i]);
      }
    }
    while (stack.length > 0) {
      out.push(stack.pop());
    }

    // we have to filter empty tokens that might appear
    out = out.filter(Boolean);

    return out;
  }

  // calculate result from Reverse Polish notation
  function calculateRpn(tokens) {
    tokens = tokens.reverse();
    var stack = [];

    while (tokens.length > 0) {

      var a = tokens.pop();

      if (/[^+\-/*]/g.test(a)) {
        stack.push(a);
      } else {
        // not enough values on stack
        if (stack.length < 2) {
          return null;
        } else {
          var c = Number(stack.pop());
          var b = Number(stack.pop());
          var d = 0;
          // evaluate operator
          switch (a) {
            case '+':
              d = b + c;
              break;

            case '-':
              d = b - c;
              break;

            case '*':
              d = b * c;
              break;

            case '/':
              d = b / c;
              break;

          }
          stack.push(d);
        }
      }
    }

    if (stack.length === 1) {
      // convert to a number in case there was one thing on the stack
      return Number(stack.pop());
    }

    return null;
  }

  if (query.length === 0)
    return null;

  var tokens = tokenizeInput(query);
  if (tokens === null)
    return 'Incorrect query';

  var out = shuntingYard(tokens);

  var result = calculateRpn(out);
  if (result === null)
    return 'Incorrect query';

  return result;
}

function calculate(query) {
  return new Promise((resolve, reject) => {
    let res
    try {
      res = calculateRpn(query)
      resolve(res)
    } catch (e) {
      reject(e)
    }

  })
}


module.exports = {
  calculate: calculate
}
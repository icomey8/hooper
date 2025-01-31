
![hooper logo](docs/hooper.png)

# hooper
> Created by Ian Comey and Jaime Quiogue

## About

Inspired by our love of basketball and how creative it can be in all aspects of the sport, we're setting out to create a JavaScript-like language with some tweaks on syntax, structure, and concurrency.  For concurrency specifically, we want to explore an alternative solution with coroutines and channels instead of JS' existing event-loop approach. 

## Features

- enforced encapsulation
- static typing
- inheritance
- method overloading

## Keyword Guide

| hooper   | Javascript    |
| -------- | ------------- |
| swish    | true          |
| brick    | false         |
| turnover | break         |
| dunk     | return        |
| pick     | let           |
| play     | func          |
| foul     | null literal  |
| dribble  | while         |
| shoot    | if            |
| reb      | else if       |
| putback  | else          |
| to       | console.log() |

## Example Programs

### hello world
| _Javascript   | _hooper_    |
| -------- | ------------- |
| `console.log("hello world")` | `log("hello world")`       |

### fibonacci sequence
<table>  
  <tr>  
    <th>JavaScript</th>  
    <th>Hooper</th>  
  </tr>  
  <tr>  
    <td>  

   ```javascript
function fibonacci(n) {  
  let sequence = [0, 1];  
  for (let i = 2; i < n; i++) {  
    sequence.push(sequence[i - 1] + sequence[i - 2]);  
   }  
    return sequence;  
}  
   ```  

   </td>  
    <td>  

 ```hooper  
 play fibonacci(n)  
   pick sequence = [0, 1]  
   for (i = 2; i < n; i++)  
     sequence.push(sequence[i - 1] + sequence[i - 2])  
     dunk sequence  
 ```  

   </td>  
  </tr>  
</table>  

   
### GCD

<table>  
  <tr>  
    <th>JavaScript</th>  
    <th>Hooper</th>  
  </tr>  
  <tr>  
    <td>  

   ```javascript  
function gcd(a, b) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}  
   ```  

   </td>  
    <td>  

 ```hooper  
    play gcd(a, b) 
        dribble (b !== 0) 
            pick temp = b;
            b = a % b;
            a = temp; 
        dunk a;
 ```  

   </td>  
  </tr>  
</table> 

###  Palindrome

<table>  
  <tr>  
    <th>JavaScript</th>  
    <th>Hooper</th>  
  </tr>  
  <tr>  
    <td>  

   ```javascript  
function isPalindrome(str) {
    let cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric characters
    return cleanStr === cleanStr.split('').reverse().join('');
}
   ```  

   </td>  
    <td>  

 ```hooper  
play Palindrome(s) 
    pick ogstr = s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    pick revstr = ogstr.split('').reverse().join('');
    dunk ogstr === revstr;
 ```  

   </td>  
  </tr>  
</table> 


## Infinite Loop

<table>  
  <tr>  
    <th>JavaScript</th>  
    <th>Hooper</th>  
  </tr>  
  <tr>  
    <td>  

   ```javascript  
while (true) {
    console.log("This is an infinite loop!");
}
   ```  

   </td>  
    <td>  

 ```hooper  
dribble(swish)
  log("infinite dribble loop")
 ```  

   </td>  
  </tr>  
</table> 


## Conditionals

<table>  
  <tr>  
    <th>JavaScript</th>  
    <th>Hooper</th>  
  </tr>  
  <tr>  
    <td>  

   ```javascript  
let num = 0;

if (num > 0) 
    console.log("The number is positive.");
else if (num < 0) {
    console.log("The number is negative.");
} 
else 
    console.log("The number is zero.");
   ```  

   </td>  
    <td>  

 ```hooper  
pick num = 0;

  shoot (num > 0) 
    log("The number is positive.");
  reb (num < 0) {
    log("The number is negative.");
  putback 
    log("The number is zero.");
 ```  

   </td>  
  </tr>  



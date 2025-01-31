
![hooper logo](docs/hooper.png)

# hooper
> Created by Ian Comey and Jaime Quiogue

## About

Inspired by our love of basketball and how creative it can be in all aspects of the sport, we're setting out to create a JavaScript-like language with some tweaks on syntax, structure, and concurrency.  For concurrency specifically, we want to explore an alternative solution with coroutines and channles instead of JS' existing event-loop approach. 

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

### Valid Palindrome

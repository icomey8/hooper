
![hooper logo](docs/hooper.png)

# hooper
> Created by Ian Comey and Jaime Quiogue

## About

Designing a new, unique language for CMSI 3802

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
| _Javascript_   | _hooper_    |
|------------|----------------|
| ```javascript<br>function fibonacci(n) {<br> &nbsp;&nbsp;let sequence = [0, 1];<br> &nbsp;&nbsp;for (let i = 2; i < n; i++) {<br> &nbsp;&nbsp;&nbsp;&nbsp;sequence.push(sequence[i - 1] + sequence[i - 2]);<br> &nbsp;&nbsp;}<br> &nbsp;&nbsp;return sequence;<br>}<br>console.log(fibonacci(10)); // Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]<br>``` | ```hooper<br>play fibonacci(n)<br>pick sequence = [0, 1];<br>for (i = 2; i < n; i++)<br>&nbsp;&nbsp;sequence.push(sequence[i - 1] + sequence[i - 2]);<br>dunk sequence;<br>``` |
   
### GCD

### Valid Palindrome

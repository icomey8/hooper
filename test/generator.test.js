import { describe, it } from "node:test";
import assert from "node:assert/strict";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";
import optimize from "../src/optimizer.js";
import generate from "../src/generator.js";

function dedent(s) {
	return `${s}`.replace(/(?<=\n)\s+/g, "").trim();
}

const fixtures = [
	{
		name: "small",
		source: `
	    pick x = 3 * 7;
	    x++;
	    pick y = true;
	  `,
		expected: dedent`
	    let x_1 = (3 * 7);
	    x_1++;
	    let y_2 = true;
	  `,
	},
	{
		name: "if",
		source: `
        pick x = 0;
        if (x == 0) { log(1); }
      `,
		expected: dedent`
        let x_1 = 0;
        if ((x_1 === 0)) {
          console.log(1);
        }
      `,
	},
	{
		name: "while",
		source: `
	    pick x = 0;
	    while (x < 5) {
	      pick y = 0;
	      while y < 5 {
	        log(x * y);
	        y = y + 1;
	        break;
	      }
	      x = x + 1;
	    }
	  `,
		expected: dedent`
	    let x_1 = 0;
	    while ((x_1 < 5)) {
	      let y_2 = 0;
	      while ((y_2 < 5)) {
	        console.log((x_1 * y_2));
	        y_2 = (y_2 + 1);
	        break;
	      }
	      x_1 = (x_1 + 1);
	    }
	  `,
	},
	{
		name: "functions",
		source: `
	    pick z = 2;
	    define play f(x: number, y: boolean) {
			log(x);
			log(y);
	    }
	    define play g() {
			log(z);
	    }
	  `,
		expected: dedent`
	    let z_1 = 2;
	    function f_4(x_2, y_3) {
			console.log(x_2);
			console.log(y_3);
	    }
	    function g_5() {
			console.log(z_1);
	    }
	  `,
	},
	{
		name: "arrays",
		source: `
	    pick a = [true, false, true];
	    pick b = [10, 30];
		pick c = [1, 2, 3]; 
		c[1] = 100;
	    
	  `,
		expected: dedent`
	    let a_1 = [true, false, true];
	    let b_2 = [10, 30];
		let c_3 = [1, 2, 3];
		c_3[1] = 100;
	    
	  `,
	},
];

describe("The code generator", () => {
	for (const fixture of fixtures) {
		it(`produces expected js output for the ${fixture.name} program`, () => {
			const actual = generate(optimize(analyze(parse(fixture.source))));
			assert.deepEqual(actual, fixture.expected);
		});
	}
});

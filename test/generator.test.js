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
	      dunk;
	    }
	    define play g() -> boolean {
	      dunk false;
	    }
	    f(8, g());
	  `,
		expected: dedent`
	    let z_1 = 2;
	    function f_2(x_3, y_4) {
	      return;
	    }
	    function g_5() {
	      return false;
	    }
	    f_2(8, g_5());
	  `,
	},
	{
		name: "arrays",
		source: `
	    pick a = [true, false, true];
	    pick b = [10, 30];
	    
	  `,
		expected: dedent`
	    let a_1 = [true, false, true];
	    let b_2 = [10, 30];
	    
	  `,
	},
	// {
	// 	name: "optionals",
	// 	source: `
	//     let x = no int;
	//     let y = x ?? 2;
	//     struct S {x: int}
	//     let z = some S(1);
	//     let w = z?.x;
	//   `,
	// 	expected: dedent`
	//     let x_1 = undefined;
	//     let y_2 = (x_1 ?? 2);
	//     class S_3 {
	//     constructor(x_4) {
	//     this["x_4"] = x_4;
	//     }
	//     }
	//     let z_5 = new S_3(1);
	//     let w_6 = (z_5?.["x_4"]);
	//   `,
	// },
];

describe("The code generator", () => {
	for (const fixture of fixtures) {
		it(`produces expected js output for the ${fixture.name} program`, () => {
			const actual = generate(optimize(analyze(parse(fixture.source))));
			assert.deepEqual(actual, fixture.expected);
		});
	}
});

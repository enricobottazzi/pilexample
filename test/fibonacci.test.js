const assert = require("assert");
const path = require("path");
const { FGL, starkSetup, starkGen, starkVerify } = require("pil-stark");
const { newConstantPolsArray, newCommitPolsArray, compile, verifyPil } = require("pilcom");

const smFibonacci = require("../src/fibonacci.js");

describe("test fibonacci sm", async function () {
    let constPols;
    let cmPols;
    let pil;

    this.timeout(10000000);

    it("It should create the pols main", async () => {

        // compile the pil
        pil = await compile(FGL, path.join(__dirname, "..", "src", "fibonacci.pil"));
        // generate a placeholder for the polynomial. Creating an empty array. 
        constPols =  newConstantPolsArray(pil);

        // call buildConstants
        await smFibonacci.buildConstants(constPols.Fibonacci);

        // we now have the constant polynomial filled up.

        // Similar step. We create the placeholder for the polynomial
        cmPols = newCommitPolsArray(pil);

        // We call the program to generate the polynomials. This will fill the 2 remaining committed polynomial
        const result = await smFibonacci.execute(cmPols.Fibonacci, [1,2]);
        console.log("Result: " + result);

        // Here's the way to verify that the polynomial fullfils that specific prime field.
        const res = await verifyPil(FGL, pil, cmPols , constPols);

        if (res.length != 0) {
            console.log("Pil does not pass");
            for (let i=0; i<res.length; i++) {
                console.log(res[i]);
            }
            assert(0);
        }

        // We built everything at this point
    });

    // Generate a proof that the polynomial that I just committed fulfils the rule using a stark.
    it("It should generate and verify the stark", async () => {

    // Need to setup the stark. 
        const starkStruct = {
            nBits: 10,
            nBitsExt: 14,
            nQueries: 32,
            verificationHashType : "GL",
            steps: [
                {nBits: 14},
                {nBits: 9},
                {nBits: 4}
            ]
        };

        // generate constant part of the Stark
        const setup = await starkSetup(constPols, pil, starkStruct);

        // Here's where we are actually generating the proof. We need the committed polynomials too.
        const resP = await starkGen(cmPols, constPols, setup.constTree, setup.starkInfo);

        // publics will be the output of the Fibonacci series. 
        const resV = await starkVerify(resP.proof, resP.publics, setup.constRoot, setup.starkInfo);
        assert(resV==true);
});

});

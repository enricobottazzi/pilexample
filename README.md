# Pil Example

Let's start. 

step 1 => Building circuit with circom. Similar to write electronic circuits with inputs, gates and intermediary signals. It needs a constraint system (written in r1cs). 

The problem is that you need to design in advance all the possible signals. Impossible for the zkEVM. 

step 2 => Introduce the concept of a clock. Generates a state machine that processes the signal every time. To do that we need to define relationship between states. Pil needed 4 that. 

## How to design processors in PIL

Fibonacci behaves like a state machine. It works with Goldilock prime field. 

Given a number (a1024) I want to prove you that I know two nubmbers, that, if applied the fibonacci series 1024 times I will get to an output. 

To write in Pil we need to convert the problem in a state machine. 

BeforeLast column are the evaluations of the polynomial beforeLast(x) at the root of unity of that Finite Field. Roots of unity are the x column. 

The polynomial is defined everywhere, not necessary to choose the root of unity. The root of unity is cool because is easier for us to convert from the evaluations to the coefficient format using a npt operation (?). That's why we use the root of unity. 

- Now Defined constaint system that the state machine system must fullfil. What we need now? 

1. Build the Const ISLAST polynomial.
2. Executor => program to build the execution trace. (check fibonacci.js)

That's all we need to design a state machine. 

## Generate a proving system to do that

Check fibonacci.test.js

## Permutation Checks. 

Check that two polynomials are one the permutation of the other. The evaluation of the a(x) are equal to the evaluations of the second polynomials just inverted. we just need to say `a is b`.

## Plookup check

Values of the first polynomials are included in the second polynomial. `a in b`. 


We have different registries. One at t=0, one at t=1. We need to create instructions to go from state 0 to state 1. 
The processor takes values from register 0 (A for examples) and move to register 1 (A' for example). I design an equation to evaluate how to compute A between 2 different states. In pilcom I need to define the rules to move between two different states.

For example, ROM defines the instructions that I want to execute and the rules to be respected inside my state machine. These polynomial constant. 
The ROM is what Jesus works on. The rom is written in Assembly Language. 

On the left, execution Trace, there are the committed polynomials. Here's where the execution actually happen, the one that contains several variables.  

- Build the processor (left side of the illustation)
- Build the ROM (it emulates EThereum - written in WASM - define the rules - right side of the illustration)

## Generate the proof

We see how to generate the pil and how to build on pil. Now let's focus on the Recursion part of this. Check PIL Example 2 for that. 

We are now building a circom circuit. We start from a circom program (pilexample_plonk repo). We want to build a stark in circom. which are the steps?

- compile circom fibonacci.circom. 
- Build the witness computation (just using snarkJS). Need to pass the input.json file. 
- Generate the pil starting from circom. We generate the constant file. Setup a system in PIL that is equivalent to the original circom file. We have the constants and we have the setup => We now have the PIL and the constant file
- Let's now fill the committed polynomials. We need the stark exec file and the witness in order to do that and the original pil file. We generate the fibonacci.commit => We now have the committed polynomial
- We can now verify if it actually fits. Command `pil_verify`. Checking that the constraint system is fine. 
- Let's now generate the stark. Setup the stark at first. We need the startkstruct in order to do that. => It will output the verification key for the stark. 
- Let's build the stark proof. We actually output the proof in a format that can be used inside another circom circuit. `zkin.json`. The public input is the result of the fibonacci series
- Verify the stark. Starting from the proof the public inputs and the verifcation key. 
- This is a stark. Now I want to build another circom circiut that verifies this proof. This is the recursion. Verifying a stark inside a circiut. It automatically generates a circom verifier.circom. This is a circiut that verifies stark. This circuit gets the proof in the format `zkin.json`. This is also takes an extra input that is an ethereum address of the verifier (?).
- Compile this new circuit as usual using circom
Now we can take snarkjs usually for generating the proof. 
- Last step. => I generate a SNARK as I want to verify inside a smart contract.

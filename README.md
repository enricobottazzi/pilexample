# Pil Example

### Why we need PIL?

How we build zk programs today? 

We build circuits with circom. Similar to write electronic circuits with inputs, gates and intermediary signals. It needs a constraint system (written in r1cs).  

The problem is that you need to design in advance all the possible signals. Impossible for the zkEVM. 

Instead a circuit that always goes forward. We can create a circuit that works such as clock (similar to an hardware). *Pil* allows to create circuit with a state machine inside. The processor always executes the same electronics and processes tha signal every cycle of the clock.

Ethereum options are really variable. Circom works with determinstic circuit. Set up all the possibilities in circom that can potentially be executed. You need to build circuits that are super big becuase you need to take into account all the possible options that can be delivered inside a transaction. 

Using pil is possible to pre-define different way of executing the computation for each ethereum opcode. It kinda creates a processor for every ethereum opcode. We then create a "main" circuit that contains pointers to the different processors.

## How to design processors in PIL - Fibonacci Example

Fibonacci behaves like a state machine. It works with Goldilock prime field. 

Given a number (1024) I want to prove you that I know two nubmbers, that, if applied the fibonacci series 1024 times I will get to an output.

### Define the rules - constraint system that the state machine must fullfil

To write in Pil we need to convert the problem in a state machine. We need to define the rules to be executed inside a processor, namely how to behave for each state transtion, how to behave inside a clock round.

<ADD IMAGE OF TABLE FOR FIBONACCI STATES>

There are three polynomial here:

    pol constant ISLAST;             // 0,0,0,0,.....,1
    pol commit aBeforeLast, aLast;

ISLAST is a constant pre computed polynomial, while aBeforeLast and aLast are not compiled yet. They will be committed while executing the computation.

We have two registers. We execute a state transition function here between different registers. Each register is a polynomial and gets updated every round on the clock. BeforeLast column are the **evaluations** of the polynomial beforeLast(x) at the root of unity of that Finite Field (?). Roots of unity are the X column. 

The polynomial is defined everywhere, not necessary to choose the root of unity points, we can actually choose whatever number we want. The root of unity is cool because is easier for us to convert from the evaluations to the coefficient format using a npt operation (or Lagrange Interpolation)(?). That's why we use the root of unity. 

We have now defined the constraint system that the state machine system must fullfil. What we need now? 

1. Build the constant ISLAST polynomial. `buildConstants`
2. Execute the program and commit to the 2 polynomials. `execute` 

    I start to fill the execution trace here (What are we doing here?)

=> This is performed inside `fibonacci.js`

That's all we need to design a state machine. 

## Generate a proving system to do that

Now the system is ready. I just need to generate a proof for that. 

Check fibonacci.test.js. Here I'm creating the stark setup, generating the proof and veryfing it.


# Other things that you can do with Pil

**Permutation Checks**

Check that two polynomials are one the permutation of the other. The evaluation of the a(x) are equal to the evaluations of the second polynomials just inverted. we just need to say `a is b`.

**Plookup check**

Values of the first polynomials are included in the second polynomial. `a in b`. 

## How to build a zkEVM using PIL

We have different registries. One at t=0, one at t=1. We need to create instructions to go from state 0 to state 1. 
The processor takes values from register 0 (A for examples) and move to register 1 (A' for example). I design an equation to evaluate how to compute A between 2 different states. In pilcom I need to define the rules to move between two different states.

For example, ROM defines the instructions that I want to execute and the rules to be respected inside my state machine. These polynomial constant. 
The ROM is what Jesus works on. The rom is written in Assembly Language. 

On the left, execution Trace, there are the committed polynomials. Here's where the execution actually happen, the one that contains several variables.  

- Build the processor (left side of the illustation)
- Build the ROM (it emulates EThereum - written in WASM - define the rules - right side of the illustration)

## Verify a STARK using circom

We see how to generate the pil and how to build on pil. Now let's focus on the Recursion part of this. Check PIL Example 2 for that. 

We are now building a circom circuit. We write the fibonacci circuit in circom. We start from a circom program (pilexample_plonk repo). We want to build a stark in circom. which are the steps?

- compile circom fibonacci.circom. 
- Build the witness computation (just using snarkJS). Need to pass the input.json file. 
- Generate the pil starting from circom. We generate the constant file. Setup a system in PIL that is equivalent to the original circom file. We have the constants and we have the setup => We now have the PIL and the constant file
- Let's now fill the committed polynomials. We need the stark exec file and the witness in order to do that and the original pil file. We generate the fibonacci.commit => We now have the committed polynomial
- We can now verify if it actually fits. Command `pil_verify`. Checking that the constraint system is fine. 
- Let's now generate the stark. Setup the stark at first. We need the startkstruct in order to do that. => It will output the verification key for the stark. 
- Let's build the stark proof. We actually output the proof in a format that can be used inside another circom circuit. `zkin.json`. The public input is the result of the fibonacci series
- Verify the stark. Starting from the proof the public inputs and the verifcation key. 
- This is a stark. Now I want to build another circom circiut that verifies this proof. This is the recursion. Verifying a stark inside a circiut. It automatically generates a circom verifier.circom. This is a circiut that verifies stark. This circuit gets the proof in the format `zkin.json`. This is also takes an extra input that is an ethereum address of the prover. I add it as an input because I don't want someone else to steal the transaction, submit the proof and get compensated. The Verifier Smart Contract will check that the msg.sender of the proof is the address included as public input in the proof.
- Compile this new circuit as usual using circom
Now we can take snarkjs usually for generating the proof. 
- Last step. => I generate a SNARK as I want to verify inside a smart contract. I can do that using snarkjs

<!-- omit in toc -->
# Specifications

<!-- omit in toc -->
## Table of contents
- [Definitions](#definitions)
  - [Engine](#engine)
  - [Loader](#loader)
  - [Framework](#framework)
  - [Native Library](#native-library)
  - [Native Binding](#native-binding)
  - [Execution Context](#execution-context)
  - [Source](#source)
  - [Persistent Source](#persistent-source)
  - [Main Stack](#main-stack)
  - [Auxiliary Stack](#auxiliary-stack)
  - [Source Address](#source-address)
  - [Stack Address](#stack-address)
  - [Frame Pointer](#frame-pointer)
  - [Literal](#literal)
- [Naming convention](#naming-convention)
- [Calling convention](#calling-convention)
  - [Caller](#caller)
  - [Callee](#callee)
- [Standard libraries](#standard-libraries)
  - [`stdlib:commands`](#stdlibcommands)
    - [`call`](#call)
    - [`enter`](#enter)
    - [`frame`](#frame)
    - [`goto`](#goto)
    - [`if`](#if)
    - [`leave`](#leave)
    - [`local`](#local)
    - [`return`](#return)
    - [`while`](#while)

## Definitions

### Engine

An <dfn>engine</dfn> implements the core language. It includes the interpreter
and the standard library. [This project](https://github.com/esdmr/stakr) is an
engine.

### Loader

A <dfn>loader</dfn> provides the procedures to resolve and to load a
source. The default loader provides a bare-bones implementation without touching
the file system.

### Framework

A <dfn>framework</dfn> provides functionality and integration for the engine.
Frameworks can provide native bindings or libraries to the engine and will
provide the source code to execute via Loaders.

### Native Library

A <dfn>native library</dfn> provides either functionality which is not present
via the standard library or a faster implementation of a function written in the
native language of the engine.

### Native Binding

A <dfn>native binding</dfn> is a special native library which provides
one-to-one definitions for the functions, parameters, return values, and other
details of a library or framework written in the native language (not to be confused with a
native library).

### Execution Context

An <dfn>execution context</dfn> (<abbr>context</abbr> for short) contains
information about the context of the source files. This information includes:

- List of sources currently loaded,
- List of persistent sources,
-

### Source

A <dfn>source</dfn> contains information about a source file. This information
includes:

- The name,
- The AST tree,
- The assembly data,
- And the link data.

### Persistent Source

A <dfn>persistence</dfn> is mark given by the context to the source, which
declares that source to be imported to every other source without any prefix
similar to a global library (e.g., `stdlib:commands`).

### Main Stack

The <dfn>main stack</dfn> (<abbr>main</abbr> for short) is a LIFO stack array.
It is used to store arguments and return values for functions and commands.
Literals are pushed to this stack. Popping will cause the stack to shrink.

### Auxiliary Stack

The <dfn>auxiliary stack</dfn> (<abbr>aux</abbr> for short) is a secondary LIFO
stack array. It is used to store function return offsets, and previous frame
pointers. It is limited to a maximum of 1024 (2\^10) elements by default. This
limit may be changed or withdrawn in later versions of the specification. It can
not be accessed through the standard commands.

### Source Address

A <dfn>source address</dfn> (<abbr>offset</abbr> for short) is an unsigned
integer representing an index within the source array. It starts at 0. Offsets
may not have equal values in different implementations.

### Stack Address

A <dfn>stack address</dfn> (<abbr>address</abbr> for short) is a signed integer
representing an index within a stack. If a negative value is provided, its
absolute value is used for referencing.

### Frame Pointer

The <dfn>frame pointer</dfn> is an address representing an index within a stack.
It is useful for accessing function parameters and locals using two separate
commands `frame` and `local`. New frame pointers can be created using the
`enter` and `leave` commands.

### Literal

        A <dfn>literal</dfn> is a fixed constant value. A literal can have any
        of the following types:

- String (Array of Unicode characters)
- Number (64-bit binary floating-point)
- Boolean
- Null (empty value)


## Naming convention

Note that the following does not apply for native bindings.

- Operator: `get`, `getThing`. Lower camel case.
- Subroutine: `Get`, `GetThing`. Pascal case.
- Constant: `E_`, `PI`, `EMPTY_STRING`. Upper snake case. Single letter
  constants must be postfixed with an underline to differentiate them with a
  single letter subroutine.
- Label: `loop_`, `end_loop`. Lower snake case. Single-word labels must be
  postfixed with an underline to differentiate them with a single word operator.
- Type: `Array_`, `Array_Iterator`. Title snake case. It can not be a single
  letter or series of single letters separated by underline. Single-word types must
  be postfixed with an underline to differentiate them with a single word
  subroutine.

## Calling convention

### Caller

- If not constant, push arguments to the stack.
- Call function
- Use and then optionally pop the return value. Return type may be provided
  through `:Return_`.
- If subroutine, pop the parameters. Parameter type may be provided through
  `:Parameter_`.

### Callee

- Optionally `enter`.
- …
- If operator, replace parameters with the return value, popping any locals.
- `leave` if necessary.
- Return.

## Standard libraries

### `stdlib:commands`

This library should be loaded as a persistent source.

#### `call`

- Let <var>S</var> be `pop()`.
- Assert: <var>S</var> is a source name.
- Let <var>O</var> be `pop()`.
- Assert: <var>O</var> is a valid offset.
- `auxPush(offset, sourceName)`.
- Jump to <var>O</var> at source <var>S</var>.

#### `enter`

- `auxPush(framePointer)`.
- Set frame pointer to `length(stack)`.

#### `frame`

- Assert: frame pointer is a valid safe integer.
- Assert: frame pointer is not less than or equal to zero.
- Assert: frame pointer is not more than `length(stack)`.
- `push(1 - frame pointer)`.
- Note: The expression `frame pointer - 1` is inverted to correctly specify the
  growth direction of the function parameter array.

#### `goto`

- Let <var>S</var> be pop().
- Assert: <var>S</var> is a source name.
- Let <var>O</var> be pop().
- Assert: <var>O</var> is a valid offset.
- Jump to <var>O</var> at source <var>S</var>.

#### `if`

- Let <var>C</var> be pop().
- Assert: <var>C</var> is a Boolean.
- If <var>C</var>, then
  - Let <var>S</var> be pop().
  - Assert: <var>S</var> is a source name.
  - Let <var>O</var> be pop().
  - Assert: <var>O</var> is a valid offset.
- Else,
  - Forward to [`goto`](#goto).

#### `leave`

- Let <var>F</var> be aux pop().
- Assert: frame pointer is a valid safe integer.
- Assert: frame pointer is not less than or equal to zero.
- Set frame pointer to <var>F</var>.

#### `local`

- Assert: frame pointer is a valid safe integer.
- Assert: frame pointer is not more than length(stack).
- Push(frame pointer).
- Note: the expression (frame pointer) is positive, which correctly specifies the
  growth direction of the function locals array.

#### `return`

- Let <var>S</var> be aux pop().
- Assert: <var>S</var> is a valid source name.
- Let <var>O</var> be aux pop().
- Assert: <var>O</var> is a valid offset.
- Jump to <var>O</var> at source <var>S</var>.

#### `while`

- Forward to [`If`](#if).

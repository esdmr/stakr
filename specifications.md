# Specifications

<!-- omit in toc -->
## Table of contents
- [Specifications](#specifications)
	- [Internal API](#internal-api)
		- [Definitions](#definitions)
			- [Stack](#stack)
			- [Auxiliary Stack](#auxiliary-stack)
			- [Offset](#offset)
			- [Literal](#literal)
		- [Commands](#commands)
			- [`call`](#call)
			- [`if`](#if)
			- [`goto`](#goto)
			- [`while`](#while)
			- [`return`](#return)

## Internal API

### Definitions

#### Stack
A LIFO [stack][wp-stack] array. The stack pointer is equal to the length of the
stack array. Used to store arguments and return values for functions and
commands. Literals will be pushed to the stack.

[wp-stack]: https://en.wikipedia.org/wiki/Stack_(abstract_data_type)

#### Auxiliary Stack
(Aux for short) A secondary LIFO stack array. Used to store function call return
[offset](#offset)s and internal function variables.

#### Offset
A unsigned integer representing the index within the source array. Starts at 0.

#### Literal
A fixed constant value stored in [stack](#stack) or [aux](#auxiliary-stack).
Every literal is stored in a single index of stack. An implementation may use a
pointer in the stack refering to the literal in the [heap][wp-heap]. A literal
can have any of the following types:

- String (Array of unicode characters)
- Number (64-bit binary float)
- Boolean
- Null (empty value)

[wp-heap]: https://en.wikipedia.org/wiki/Memory_management#HEAP

### Commands

#### `call`
Pushes the current [offset](#offset) to the [Aux](#auxiliary-stack) and jumps to
a given offset. The offset may also be outside of the current source.

It pops a value from the [stack](#stack).
- If this value is a string, it will be used as the target source. It will then
  pop a value from the stack — aborting if it is not a valid offset — and jump
  to that source and offset.
- If however this value is a number, — aborting if it is not a valid
  [offset](#offset) — it will jump to that offset in the current source.
- Otherwise it will abort.

#### `if`
Conditionally jumps to a given [offset](#offset) if a given boolean is false.

It pops two values from the [stack](#stack) — aborting if they are not, in
order: a boolean, and a valid offset. If the boolean is false, it jumps to the
offset.

#### `goto`
Jumps to a given [offset](#offset) in the current source.

It pops a value from the [stack](#stack) — aborting if it is not a valid offset
— and will jump to that offset value.

#### `while`
During assembly and execution it operates similiarly to [if](#if) command. During
parsing it will convert the end of block to end of while.

#### `return`
Jumps to the last [offset](#offset) in the [aux](#auxiliary-stack).

It pops a value from the aux.
- If this value is a string, it will be used as the target source. It will then
  pop another value from the aux — aborting if it is not a valid offset — and
  jump to that source and offset.
- If however this value is a number, — aborting if it is not a valid
  [offset](#offset) — it will jump to that offset in the current source.
- Otherwise it will abort.

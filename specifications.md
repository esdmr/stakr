<!-- omit in toc -->
# Specifications

<!-- omit in toc -->
## Table of contents
- [Definitions](#definitions)
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

<dl>
    <dt>Main Stack</dt>
    <dd>
        The <dfn>main stack</dfn> (<abbr>main</abbr> for short) is a LIFO stack
        array. It is used to store arguments and return values for functions and
        commands. Literals are pushed to this stack. Popping will cause the
        stack to shrink.
    </dd>
    <dt>Auxiliary Stack</dt>
    <dd>
        The <dfn>auxiliary stack</dfn> (<abbr>aux</abbr> for short) is a
        secondary LIFO stack array. It is used to store function return offsets,
        and previous frame pointers. It is limited to a maximum of 1024
        (2\^10) elements by default. This limit may be changed or withdrawn in
        later versions of the specification. It can not be accessed through the
		standard commands.
    </dd>
    <dt>Source Address</dt>
    <dd>
        The <dfn>source address</dfn> (<abbr>offset</abbr> for short) is an
        unsigned integer representing an index within the source array. It
        starts at 0. Offsets may not have equal values in different
        implementations.
    </dd>
    <dt>Stack Address</dt>
    <dd>
        The <dfn>stack address</dfn> (<abbr>address</abbr> for short) is a
        signed integer representing an index within a stack. If a negative value
		is provided, its absolute value is used for referencing.
    </dd>
    <dt>Frame Pointer</dt>
    <dd>
        The <dfn>frame pointer</dfn> is an address representing an index within
        a stack. It is useful for accessing function parameters and locals using
		two seperate commands <code>frame</code> and <code>local</code>. New
		frame pointers can be created using the <code>enter</code> and
		<code>leave</code> commands.
    </dd>
    <dt>Literal</dt>
    <dd>
        A <dfn>literal</dfn> is a fixed constant value. A literal can have any
        of the following types:
        <ul>
            <li>String (Array of unicode characters)</li>
            <li>Number (64-bit binary floating-point)</li>
            <li>Boolean</li>
            <li>Null (empty value)</li>
        </ul>
    </dd>
</dl>

## Naming convention

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

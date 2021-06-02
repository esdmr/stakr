<!-- omit in toc -->
# Specifications

<!-- omit in toc -->
## Table of contents
- [Internal API](#internal-api)
  - [Definitions](#definitions)
  - [Commands](#commands)
    - [`call`](#call)
    - [`goto`](#goto)
    - [`if`](#if)
    - [`return`](#return)
    - [`while`](#while)

## Internal API

### Definitions

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
        and internal function variables. It is limited to a maximum of 1024
        (2\^10) elements by default. This limit may be changed or withdrawn in
        later versions of the specification.
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
        signed integer representing an index within a stack. The stack is
        implied through operators. If a negative value is provided, the length
        of that stack will be added. If the address is out of bounds, it will
        abort.
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

### Commands

#### `call`
- Let <var>SO</var> be pop().
- If <var>SO</var> is a String, then
  - Let <var>S</var> be <var>SO</var>.
  - Let <var>O</var> be pop().
  - Assert: <var>O</var> is a valid offset.
  - xmove(nextOffset).
  - xmove(sourceName).
  - Jump to <var>O</var> at source <var>S</var>.
- Else,
  - Let <var>O</var> be <var>SO</var>.
  - Assert: <var>O</var> is valid offset.
  - xmove(nextOffset).
  - Jump to <var>O</var>.

#### `goto`
- Let <var>SO</var> be pop().
- If <var>SO</var> is a String, then
  - Let <var>S</var> be <var>SO</var>.
  - Assert: <var>S</var> is a valid source name.
  - Let <var>O</var> be pop().
  - Assert: <var>O</var> is a valid offset.
  - Jump to <var>O</var> at source <var>S</var>.
- Else,
  - Let <var>O</var> be <var>SO</var>.
  - Assert: <var>O</var> is valid offset.
  - Jump to <var>O</var>.

#### `if`
- Let <var>C</var> be pop().
- Assert: <var>C</var> is a Boolean.
- If <var>C</var>, then
  - Let <var>SO</var> be pop().
  - If <var>SO</var> is a String, then
    - Assert: <var>SO</var> is a valid source name.
    - Assert: pop() is a valid offset.
  - Else,
    - Assert: <var>SO</var> is valid offset.
- Else,
  - Forward to [`goto`](#goto)

#### `return`
- Let <var>SO</var> be xpop().
- If <var>SO</var> is a String, then
  - Let <var>S</var> be <var>SO</var>.
  - Assert: <var>S</var> is a valid source name.
  - Let <var>O</var> be xpop().
  - Assert: <var>O</var> is a valid offset.
  - Jump to <var>O</var> at source <var>S</var>.
- Else,
  - Let <var>O</var> be <var>SO</var>.
  - Assert: <var>O</var> is valid offset.
  - Jump to <var>O</var>.

#### `while`
- Forward to [`If`](#if)
